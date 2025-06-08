import { BatchWriteItemCommand, DynamoDBClient, ScanCommand, WriteRequest, } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LysBatchWriteItemOutput } from '@/app/types/aws/lys-batch-write-item-output';
import { DYNAMODB_BATCH_SIZE } from '@/app/utils/aws-utils';
import { LysSuggestion, Suggestion } from '@/app/types/suggestion';

export function getSuggestions(): Suggestion[] {
    return [
        {
            'id': 1261,
            'reprocessable': true,
            'accepted': false,
            'country': 'Italy',
            'dateTimesCet': [
                {
                    'context': 'February 2',
                    'dateTimeCet': '2026-02-02T00:00:00',
                    'selected': false,
                    'sentence': 'The Winter Olympics will take place from February 2 to February 26 and RAI will broadcast the Games in Italy'
                },
                {
                    'context': 'from February 24 to February 28, right after the end of the Winter Olympic Games',
                    'dateTimeCet': '2026-02-24T00:00:00',
                    'selected': true,
                    'sentence': 'The 76th Festival di Sanremo will take place from February 24 to February 28, right after the end of the Winter Olympic Games'
                },
                {
                    'context': 'from February 24 to February 28, right after the end of the Winter Olympic Games',
                    'dateTimeCet': '2026-02-25T00:00:00',
                    'selected': true,
                    'sentence': 'The 76th Festival di Sanremo will take place from February 24 to February 28, right after the end of the Winter Olympic Games'
                },
                {
                    'context': 'February 26 and',
                    'dateTimeCet': '2026-02-26T00:00:00',
                    'selected': true,
                    'sentence': 'The Winter Olympics will take place from February 2 to February 26 and RAI will broadcast the Games in Italy'
                },
                {
                    'context': 'from February 24 to February 28, right after the end of the Winter Olympic Games',
                    'dateTimeCet': '2026-02-27T00:00:00',
                    'selected': true,
                    'sentence': 'The 76th Festival di Sanremo will take place from February 24 to February 28, right after the end of the Winter Olympic Games'
                },
                {
                    'context': 'in February',
                    'dateTimeCet': '2026-02-28T00:00:00',
                    'selected': true,
                    'sentence': 'The 2026 edition of Festival di Sanremo will be held later than usual in February due to the Winter Olympic Games'
                }
            ],
            'name': 'Festival di Sanremo',
            'processed': false,
            'sourceLink': 'https://eurovoix.com/2025/06/06/italy-festival-di-sanremo-2026-dates-announced/',
            'extractionDate': '2025-06-06'
        },
        {
            'id': 1260,
            'reprocessable': true,
            'accepted': false,
            'country': 'Spain',
            'dateTimesCet': [
                {
                    'context': 'in September, a',
                    'dateTimeCet': '2025-09-01T00:00:00',
                    'selected': false,
                    'sentence': 'Once song submissions close in September, a panel will review the entries and select up to twenty to compete in Benidorm Fest 2026'
                }
            ],
            'name': 'Festival de Benidorm',
            'processed': false,
            'sourceLink': 'https://eurovoix.com/2025/06/05/spain-opens-song-submissions-for-benidorm-fest-2026/',
            'extractionDate': '2025-06-05'
        },
        {
            'id': 1257,
            'reprocessable': false,
            'accepted': true,
            'country': 'Finland',
            'dateTimesCet': [
                {
                    'context': 'on February 28',
                    'dateTimeCet': '2026-02-28T00:00:00',
                    'sentence': 'Yle, the Finnish national broadcaster, has confirmed that Uuden Musiikin Kilpailu 2026 will take place on February 28',
                    'selected': true
                }
            ],
            'name': 'Uuden Musiikin Kilpailu',
            'processed': true,
            'sourceLink': 'https://eurovoix.com/2025/05/16/finland-uuden-musiikin-kilpailu-2026-february-28/',
            'extractionDate': '2025-05-16'
        },
        {
            'id': 1256,
            'reprocessable': false,
            'accepted': false,
            'country': 'United Kingdom',
            'dateTimesCet': [
                {
                    'context': 'on the 7th of March',
                    'dateTimeCet': '2026-03-07T00:00:00',
                    'sentence': 'The entry was internally selected by the BBC and formally revealed on the 7th of March'
                }
            ],
            'name': 'Eurovision: You Decide',
            'processed': true,
            'sourceLink': 'https://eurovoix.com/2025/05/15/united-kingdom-sophie-ellis-bextor-replaces-ncuti-gatwa-as-spokesperson-for-eurovision-2025/',
            'extractionDate': '2025-05-15'
        },
        {
            'id': 1255,
            'reprocessable': false,
            'accepted': false,
            'country': 'Australia',
            'dateTimesCet': [
                {
                    'context': '6th September',
                    'dateTimeCet': '2025-09-06T00:00:00',
                    'sentence': '6th September - London, UK'
                },
                {
                    'context': '7th September',
                    'dateTimeCet': '2025-09-07T00:00:00',
                    'sentence': '7th September - Brussels, Belgium'
                },
                {
                    'context': '8th September',
                    'dateTimeCet': '2025-09-08T00:00:00',
                    'sentence': '8th September - Utrecht, The Netherlands'
                },
                {
                    'context': '10th September',
                    'dateTimeCet': '2025-09-10T00:00:00',
                    'sentence': '10th September - Copenhagen, Denmark'
                },
                {
                    'context': '11th September',
                    'dateTimeCet': '2025-09-11T00:00:00',
                    'sentence': '11th September - Hamburg, Germany'
                },
                {
                    'context': '13th September',
                    'dateTimeCet': '2025-09-13T00:00:00',
                    'sentence': '13th September - Cologne, Germany'
                },
                {
                    'context': '14th September',
                    'dateTimeCet': '2025-09-14T00:00:00',
                    'sentence': '14th September - Berlin, Germany'
                },
                {
                    'context': '16th September',
                    'dateTimeCet': '2025-09-16T00:00:00',
                    'sentence': '16th September - Warsaw, Poland'
                },
                {
                    'context': '18th September',
                    'dateTimeCet': '2025-09-18T00:00:00',
                    'sentence': '18th September - Prague, Czechia'
                },
                {
                    'context': '19th September',
                    'dateTimeCet': '2025-09-19T00:00:00',
                    'sentence': '19th September - Budapest, Hungary'
                },
                {
                    'context': '20th September',
                    'dateTimeCet': '2025-09-20T00:00:00',
                    'sentence': '20th September - Vienna, Austria'
                },
                {
                    'context': '21st September',
                    'dateTimeCet': '2025-09-21T00:00:00',
                    'sentence': '21st September - Munich, Germany'
                },
                {
                    'context': '23rd September',
                    'dateTimeCet': '2025-09-23T00:00:00',
                    'sentence': '23rd September - Paris, France'
                },
                {
                    'context': 'September',
                    'dateTimeCet': '2025-09-30T00:00:00',
                    'sentence': 'Across September this year, Australia\'s Go-Jo will perform in ten different countries as he embarks on his European tour named after his Eurovision entry'
                }
            ],
            'name': 'Australia Decides',
            'processed': true,
            'sourceLink': 'https://eurovoix.com/2025/04/22/australia-go-jo-european-tour/',
            'extractionDate': '2025-04-22'
        }
    ];
}

