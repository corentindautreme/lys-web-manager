import { Country, LysCountry } from '@/app/types/country';
import { BatchWriteItemCommand, DynamoDBClient, ScanCommand, WriteRequest } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LysBatchWriteItemOutput } from '@/app/types/aws/lys-batch-write-item-output';
import { DYNAMODB_BATCH_SIZE } from '@/app/utils/aws-utils';

export async function fetchCountries(): Promise<Country[]> {
    try {
        const client = new DynamoDBClient({
            region: 'eu-west-3'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {modified: _, created: __, ...lysCountry} = country;
    return lysCountry;
}


export async function pulishCountryChanges(updatedCountries: Country[], deletedCountries: Country[]) {
    const client = new DynamoDBClient({
        region: 'eu-west-3'
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
            'id': 1111,
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
            'id': 1112,
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
        },
        {
            'eventName': 'Uuden Musiikin Kilpailu',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'Yle TV1',
                    'link': 'https://areena.yle.fi/tv/ohjelmat/yle-tv1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'FI',
            'likelyDates': [
                '03A',
                '02B',
                '02A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://areena.yle.fi/tv/opas',
            'defaultChannel': 'Yle TV1',
            'id': 15,
            'altEventNames': [
                'UMK'
            ],
            'country': 'Finland'
        },
        {
            'eventName': 'Eurovision: You Decide',
            'watchLinks': [],
            'countryCode': 'GB',
            'likelyDates': [
                '02B',
                '02A',
                '01B'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'id': 50,
            'altEventNames': [
                'You Decide'
            ],
            'country': 'United Kingdom'
        },
        {
            'eventName': 'Depi Evratesil',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': '1TV',
                    'link': 'https://live.1tv.am/watch/First%20Channel%20International',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'AM',
            'likelyDates': [
                '02A',
                '02B',
                '03A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.1tv.am/en/schedule',
            'defaultChannel': '1TV',
            'id': 2,
            'altEventNames': [
                '-'
            ],
            'country': 'Armenia'
        },
        {
            'eventName': 'Eurosong',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'VRT1',
                    'link': 'https://www.vrt.be/vrtnu/livestream/video/een/https://www.vrt.be/vrtmax/livestream/video/vrt1/',
                    'comment': 'Recommended link',
                    'geoblocked': 1,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'VRT1',
                    'link': 'https://live.esc-plus.com/',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'BE',
            'likelyDates': [
                '01A',
                '01B'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.vrt.be/vrtnu/tv-gids/',
            'defaultChannel': 'VRT1',
            'id': 7,
            'altEventNames': [
                '-'
            ],
            'country': 'Belgium'
        },
        {
            'eventName': 'Germany 12 Points',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'RTL1',
                    'link': 'https://plus.rtl.de/video-tv/live-tv/rtl-1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'DE',
            'likelyDates': [
                '02B',
                '02A',
                '03A'
            ],
            'stages': [
                'Night...',
                'Final'
            ],
            'defaultChannel': 'Das Erste',
            'id': 18,
            'altEventNames': [
                '-'
            ],
            'country': 'Germany'
        },
        {
            'eventName': 'Söngvakeppnin',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'RÚV',
                    'link': 'https://www.ruv.is/sjonvarp/beint?channel=ruv',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 0,
                    'channel': 'RÚV',
                    'link': 'https://www.ruv.is/sjonvarp/leit/s%C3%B6ngvakeppnin',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'IS',
            'likelyDates': [
                '02A',
                '02B',
                '03A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.ruv.is/sjonvarp/dagskra/ruv/',
            'defaultChannel': 'RÚV',
            'id': 21,
            'altEventNames': [
                '-'
            ],
            'country': 'Iceland'
        },
        {
            'eventName': 'The Late Late Show',
            'scheduleDeviceTime': 1,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'RTÉ One',
                    'link': 'https://www.rte.ie/player/onnow',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 0,
                    'channel': 'RTÉ One',
                    'link': 'https://www.rte.ie/player/series/the-late-late-show/SI0000001694?epguid=IH000413628',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'IE',
            'likelyDates': [],
            'stages': [
                'Night...',
                'Final'
            ],
            'scheduleLink': 'https://www.rte.ie/entertainment/listings/television/#!/rte1',
            'defaultChannel': 'RTÉ One',
            'id': 22,
            'altEventNames': [
                '-'
            ],
            'country': 'Ireland'
        },
        {
            'eventName': 'Festival di Sanremo',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'Rai 1',
                    'link': 'https://www.raiplay.it/dirette/rai1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'Rai 1',
                    'link': 'https://www.raiplay.it/programmi/festivaldisanremo/le-serate/le-serate',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'IT',
            'likelyDates': [
                '02A'
            ],
            'stages': [
                'Night...',
                'Final'
            ],
            'scheduleLink': 'https://www.raiplay.it/guidatv',
            'defaultChannel': 'Rai 1',
            'id': 24,
            'altEventNames': [
                'Sanremo'
            ],
            'country': 'Italy'
        },
        {
            'eventName': 'Supernova',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'LTV1',
                    'link': 'https://replay.lsm.lv/lv/skaties/tiesraide/ltv1/rita-panorama',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'LTV1',
                    'link': 'https://replay.lsm.lv/lv/raidijums/357/supernova?type=all',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'LV',
            'likelyDates': [
                '02A',
                '02B',
                '01B'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://replay.lsm.lv/lv/programma',
            'defaultChannel': 'LTV1',
            'id': 25,
            'altEventNames': [
                '-'
            ],
            'country': 'Latvia'
        },
        {
            'eventName': 'Eurovizija.LT',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'LRT televizija',
                    'link': 'https://lrt.lt/mediateka/tiesiogiai/lrt-televizija',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'LRT televizija',
                    'link': 'https://youtube.com/@LRTinklas',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'LRT televizija',
                    'link': 'https://www.lrt.lt/mediateka/video/eurovizija',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'LT',
            'likelyDates': [
                '01A',
                '01B',
                '02A'
            ],
            'stages': [
                'Heat...',
                'Semi-final 1',
                'Semi-final 2',
                'Final'
            ],
            'scheduleLink': 'https://www.lrt.lt/programa',
            'defaultChannel': 'LRT televizija',
            'id': 26,
            'altEventNames': [],
            'country': 'Lithuania'
        },
        {
            'eventName': 'Malta Eurovision Song Contest',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'TVM',
                    'link': 'https://tvmi.mt/live/2',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'TVM',
                    'link': 'https://tvmi.mt/series/383',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'MT',
            'likelyDates': [
                '02A',
                '02B',
                '01B'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://tvmi.mt/schedule',
            'defaultChannel': 'TVM',
            'id': 28,
            'altEventNames': [
                'MESC'
            ],
            'country': 'Malta'
        },
        {
            'eventName': 'EMA',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'TV SLO 1',
                    'link': 'https://www.rtvslo.si/tv/vzivo/tvs1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'TV SLO 1',
                    'link': 'https://365.rtvslo.si/oddaja/ema/484',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'SI',
            'likelyDates': [
                '02B',
                '02A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.rtvslo.si/tv/spored/tvs1/',
            'defaultChannel': 'TV SLO 1',
            'id': 43,
            'altEventNames': [
                'Evrovizijska Melodija',
                'EMA'
            ],
            'country': 'Slovenia'
        },
        {
            'eventName': 'National Selection',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'TVP Polonia',
                    'link': 'https://vod.tvp.pl/live,1/tvp-polonia,399723',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'TVP Polonia',
                    'link': 'https://vod.tvp.pl/na-zywo',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'PL',
            'likelyDates': [
                '02A',
                '02B',
                '03A'
            ],
            'stages': [
                'Show...',
                'Final'
            ],
            'scheduleLink': 'https://www.tvp.pl/program-tv',
            'defaultChannel': 'TVP1',
            'id': 36,
            'altEventNames': [
                '-'
            ],
            'country': 'Poland'
        },
        {
            'eventName': 'Eesti Laul',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'ETV',
                    'link': 'https://otse.err.ee/k/etv',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 1,
                    'channel': 'ETV',
                    'link': 'https://jupiter.err.ee/etv',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'ETV',
                    'link': 'https://jupiter.err.ee/search?phrase=Eesti%20laul',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'EE',
            'likelyDates': [
                '02A',
                '02B',
                '03A',
                '01B',
                '01A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://jupiter.err.ee/etv',
            'defaultChannel': 'ETV',
            'id': 14,
            'altEventNames': [
                '-'
            ],
            'country': 'Estonia'
        },
        {
            'eventName': 'Festival de Benidorm',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'La 1',
                    'link': 'https://www.rtve.es/play/videos/directo/canales-lineales/la-1/',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                },
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 0,
                    'channel': 'La 1',
                    'link': 'https://www.rtve.es/play/videos/benidorm-fest/',
                    'geoblocked': 0,
                    'live': 0
                }
            ],
            'countryCode': 'ES',
            'likelyDates': [
                '01B',
                '02A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.rtve.es/play/guia-tve/',
            'defaultChannel': 'La 1',
            'id': 44,
            'altEventNames': [
                '-'
            ],
            'country': 'Spain'
        },
        {
            'eventName': 'Natsvidbir',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 1,
                    'castable': 1,
                    'channel': 'Suspilne Kultura',
                    'link': 'https://youtube.com/channel/UCHTl8A94cnvWKGntLjhSIHA',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'UA',
            'likelyDates': [
                '02A',
                '02B'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://vo.suspilne.media/schedule',
            'defaultChannel': 'Suspilne Kultura',
            'id': 48,
            'altEventNames': [
                'Vidbir'
            ],
            'country': 'Ukraine'
        },
        {
            'eventName': 'Australia Decides',
            'scheduleDeviceTime': 0,
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'replayable': 0,
                    'castable': 0,
                    'channel': 'SBS',
                    'link': 'https://www.facebook.com/SBSEurovision',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'live': 1
                }
            ],
            'countryCode': 'AU',
            'likelyDates': [
                '02B',
                '02A'
            ],
            'stages': [
                'Semi-final...',
                'Final'
            ],
            'scheduleLink': 'https://www.sbs.com.au/guide/day#/',
            'defaultChannel': 'SBS',
            'id': 3,
            'altEventNames': [
                '-'
            ],
            'country': 'Australia'
        },
        {
            'id': 19,
            'altEventNames': [
                '-'
            ],
            'country': 'Greece',
            'countryCode': 'GR',
            'defaultChannel': 'ERT1',
            'eventName': '-',
            'likelyDates': [],
            'scheduleDeviceTime': 1,
            'scheduleLink': 'https://www.ertflix.gr/epg',
            'stages': [
                'Night...',
                'Final'
            ],
            'watchLinks': [
                {
                    'accountRequired': 0,
                    'castable': 1,
                    'channel': 'ERT1',
                    'comment': 'Recommended link',
                    'geoblocked': 0,
                    'link': 'https://www.ertflix.gr/epg/now-on-tv',
                    'live': 1,
                    'replayable': 0
                }
            ]
        }
    ];
}