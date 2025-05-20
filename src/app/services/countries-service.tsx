import { Country, LysCountry } from '@/app/types/country';
import { BatchWriteItemCommand, DynamoDBClient, ScanCommand, WriteRequest } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LysBatchWriteItemOutput } from '@/app/types/aws/lys-batch-write-item-output';
import { DYNAMODB_BATCH_SIZE } from '@/app/utils/aws-utils';

export async function fetchCountries(): Promise<Country[]> {
    try {
        const client = new DynamoDBClient({
            region: 'eu-west-3',
        });
        const {Items: countries} = await client.send(new ScanCommand({
            TableName: 'lys_ref_country'
        }));
        return countries
            ? countries
                .map(country => unmarshall(country) as Country)
                .sort((c1: Country, c2: Country) => c1.country.localeCompare(c2.country))
            : [];
    } catch (error) {
        console.log(error);
        throw error;
    }
}

function toLysCountry(country: Country): LysCountry {
    const {modified: _, created: __, ...lysCountry} = country;
    return lysCountry;
}



export async function pulishCountryChanges(updatedCountries: Country[], deletedCountries: Country[]) {
    const client = new DynamoDBClient({
        region: 'eu-west-3',
    });

    const requests: WriteRequest[] = [];

    requests.push(...updatedCountries.map((country) => {
        return {
            PutRequest: {
                Item: marshall(toLysCountry(country))
            }
        }
    }));
    requests.push(...deletedCountries.map((country) => {
        return {
            DeleteRequest: {
                Key: {
                    'id': {
                        'N': country.id + ''
                    }
                }
            }
        }
    }));

    const responses: LysBatchWriteItemOutput[] = [];

    try {
        while (requests.length > 0
            || (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_ref_country?.length > 0)
            ) {
            const batch: WriteRequest[] = [];
            // re-submit unprocessed items (if any)
            if (responses.length > 0 && responses[responses.length - 1].UnprocessedItems.lys_ref_country?.length > 0) {
                batch.push(...responses[responses.length - 1].UnprocessedItems.lys_ref_country);
            }
            // fill the remaining slots of the batch with pending requests
            batch.push(...requests.splice(0, DYNAMODB_BATCH_SIZE - batch.length));

            console.log(`Submitting following country data batch to AWS: ${JSON.stringify(batch)}`);

            // submit the batch and save the processing response
            responses.push(await client.send(new BatchWriteItemCommand({
                RequestItems: {
                    lys_ref_country: batch
                }
            })) as LysBatchWriteItemOutput);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.log(`An error occurred when batch updating country data: ${e.name} - ${e.message}`);
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

export function getCountries(): Country[] {
    return [
        {
            'id': 1,
            'altEventNames': [
                'Melfest',
                'Mello'
            ],
            'country': 'Sweden',
            'countryCode': 'SE',
            'defaultChannel': 'SVT1',
            'eventName': 'Melodifestivalen',
            'likelyDates': [
                '02A',
                '02B',
                '03A'
            ],
            'scheduleDeviceTime': 0,
            'scheduleLink': 'https://www.svtplay.se/kanaler/svt1',
            'stages': [
                'Heat...',
                'Final'
            ],
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'castable': 1,
                    'channel': 'SVT1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'link': 'https://www.svtplay.se/melodifestivalen',
                    'live': 1,
                    'replayable': 1
                }
            ]
        },
        {
            'id': 2,
            'altEventNames': [
                'MGP'
            ],
            'country': 'Norway',
            'countryCode': 'NO',
            'defaultChannel': 'NRK1',
            'eventName': 'Melodi Grand Prix',
            'likelyDates': [
                '01A',
                '01B',
                '02A',
                '02B',
                '03A'
            ],
            'scheduleDeviceTime': 0,
            'stages': [
                'Heat...',
                'Final'
            ],
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'castable': 0,
                    'channel': 'NRK1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'link': 'https://nrk.no/mgp',
                    'live': 1,
                    'replayable': 0
                }
            ]
        }
    ];
}