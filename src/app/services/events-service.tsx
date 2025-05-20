import { Event, LysEvent } from '@/app/types/events/event'
import { EventFilterQuery } from '@/app/types/events/event-filter-query';
import { BatchWriteItemCommand, DynamoDBClient, ScanCommand, WriteRequest, } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LysBatchWriteItemOutput } from '@/app/types/aws/lys-batch-write-item-output';
import { DYNAMODB_BATCH_SIZE } from '@/app/utils/aws-utils';

function getEventPredicateFromFilterQuery(query: EventFilterQuery): (event: LysEvent) => boolean {
    // get current datetime as yyyy-MM-ddTHH:mm:SS string
    const now = new Date().toISOString().slice(0, 19);
    return (event) => {
        return (
            (!(query?.countries) || query.countries.includes(event.country))
            && (query.final === undefined || query.final == 'true' ? event.stage == 'Final' : event.stage != 'Final')
            && ((query.showPast === undefined || query.showPast == 'false') ? event.endDateTimeCet > now : true)
            && (!(query?.dateFrom) || event.dateTimeCet > query.dateFrom)
            && (!(query?.dateTo) || event.endDateTimeCet < query.dateTo)
        );
    }
}

export function getEvents(): Event[] {
    return [
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'SVT1',
                    link: 'https://www.svtplay.se/melodifestivalen',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 1,
            country: 'Sweden',
            name: 'Melodifestivalen',
            endDateTimeCet: '2025-02-08T22:00:00',
            dateTimeCet: '2025-02-08T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://www.nrk.no/mgp',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 2,
            country: 'Norway',
            name: 'Melodi Grand Prix',
            endDateTimeCet: '2025-02-08T22:00:00',
            dateTimeCet: '2025-02-08T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'SVT1',
                    link: 'https://www.svtplay.se/melodifestivalen',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 3,
            country: 'Sweden',
            name: 'Melodifestivalen',
            endDateTimeCet: '2025-02-08T22:00:00',
            dateTimeCet: '2025-02-08T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://www.nrk.no/mgp',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                },
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://tv.nrk.no/mgp',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 4,
            country: 'Norway',
            name: 'Melodi Grand Prix',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'SVT1',
                    link: 'https://www.svtplay.se/melodifestivalen',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 5,
            country: 'Sweden',
            name: 'Melodifestivalen',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://www.nrk.no/mgp',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 6,
            country: 'Norway',
            name: 'Melodi Grand Prix',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'SVT1',
                    link: 'https://www.svtplay.se/melodifestivalen',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 7,
            country: 'Sweden',
            name: 'Melodifestivalen',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://www.nrk.no/mgp',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 8,
            country: 'Norway',
            name: 'Melodi Grand Prix',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'SVT1',
                    link: 'https://www.svtplay.se/melodifestivalen',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 9,
            country: 'Sweden',
            name: 'Melodifestivalen',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        },
        {
            stage: 'Final',
            watchLinks: [
                {
                    accountRequired: 0,
                    replayable: 1,
                    castable: 1,
                    channel: 'NRK1',
                    link: 'https://www.nrk.no/mgp',
                    comment: 'Recommended link',
                    geoblocked: 0,
                    live: 1
                }
            ],
            id: 10,
            country: 'Norway',
            name: 'Melodi Grand Prix',
            endDateTimeCet: '2025-03-09T22:00:00',
            dateTimeCet: '2025-03-09T20:00:00'
        }
    ];
}

export async function fetchEvents(): Promise<Event[]> {
    try {
        const client = new DynamoDBClient({
            region: 'eu-west-3',
        });
        const {Items: events} = await client.send(new ScanCommand({
            TableName: 'lys_events'
        }));
        return events
            ? events
                .map(event => unmarshall(event) as Event)
                .sort((e1: Event, e2: Event) => e1.dateTimeCet.localeCompare(e2.dateTimeCet))
            : [];
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function toLysEvent(event: Event): LysEvent {
    const {modified: _, created: __, rescheduled: ___, previousDateTimeCet: ____, ...lysEvent} = event;
    return lysEvent;
}

export async function pulishEventChanges(updatedEvents: Event[], rescheduledEvents: Event[], deletedEvents: Event[]) {
    const client = new DynamoDBClient({
        region: 'eu-west-3',
    });

    const requests: WriteRequest[] = [];

    requests.push(...updatedEvents.map((event) => {
        return {
            PutRequest: {
                Item: marshall(toLysEvent(event))
            }
        }
    }));
    requests.push(...deletedEvents.map((event) => {
        return {
            DeleteRequest: {
                Key: {
                    'id': {
                        'N': event.id + ''
                    },
                    'dateTimeCet': {
                        'S': event.dateTimeCet
                    }
                }
            }
        }
    }));
    rescheduledEvents
        .forEach(event => {
            // delete the previous event
            requests.push({
                DeleteRequest: {
                    Key: {
                        'id': {
                            'N': event.id + ''
                        },
                        'dateTimeCet': {
                            'S': event.previousDateTimeCet || ''
                        }
                    }
                }
            });
            // put the new version
            requests.push({
                PutRequest: {
                    Item: marshall(toLysEvent(event))
                }
            });
        });

    const responses: LysBatchWriteItemOutput[] = [];

    try {
        while (requests.length > 0
            || (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_events?.length > 0)
            ) {
            const batch: WriteRequest[] = [];
            // re-submit unprocessed items (if any)
            if (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_events?.length > 0) {
                batch.push(...responses[responses.length - 1].UnprocessedItems.lys_events);
            }
            // fill the remaining slots of the batch with pending requests
            batch.push(...requests.splice(0, DYNAMODB_BATCH_SIZE - batch.length));

            console.log(`Submitting following event batch to AWS: ${JSON.stringify(batch)}`);

            // submit the batch and save the processing response
            responses.push(await client.send(new BatchWriteItemCommand({
                RequestItems: {
                    lys_events: batch
                }
            })) as LysBatchWriteItemOutput);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.log(`An error occurred when batch updating events: ${e.name} - ${e.message}`);
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