export async function fetchSuggestions(): Promise<Suggestion[]> {
    try {
        const client = new DynamoDBClient({
            region: 'eu-west-3'
        });
        const {Items: suggestions} = await client.send(new ScanCommand({
            TableName: 'lys_suggested_events'
        }));
        return suggestions
            ? suggestions
                .map(suggestion => unmarshall(suggestion) as Suggestion)
                .map(suggestion => {
                    const dateInSourceLink = /https:\/\/eurovoix\.com\/(\d{4}\/\d{2}\/\d{2})\/.*/.exec(suggestion.sourceLink);
                    const extractionDate = dateInSourceLink && dateInSourceLink[1]
                        ? dateInSourceLink[1].replaceAll('/', '-') + 'T00:00:00'
                        : undefined;
                    return {
                        ...suggestion,
                        reprocessable: false,
                        extractionDate: extractionDate
                    }
                })
                .sort((s1: Suggestion, s2: Suggestion) => s2.id - s1.id)
                .slice(0, 30)
            : [];
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function toLysSuggestion(suggestion: Suggestion): LysSuggestion {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {events: _, reprocessable: __, extractionDate: ___, ...lysSuggestion} = suggestion;
    return lysSuggestion;
}

export async function publishProcessedSuggestions(suggestions: Suggestion[]) {
    const client = new DynamoDBClient({
        region: 'eu-west-3'
    });

    const requests: WriteRequest[] = suggestions.map((suggestion) => {
        return {
            PutRequest: {
                Item: marshall(toLysSuggestion(suggestion))
            }
        }
    });

    const responses: LysBatchWriteItemOutput[] = [];

    try {
        while (requests.length > 0
            || (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_suggested_events?.length > 0)
            ) {
            const batch: WriteRequest[] = [];
            // re-submit unprocessed items (if any)
            if (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_suggested_events?.length > 0) {
                batch.push(...responses[responses.length - 1].UnprocessedItems.lys_suggested_events);
            }
            // fill the remaining slots of the batch with pending requests
            batch.push(...requests.splice(0, DYNAMODB_BATCH_SIZE - batch.length));

            console.log(`Submitting following suggestion batch to AWS: ${JSON.stringify(batch)}`);

            // submit the batch and save the processing response
            responses.push(await client.send(new BatchWriteItemCommand({
                RequestItems: {
                    lys_suggested_events: batch
                }
            })) as LysBatchWriteItemOutput);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.log(`An error occurred when batch submitting suggestions: ${e.name} - ${e.message}`);
            console.log(e);
            throw e;
        } else {
            console.log(`Something weird happened: ${e}`);
            const error = new Error(JSON.stringify(e));
            error.name = 'Unexpected Error';
            throw error;
        }
    }

    return responses;
}