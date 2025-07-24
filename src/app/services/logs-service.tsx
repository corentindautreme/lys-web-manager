import {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    DescribeLogStreamsCommandOutput,
    GetLogEventsCommand,
    GetLogEventsCommandOutput
} from '@aws-sdk/client-cloudwatch-logs';
import { LogEvent, LogsByProcess } from '@/app/types/logs';
import { ProcessStatuses } from '@/app/types/status';
import { isWithinSeason } from '@/app/utils/lys-utils';

const LYS_PUBLISHER_LAMBDA_NAME = 'Lys';
const LYS_TRIGGER_LAMBDA_NAME = 'LysTrigger';

export const EXPECTED_PUBLISHERS = ['daily|bluesky', 'daily|threads', 'daily|twitter', '5min|bluesky', '5min|threads', '5min|twitter', 'weekly|bluesky', 'weekly|threads', 'weekly|twitter'];
export const EXPECTED_TRIGGERS = ['daily|trigger', '5min|trigger', 'weekly|trigger'];

const EXPECTED_DOWNTIME_IN_HOURS_BY_PROCESS: { [process: string]: number } = {
    'daily|bluesky': 17,
    'daily|threads': 17,
    'daily|twitter': 17,
    '5min|bluesky': 18,
    '5min|threads': 18,
    '5min|twitter': 18,
    'weekly|bluesky': 7 * 24,
    'weekly|threads': 7 * 24,
    'weekly|twitter': 7 * 24,
    'fetcher': 24,
    'dump': 24,
    'refresh': 24 * 31,
    'daily|trigger': 17,
    '5min|trigger': 18,
    'weekly|trigger': 7 * 24
}

