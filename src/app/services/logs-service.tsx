import {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    DescribeLogStreamsCommandOutput,
    GetLogEventsCommand,
    GetLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs';
import { LogEvent, LogsByProcess, ProcessStatuses } from '@/app/types/logs';

const LYS_PUBLISHER_LAMBDA_NAME = 'Lys';

export const EXPECTED_PUBLISHERS = ["daily|bluesky", "daily|threads", "daily|twitter", "5min|bluesky", "5min|threads", "5min|twitter", "weekly|bluesky", "weekly|threads", "weekly|twitter"]

export async function fetchLysProcessStatuses(): Promise<ProcessStatuses> {
    try {
        return Promise.all([
            fetchLysPublisherLogs(),
            fetchLogsForLambda("LysEventFetcher").then(logs => ({"fetcher": logs} as LogsByProcess)),
            fetchLogsForLambda("LysRefresh").then(logs => ({"refresh": logs} as LogsByProcess)),
            fetchLogsForLambda("LysDump").then(logs => ({"dump": logs} as LogsByProcess))
        ]).then(allLogsByProcess => {
            const logsByProcess: LogsByProcess = Object.assign({}, ...allLogsByProcess);
            const statuses: ProcessStatuses = {};
            Object.keys(logsByProcess).forEach(process => statuses[process] = {
                success: logsByProcess[process].length > 0 && !logsByProcess[process].some(e => e.message.toLowerCase().includes("error")),
                logs: logsByProcess[process].toSorted((e1, e2) => e2.timestamp.localeCompare(e1.timestamp))
            });
            return statuses;
        });
    } catch (error) {
        throw error;
    }
}

export async function fetchLogsForLambda(lambda: string): Promise<LogEvent[]> {
    try {
        const client = new CloudWatchLogsClient({
            region: 'eu-west-3',
        });
        const res: DescribeLogStreamsCommandOutput = await client.send(new DescribeLogStreamsCommand({
            logGroupName: `/aws/lambda/${lambda}`,
            descending: true,
            orderBy: 'LastEventTime',
            limit: 10
        }));
        return Promise.all(res.logStreams!
            .reverse()
            .map(s => fetchLambdaLogsInLogStream(s.logStreamName!, lambda))
        ).then(fetchedLogs => fetchedLogs
            .flat()
            .filter(e => !e.message.startsWith('INIT_START'))
            .map(e => ({...e, message: e.message.trim()} as LogEvent))
            .sort((e1, e2) => e1.timestamp.localeCompare(e2.timestamp))
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function fetchLysPublisherLogs(): Promise<LogsByProcess> {
    try {
        return fetchLogsForLambda(LYS_PUBLISHER_LAMBDA_NAME).then(logs => {
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
            const logsByPublisher: LogsByProcess = {};
            headerIndices
                // create sub-windows of 2 indices
                // (the last index of the last window is defaulted to -1 if we've reached the end of the indices array and
                // can't close the last sub-window)
                .map((headerIndex, idx) => [headerIndex, idx < headerIndices.length - 1 ? headerIndices[idx + 1] : -1])
                // for each sub-window, build a {publisher: LogEvent[]} object
                .forEach(([from, to]) => {
                    // there's always a "START RequestId..." log before the header => to catch all logs of a run, we
                    // need to pick one log before the header, and drop one log before the next one
                    const logs = consideredLogs.slice(from - 1, to == -1 ? consideredLogs.length : to - 1);
                    const header = logs[1].message
                    logsByPublisher[header] = header in logsByPublisher
                        ? [...logsByPublisher[header], ...logs]
                        : logs;
                });
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