import { ProcessMetrics, UsageMetrics } from '@/app/types/metrics';
import { CloudWatchClient, Datapoint, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';

export function getUsageMetrics(): UsageMetrics {
    return {
        "previous_month_rcu": {
            "measurements": [
                {
                    "label": "Dec 1, 01:00 AM",
                    "value": 700
                },
                {
                    "label": "Dec 2, 01:00 AM",
                    "value": 1400
                },
                {
                    "label": "Dec 3, 01:00 AM",
                    "value": 2100
                },
                {
                    "label": "Dec 4, 01:00 AM",
                    "value": 2800
                },
                {
                    "label": "Dec 5, 01:00 AM",
                    "value": 3500
                },
                {
                    "label": "Dec 6, 01:00 AM",
                    "value": 4200
                },
                {
                    "label": "Dec 7, 01:00 AM",
                    "value": 4900
                },
                {
                    "label": "Dec 8, 01:00 AM",
                    "value": 5600
                },
                {
                    "label": "Dec 9, 01:00 AM",
                    "value": 6300
                },
                {
                    "label": "Dec 10, 01:00 AM",
                    "value": 7000
                },
                {
                    "label": "Dec 11, 01:00 AM",
                    "value": 7700
                },
                {
                    "label": "Dec 12, 01:00 AM",
                    "value": 8400
                },
                {
                    "label": "Dec 13, 01:00 AM",
                    "value": 9100
                },
                {
                    "label": "Dec 14, 01:00 AM",
                    "value": 9800
                },
                {
                    "label": "Dec 15, 01:00 AM",
                    "value": 10500
                },
                {
                    "label": "Dec 16, 01:00 AM",
                    "value": 11200
                },
                {
                    "label": "Dec 17, 01:00 AM",
                    "value": 11900
                },
                {
                    "label": "Dec 18, 01:00 AM",
                    "value": 12600
                },
                {
                    "label": "Dec 19, 01:00 AM",
                    "value": 13300
                },
                {
                    "label": "Dec 20, 01:00 AM",
                    "value": 14000
                },
                {
                    "label": "Dec 21, 01:00 AM",
                    "value": 14700
                },
                {
                    "label": "Dec 22, 01:00 AM",
                    "value": 15400
                },
                {
                    "label": "Dec 23, 01:00 AM",
                    "value": 16100
                },
                {
                    "label": "Dec 24, 01:00 AM",
                    "value": 16800
                },
                {
                    "label": "Dec 25, 01:00 AM",
                    "value": 17500
                },
                {
                    "label": "Dec 26, 01:00 AM",
                    "value": 18200
                },
                {
                    "label": "Dec 27, 01:00 AM",
                    "value": 18900
                },
                {
                    "label": "Dec 28, 01:00 AM",
                    "value": 19600
                },
                {
                    "label": "Dec 29, 01:00 AM",
                    "value": 20300
                },
                {
                    "label": "Dec 30, 01:00 AM",
                    "value": 21000
                },
                {
                    "label": "Dec 31, 01:00 AM",
                    "value": 21700
                }
            ]
        },
        "current_month_rcu": {
            "measurements": [
                {
                    "label": "Jan 1, 01:00 AM",
                    "value": 300
                },
                {
                    "label": "Jan 2, 01:00 AM",
                    "value": 600
                },
                {
                    "label": "Jan 3, 01:00 AM",
                    "value": 900
                },
                {
                    "label": "Jan 4, 01:00 AM",
                    "value": 1200
                },
                {
                    "label": "Jan 5, 01:00 AM",
                    "value": 1500
                },
                {
                    "label": "Jan 6, 01:00 AM",
                    "value": 3000
                },
                {
                    "label": "Jan 7, 01:00 AM",
                    "value": 4500
                },
                {
                    "label": "Jan 8, 01:00 AM",
                    "value": 6000
                },
                {
                    "label": "Jan 9, 01:00 AM",
                    "value": 7500
                }
            ]
        }
    };
}

export async function fetchUsageMetrics(): Promise<UsageMetrics> {
    return Promise
        .all([fetchDynamoDBMonthlyReadUsageMetrics()])
        .then(allMetrics => Object.assign({}, ...allMetrics))
        .catch(err => {
            throw err;
        });
}

async function fetchDynamoDBMonthlyReadUsageMetrics(): Promise<UsageMetrics> {
    const client = new CloudWatchClient({
        region: 'eu-west-3',
    });

    const now = new Date();
    const lastMonthStart = new Date();
    lastMonthStart.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), 1);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setUTCHours(0, 0, 0, 0);
    const monthEnd = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return Promise
        .all([
            client.send(getRCUCommandForTable('lys_events', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_suggested_events', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_events_archive', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_suggested_events_archive', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_ref_country', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_settings', lastMonthStart, monthEnd))
        ]).then(allResults => allResults
            .map((o, index) => {
                if (!o.Datapoints) return [];
                return o.Datapoints.map(dp => {
                    const provisioned = (index === 3 || index === 5) ? 24 : 120; // settings & events_archive have a 1/1 provisioned R/WCU
                    return {
                        Timestamp: dp.Timestamp,
                        Sum: dp.Sum! < provisioned ? provisioned : (dp.Sum! - provisioned)
                    } as Datapoint;
                });
            })
            .flat()
            .sort((dp1, dp2) => dp1.Timestamp! < dp2.Timestamp! ? -1 : 1)
        ).then(dataPoints => dataPoints.reduce(
            (out, dp) => {
                const date = dp.Timestamp!.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                if (dp.Timestamp!.getDate() == 1 && out.length == 1 && dp.Timestamp!.getMonth() !== dataPoints[0].Timestamp!.getMonth()) {
                    out.push({});
                }
                if (date in out[out.length - 1]) {
                    out[out.length - 1][date] += dp.Sum!;
                } else {
                    out[out.length - 1][date] = dp.Sum!;
                }
                return out;
            }, [{}] as { [date: string]: number }[]
        )).then(dateToValues => ({
            'previous_month_rcu': {
                measurements: Object
                    .entries(dateToValues[0])
                    .map(([key, value]) => ({label: key, value: value}))
                    .reduce((out, m, index) => {
                        if (index === 0) {
                            out.push(m);
                        } else {
                            out.push({label: m.label, value: m.value + out[index - 1].value})
                        }
                        return out;
                    }, [] as { label: string, value: number }[])
            } as ProcessMetrics,
            'current_month_rcu': {
                measurements: Object
                    .entries(dateToValues[1] || [])
                    .map(([key, value]) => ({label: key, value: value}))
                    .reduce((out, m, index) => {
                        if (index === 0) {
                            out.push(m);
                        } else {
                            out.push({label: m.label, value: m.value + out[index - 1].value})
                        }
                        return out;
                    }, [] as { label: string, value: number }[])
            }
        }))
        .catch(err => {
            console.log(err);
            throw err;
        });
}

function getRCUCommandForTable(table: string, from: Date, to: Date): GetMetricStatisticsCommand {
    return new GetMetricStatisticsCommand({
        Namespace: 'AWS/DynamoDB',
        MetricName: 'ConsumedReadCapacityUnits',
        Dimensions: [
            {
                Name: 'TableName',
                Value: table,
            }
        ],
        Period: 3600 * 24, // 24 hours in seconds
        Statistics: ['Sum'],
        StartTime: from,
        EndTime: to
    });
}