export function getLysProcessStatuses(): ProcessStatuses {
    return {
        'daily|trigger': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.005Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'Dry-run - skipping the triggering of lambdas'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: '{"stage": "Heat 1", "watchLinks": [{"accountRequired": 0, "replayable": 1, "castable": 1, "channel": "SVT1", "link": "https://www.svtplay.se/video/jqWY5xb/melodifestivalen/deltavling-1", "comment": "Recommended link", "geoblocked": 0, "live": 1}], "id": 358, "name": "Melodifestivalen", "country": "Sweden", "endDateTimeCet": "2025-02-01T21:30:00", "dateTimeCet": "2025-02-01T20:00:00"}'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Loaded 1 event(s)'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'daily|trigger'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }],
            lastRun: '1970-01-01T00:00:00.005Z',
            isLate: false
        },
        'daily|bluesky': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.014Z',
                    message: 'END RequestId:  00000001-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.013Z',
                    message: 'REPORT RequestId:  00000001-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.012Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.011Z', message: 'daily|bluesky'},
                {
                    timestamp: '1970-01-01T00:00:00.010Z',
                    message: 'START RequestId: 00000001-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                },
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'daily|bluesky'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.014Z',
            isLate: false
        },
        'daily|twitter': {
            success: false,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {timestamp: '1970-01-01T00:00:00.002Z', message: 'Oh no! Look! An Error log!'},
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'daily|twitter'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'daily|threads': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'daily|threads'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'weekly|trigger': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.005Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'Dry-run - skipping the triggering of lambdas'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: '{"stage": "Heat 1", "watchLinks": [{"accountRequired": 0, "replayable": 1, "castable": 1, "channel": "SVT1", "link": "https://www.svtplay.se/video/jqWY5xb/melodifestivalen/deltavling-1", "comment": "Recommended link", "geoblocked": 0, "live": 1}], "id": 358, "name": "Melodifestivalen", "country": "Sweden", "endDateTimeCet": "2025-02-01T21:30:00", "dateTimeCet": "2025-02-01T20:00:00"}'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Loaded 1 event(s)'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'weekly|trigger'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.005Z',
            isLate: false
        },
        'weekly|bluesky': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'weekly|bluesky'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'weekly|twitter': {
            success: false,
            logs: [],
            isLate: true
        },
        'weekly|threads': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'weekly|threads'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        '5min|trigger': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:05:00.005Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:05:00.004Z',
                    message: 'Dry-run - skipping the triggering of lambdas'
                },
                {
                    timestamp: '1970-01-01T00:05:00.003Z',
                    message: '{"stage": "Heat 1", "watchLinks": [{"accountRequired": 0, "replayable": 1, "castable": 1, "channel": "SVT1", "link": "https://www.svtplay.se/video/jqWY5xb/melodifestivalen/deltavling-1", "comment": "Recommended link", "geoblocked": 0, "live": 1}], "id": 358, "name": "Melodifestivalen", "country": "Sweden", "endDateTimeCet": "2025-02-01T21:30:00", "dateTimeCet": "2025-02-01T20:00:00"}'
                },
                {
                    timestamp: '1970-01-01T00:05:00.002Z',
                    message: 'Loaded 1 event(s)'
                },
                {timestamp: '1970-01-01T00:05:00.001Z', message: '5min|trigger'},
                {
                    timestamp: '1970-01-01T00:05:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                },
                {
                    timestamp: '1970-01-01T00:00:00.005Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'Dry-run - skipping the triggering of lambdas'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: '{"stage": "Heat 1", "watchLinks": [{"accountRequired": 0, "replayable": 1, "castable": 1, "channel": "SVT1", "link": "https://www.svtplay.se/video/jqWY5xb/melodifestivalen/deltavling-1", "comment": "Recommended link", "geoblocked": 0, "live": 1}], "id": 358, "name": "Melodifestivalen", "country": "Sweden", "endDateTimeCet": "2025-02-01T21:30:00", "dateTimeCet": "2025-02-01T20:00:00"}'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Loaded 1 event(s)'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: '5min|trigger'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.005Z',
            isLate: false
        },
        '5min|bluesky': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: '5min|bluesky'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        '5min|twitter': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: '5min|twitter'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        '5min|threads': {
            success: true,
            logs: [
                {
                    timestamp: '1970-01-01T00:00:00.004Z',
                    message: 'END RequestId:  00000000-ffff-ffff-ffff-abcdef012345'
                },
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId:  00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 128 MB Max Memory Used: 89 MB'
                },
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'Run date 1970-01-01T00:00:00 is without NF season range - exiting'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: '5min|threads'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'fetcher': {
            success: true,
            logs: [
                {timestamp: '1970-01-01T00:00:00.004Z', message: 'END RequestId: 00000000-ffff-ffff-ffff-abcdef012345'},
                {
                    timestamp: '1970-01-01T00:00:00.003Z',
                    message: 'REPORT RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Duration: 4.00 ms Billed Duration: 4 ms Memory Size: 256 MB Max Memory Used: 101 MB Init Duration: 1096.83 ms'
                },
                {timestamp: '1970-01-01T00:00:00.002Z', message: 'Extracted suggestions:'},
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'Saved suggestions:'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'refresh': {
            success: true,
            logs: [
                {timestamp: '1970-01-01T00:00:00.003Z', message: 'END RequestId: 00000000-ffff-ffff-ffff-abcdef012345'},
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'REPORT RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Duration: 3.00 ms Billed Duration: 3 ms Memory Size: 128 MB Max Memory Used: 81 MB Init Duration: 430.24 ms'
                },
                {timestamp: '1970-01-01T00:00:00.001Z', message: 'Refreshing token: ***XXXXXXXXXX'},
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 00000000-ffff-ffff-ffff-abcdef012345 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: false
        },
        'dump': {
            success: true,
            logs: [
                {timestamp: '1970-01-01T00:00:00.003Z', message: 'END RequestId: 68b58e08-8b90-4b2d-8da6-8a7edbfc2201'},
                {
                    timestamp: '1970-01-01T00:00:00.002Z',
                    message: 'REPORT RequestId: 68b58e08-8b90-4b2d-8da6-8a7edbfc2201 Duration: 3.00 ms Billed Duration: 3 ms Memory Size: 256 MB Max Memory Used: 82 MB Init Duration: 460.33 ms'
                },
                {
                    timestamp: '1970-01-01T00:00:00.001Z',
                    message: 'No diff between latest dump and current event list - nothing to do'
                },
                {
                    timestamp: '1970-01-01T00:00:00.000Z',
                    message: 'START RequestId: 68b58e08-8b90-4b2d-8da6-8a7edbfc2201 Version: $LATEST'
                }
            ],
            lastRun: '1970-01-01T00:00:00.004Z',
            isLate: true
        }
    }
}

function isBotProcess(process: string) {
    const splitProcess = process.split('|');
    return splitProcess.length == 2 && splitProcess[1] != 'trigger';
}

function isLate(process: string, logs: LogEvent[]) {
    const limitDate = new Date();
    // if it's a bot process and we're out of season => it's not late
    if (isBotProcess(process) && !isWithinSeason(limitDate)) {
        return false;
    }
    if (logs.length == 0) {
        return true;
    }
    limitDate.setTime(limitDate.getTime() - EXPECTED_DOWNTIME_IN_HOURS_BY_PROCESS[process] * 3_600_000);
    const lastRun = logs[logs.length - 1].timestamp
    return lastRun < limitDate.toISOString();
}

export async function fetchLysProcessStatuses(): Promise<ProcessStatuses> {
    try {
        return Promise.all([
            fetchLysPublisherLogs(
                LYS_PUBLISHER_LAMBDA_NAME,
                /(daily|weekly|5min)\\|(bluesky|threads|twitter)/,
                EXPECTED_PUBLISHERS
            ),
            fetchLysPublisherLogs(
                LYS_TRIGGER_LAMBDA_NAME,
                /(daily|weekly|5min)\|trigger/,
                EXPECTED_TRIGGERS
            ),
            fetchLogsForLambda('LysEventFetcher').then(logs => ({'fetcher': logs} as LogsByProcess)),
            fetchLogsForLambda('LysRefresh').then(logs => ({'refresh': logs} as LogsByProcess)),
            fetchLogsForLambda('LysDump').then(logs => ({'dump': logs} as LogsByProcess))
        ]).then(allLogsByProcess => {
            const logsByProcess: LogsByProcess = Object.assign({}, ...allLogsByProcess);
            const statuses: ProcessStatuses = {};
            Object.keys(logsByProcess).forEach(process => statuses[process] = {
                success: logsByProcess[process].length > 0 && !logsByProcess[process].some(e => e.message.toLowerCase().includes('error')),
                logs: logsByProcess[process].toSorted((e1, e2) => e2.timestamp.localeCompare(e1.timestamp)),
                lastRun: logsByProcess[process].length == 0 ? undefined : logsByProcess[process][logsByProcess[process].length - 1].timestamp,
                isLate: isLate(process, logsByProcess[process])
            });
            return statuses;
        });
    } catch (error) {
        throw error;
    }
}

export async function fetchLogsForLambda(lambda: string, logStreamPrefix?: string): Promise<LogEvent[]> {
    try {
        const client = new CloudWatchLogsClient({
            region: 'eu-west-3',
        });
        const res: DescribeLogStreamsCommandOutput = await client.send(new DescribeLogStreamsCommand({
            logGroupName: `/aws/lambda/${lambda}`,
            descending: true,
            orderBy: !logStreamPrefix ? 'LastEventTime' : undefined,
            logStreamNamePrefix: logStreamPrefix,
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

export function splitLogsByProcessHeader(logs: LogEvent[], headerPattern: RegExp) {
    // find where the run headers (e.g. daily|bluesky, weekly|threads...) are located, to split the logs of the Lys
    // lambda by Lys runs
    const headerIndices = logs.reduce((arr: number[], e, i) => {
        if (headerPattern.test(e.message)) {
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
    return logsByPublisher;
}

export async function fetchLysPublisherLogs(lambdaName: string, headerPattern: RegExp, expectedPublishers: string[]): Promise<LogsByProcess> {
    try {
        return fetchLogsForLambda(lambdaName
        ).then(logs => splitLogsByProcessHeader(logs, headerPattern)
            // ).then(logs => {
            //     // find where the run headers (e.g. daily|bluesky, weekly|threads...) are located, to split the logs of the Lys
            //     // lambda by Lys runs
            //     const headerIndices = logs.reduce((arr: number[], e, i) => {
            //         if (/(daily|weekly|5min)\\|(bluesky|threads|twitter)/.test(e.message)) {
            //             arr.push(i);
            //         }
            //         return arr;
            //     }, []);
            //     // drop last header (and subsequent logs) if the logs after it don't describe a full run
            //     const lastHeaderIndex = headerIndices[headerIndices.length - 1];
            //     let consideredLogs: LogEvent[];
            //     if (!logs.slice(lastHeaderIndex, logs.length).some(e => e.message.startsWith('REPORT'))) {
            //         consideredLogs = logs.slice(0, lastHeaderIndex)
            //         headerIndices.splice(headerIndices.length - 1);
            //     } else {
            //         consideredLogs = logs;
            //     }
            //     const logsByPublisher: LogsByProcess = {};
            //     headerIndices
            //         // create sub-windows of 2 indices
            //         // (the last index of the last window is defaulted to -1 if we've reached the end of the indices array and
            //         // can't close the last sub-window)
            //         .map((headerIndex, idx) => [headerIndex, idx < headerIndices.length - 1 ? headerIndices[idx + 1] : -1])
            //         // for each sub-window, build a {publisher: LogEvent[]} object
            //         .forEach(([from, to]) => {
            //             // there's always a "START RequestId..." log before the header => to catch all logs of a run, we
            //             // need to pick one log before the header, and drop one log before the next one
            //             const logs = consideredLogs.slice(from - 1, to == -1 ? consideredLogs.length : to - 1);
            //             const header = logs[1].message
            //             logsByPublisher[header] = header in logsByPublisher
            //                 ? [...logsByPublisher[header], ...logs]
            //                 : logs;
            //         });
            //     return logsByPublisher;
        ).then(logsByPublisher => {
            // }).then(logsByPublisher => {
            // if the logs of at least one weekly publisher are missing, "manually" fetch them at the expected date (last
            // sunday)
            if (Object.keys(logsByPublisher).filter(p => p.includes('weekly')).length < 3) {
                const lastSunday = new Date();
                lastSunday.setDate(lastSunday.getDate() + 1);
                if (lastSunday.getDay() != 0) {
                    lastSunday.setDate(lastSunday.getDate() - lastSunday.getDay());
                } else if (lastSunday.getHours() <= 17) {
                    lastSunday.setDate(lastSunday.getDate() - 7);
                }
                return fetchLysPublisherLogsForDateAndMode(lambdaName, lastSunday, 'weekly').then(weeklyPublisherLogs => {
                    return Object.assign(logsByPublisher, weeklyPublisherLogs);
                });
            } else {
                return logsByPublisher;
            }
        }).then(logsByPublisher => {
            // enrich with any expected but missing publisher
            expectedPublishers.forEach(publisher => {
                if (!(publisher in logsByPublisher)) {
                    logsByPublisher[publisher] = [];
                }
            });
            return logsByPublisher;
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchLysPublisherLogsForDateAndMode(lambdaName: string, date: Date, mode: 'daily' | '5min' | 'weekly'): Promise<LogsByProcess> {
    try {
        const logStreamPrefixForDate = date.toLocaleString('eu', {year: 'numeric', month: '2-digit', day: '2-digit'});
        return fetchLogsForLambda(lambdaName, logStreamPrefixForDate).then(logs => {
            // find where the run headers of the target mode (i.e. {mode}|{target}) are located
            const headerIndices = logs
                .reduce((arr: number[], e, i) => {
                    if (new RegExp(mode + '\\|(bluesky|threads|twitter|trigger)').test(e.message)) {
                        arr.push(i);
                    }
                    return arr;
                }, [])
                // inject the index of the next header, regardless of the mode: that's the end of the logs of the mode
                // we actually target
                .map(headerIndex => [headerIndex, logs.findIndex((e, idx) => idx > headerIndex && /(daily|weekly|5min)\\|(bluesky|threads|twitter)/.test(e.message))])
                .flat();
            // drop the last header if we wouldn't be able to extract a full weekly run out of it; namely, if we
            // extracted an uneven amount of run headers, it means we found the beginning of a weekly run, but not its
            // end
            if (headerIndices.length % 2 != 0) {
                headerIndices.splice(headerIndices.length - 1);
            }
            const logsByPublisher: LogsByProcess = {};
            headerIndices
                // create sub-windows of 2 indices
                // (the last index of the last window is defaulted to -1 if we've reached the end of the indices array and
                // can't close the last sub-window)
                // !NOTE: we only iterate over even indices, since we injected an "end" boundary that we don't want to
                // use as the start of the next window - hence the below filter
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter((headerIndex, idx) => idx % 2 == 0)
                .map((headerIndex, idx) => [headerIndex, 2 * idx < headerIndices.length - 1 ? headerIndices[2 * idx + 1] : -1])
                // for each sub-window, build a {publisher: LogEvent[]} object
                .forEach(([from, to]) => {
                    // there's always a "START RequestId..." log before the header => to catch all logs of a run, we
                    // need to pick one log before the header, and drop one log before the next one
                    const runLogs = logs.slice(from - 1, to == -1 ? logs.length : to - 1);
                    const header = runLogs[1].message
                    logsByPublisher[header] = runLogs;
                });
            return logsByPublisher;
        });
    } catch (error) {
        console.log(error);
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