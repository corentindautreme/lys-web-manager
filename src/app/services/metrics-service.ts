import { ProcessMetrics, UsageMetrics } from '@/app/types/metrics';
import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';

export function getUsageMetrics(): UsageMetrics {
    return {};
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

    const now = new Date("2025-10-25");
    const lastMonthStart = new Date();
    // start from the 2nd of the month, since the daily metric is given as of 00:00 UTC and gives the consumption over
    // the last 24 hours
    // TODO review that above comment lol
    lastMonthStart.setUTCFullYear(now.getUTCFullYear(), now.getUTCMonth(), 1);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setUTCHours(0, 0, 0, 0);
    // request data until the 2nd of the next month (end boundary is exclusive), for the same reason as mentioned above
    const monthEnd = new Date(now.getUTCFullYear(), now.getUTCMonth(), 2, 0, 0, 0);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    console.log(monthEnd);
    return Promise
        .all([
            client.send(getRCUCommandForTable('lys_events', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_suggested_events', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_ref_country', lastMonthStart, monthEnd)),
            client.send(getRCUCommandForTable('lys_settings', lastMonthStart, monthEnd))
        ]).then(allResults => {
            console.log(JSON.stringify(allResults[0], null, 2));
            return allResults;
        }).then(allResults => allResults
            .map(o => o.Datapoints || [])
            .flat()
            .sort((dp1, dp2) => dp1.Timestamp! < dp2.Timestamp! ? -1 : 1)
        ).then(dataPoints => dataPoints.reduce((out, dp, index) => {
            if (index === dataPoints.length - 1) {
                console.log(out);
            }
                const date = dp.Timestamp!.toLocaleString('en-US', {month: 'short', day: 'numeric'});
                if (dp.Timestamp!.getDate() == 2 && out.length == 1 && dp.Timestamp!.getMonth() !== dataPoints[0].Timestamp!.getMonth()) {
                    out.push({});
                }
                if (date in out[out.length - 1]) {
                    out[out.length - 1][date] += dp.Sum!;
                } else {
                    out[out.length - 1][date] = dp.Sum!;
                }
                return out;
            }, [{}] as { [date: string]: number }[])
        ).then(dateToValues => ({
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