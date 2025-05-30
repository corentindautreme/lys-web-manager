import {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    DescribeLogStreamsCommandOutput,
    GetLogEventsCommand,
    GetLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs';
import { LogEvent } from '@/app/types/logs';

const LYS_PUBLISHER_LAMBDA_NAME = 'Lys';

export const EXPECTED_PUBLISHERS = ["daily|bluesky", "daily|threads", "daily|twitter", "5min|bluesky", "5min|threads", "5min|twitter", "weekly|bluesky", "weekly|threads", "weekly|twitter"]

export async function fetchLysPublisherLogs(): Promise<{ [publisher: string]: LogEvent[] }> {
    try {
        const client = new CloudWatchLogsClient({
            region: 'eu-west-3',
        });
        const res: DescribeLogStreamsCommandOutput = await client.send(new DescribeLogStreamsCommand({
            logGroupName: `/aws/lambda/${LYS_PUBLISHER_LAMBDA_NAME}`,
            descending: true,
            orderBy: 'LastEventTime',
            limit: 10
        }));
        return Promise.all(res.logStreams!
            .reverse()
            .map(s => fetchLambdaLogsInLogStream(s.logStreamName!, LYS_PUBLISHER_LAMBDA_NAME))
        ).then(fetchedLogs => fetchedLogs
            .flat()
            .filter(e => !e.message.startsWith('INIT_START'))
            .map(e => ({...e, message: e.message.trim()} as LogEvent))
        ).then(logs => {
            // find where the run headers (e.g. daily|bluesky, weekly|threads...) are located, to split the logs of the Lys
            // lambda by Lys runs
            const headerIndices = logs.reduce((arr: number[], e, i) => {
                if (/(daily|weekly|5min)\\|(bluesky|threads|twitter)/.test(e.message)) {
                    arr.push(i);
                }
                return arr;
            }, []);
            // drop last header (and subsequent logs) if the logs after it don't describe a full run
            const lastHeaderIndex = headerIndices[headerIndices.length - 1];
            let consideredLogs: LogEvent[];
            if (!logs.slice(lastHeaderIndex, logs.length).some(e => e.message.startsWith('REPORT'))) {
                consideredLogs = logs.slice(0, lastHeaderIndex)
                headerIndices.splice(headerIndices.length - 1);
            } else {
                consideredLogs = logs;
            }
            const logsByPublisher: { [publisher: string]: LogEvent[] } = {};
            // "flatten" a list of {publisher: LogEvent[]} objects into a single {publisher: LogEvent[]} object
            headerIndices
                // create sub-windows of 2 indices
                // (the last index of the last window is defaulted to -1 if we've reached the end of the indices array and
                // can't close the last sub-window)
                .map((headerIndex, idx) => [headerIndex, idx < headerIndices.length - 1 ? headerIndices[idx + 1] : -1])
                // for each sub-window, build a {publisher: LogEvent[]} object
                .forEach(([from, to]) => {
                    const logs = consideredLogs.slice(from, to == -1 ? consideredLogs.length : to);
                    const header = logs[0].message
                    logsByPublisher[header] = header in logsByPublisher
                        ? [...logsByPublisher[header], ...logs]
                        : logs;
                });
            // sort the logs of each publisher by timestamp (descending)
            Object.keys(logsByPublisher)
                .forEach(publisher => logsByPublisher[publisher]
                    .sort((e1, e2) => e2.timestamp.localeCompare(e1.timestamp)));
            // enrich with any expected but missing publisher
            EXPECTED_PUBLISHERS.forEach(publisher => {
                if (!(publisher in logsByPublisher)) {
                    logsByPublisher[publisher] = [];
                }
            })
            return logsByPublisher;
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchLambdaLogsInLogStream(logStream: string, lambda: string): Promise<LogEvent[]> {
    const client = new CloudWatchLogsClient({
        region: 'eu-west-3'
    });
    const request = {
        logGroupName: `/aws/lambda/${lambda}`,
        logStreamName: logStream,
        startFromHead: true
    };
    const logs: LogEvent[] = [];
    let lastToken: string | undefined = '';
    let nextToken = undefined;
    while (nextToken != lastToken) {
        lastToken = nextToken;
        const res: GetLogEventsCommandOutput = await client.send(new GetLogEventsCommand({
            ...request,
            nextToken: nextToken
        }));
        // if we get the same token, we've already loaded these logs
        // we'll break at the next iteration
        if (res.nextBackwardToken != lastToken && !!res.events) {
            logs.push(...res.events.map(e => {
                return {
                    timestamp: new Date(e.timestamp || 0).toISOString() || '',
                    message: e.message || ''
                } as LogEvent;
            }));
        }
        nextToken = res.nextBackwardToken;
    }
    return logs;
}