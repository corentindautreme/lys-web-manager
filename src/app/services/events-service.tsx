import { Event, LysEvent } from '@/app/types/events/event'
import { EventFilterQuery } from '@/app/types/events/event-filter-query';
import { BatchWriteItemCommand, DynamoDBClient, ScanCommand, WriteRequest, } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { LysBatchWriteItemOutput } from '@/app/types/aws/lys-batch-write-item-output';
import { DYNAMODB_BATCH_SIZE } from '@/app/utils/aws-utils';

export function getEventPredicateFromFilterQuery(query: EventFilterQuery): (event: LysEvent) => boolean {
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
            "stage": "Semi-final 1",
            "watchLinks": [
                {
                    "accountRequired": 0,
                    "replayable": 0,
                    "castable": 0,
                    "channel": "La 1",
                    "link": "https://www.rtve.es/play/videos/directo/canales-lineales/la-1/",
                    "comment": "Recommended link",
                    "geoblocked": 0,
                    "live": 1
                },
                {
                    "accountRequired": 0,
                    "replayable": 1,
                    "castable": 0,
                    "channel": "La 1",
                    "link": "https://www.rtve.es/play/videos/benidorm-fest/2025-primera-semifinal/16426488/",
                    "geoblocked": 0,
                    "live": 0
                }
            ],
            "id": 351,
            "name": "Festival de Benidorm",
            "country": "Spain",
            "endDateTimeCet": "2025-01-29T00:25:00",
            "dateTimeCet": "2025-01-28T22:45:00"
        },
        {
            "stage": "Final",
            "watchLinks": [
                {
                    "accountRequired": 0,
                    "replayable": 1,
                    "castable": 1,
                    "channel": "ERT1",
                    "link": "https://www.youtube.com/live/lLPZMhA8IJY",
                    "comment": "Recommended link",
                    "geoblocked": 0,
                    "live": 1
                },
                {
                    "accountRequired": 0,
                    "replayable": 0,
                    "castable": 1,
                    "channel": "ERT1",
                    "link": "https://www.ertflix.gr/epg/now-on-tv",
                    "geoblocked": 0,
                    "live": 1
                },
                {
                    "accountRequired": 0,
                    "replayable": 0,
                    "castable": 0,
                    "channel": "ERT1",
                    "link": "https://live.esc-plus.com/",
                    "geoblocked": 0,
                    "live": 1
                }
            ],
            "id": 405,
            "name": "Ethnikós Telikós",
            "country": "Greece",
            "endDateTimeCet": "2025-01-30T23:00:00",
            "dateTimeCet": "2025-01-30T20:00:00"
        },
        {
            "stage": "Semi-final 2",
            "watchLinks": [
                {
                    "accountRequired": 0,
                    "replayable": 0,
                    "castable": 0,
                    "channel": "La 1",
                    "link": "https://www.rtve.es/play/videos/directo/canales-lineales/la-1/",
                    "comment": "Recommended link",
                    "geoblocked": 0,
                    "live": 1
                },
                {
                    "accountRequired": 0,
                    "replayable": 1,
                    "castable": 0,
                    "channel": "La 1",
                    "link": "https://www.rtve.es/play/videos/benidorm-fest/2025-segunda-semifinal/16429670/",
                    "geoblocked": 0,
                    "live": 0
                }
            ],
            "id": 352,
            "name": "Festival de Benidorm",
            "country": "Spain",
            "endDateTimeCet": "2025-01-31T00:25:00",
            "dateTimeCet": "2025-01-30T22:45:00"
        },
        {
            'stage': 'Heat 4',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://lrt.lt/mediateka/tiesiogiai/lrt-televizija',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://youtube.com/@LRTinklas',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.lrt.lt/mediateka/irasas/2000387901/eurovizija-lt-2025-iv-atranka',
                'geoblocked': 0,
                'live': 0
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.youtube.com/live/hYRED6MxXSk',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 398,
            'name': 'Eurovizija.LT',
            'country': 'Lithuania',
            'endDateTimeCet': '2025-02-01T22:00:00',
            'dateTimeCet': '2025-02-01T20:00:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'TV SLO 1',
                'link': 'https://www.rtvslo.si/tv/vzivo/tvs1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TV SLO 1',
                'link': 'https://365.rtvslo.si/arhiv/ema/175106068',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 377,
            'name': 'EMA',
            'country': 'Slovenia',
            'endDateTimeCet': '2025-02-01T22:15:00',
            'dateTimeCet': '2025-02-01T20:00:00'
        }, {
            'stage': 'Heat 1',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'SVT1',
                'link': 'https://www.svtplay.se/video/jqWY5xb/melodifestivalen/deltavling-1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 358,
            'name': 'Melodifestivalen',
            'country': 'Sweden',
            'endDateTimeCet': '2025-02-01T21:30:00',
            'dateTimeCet': '2025-02-01T20:00:00'
        }, {
            'stage': 'Semi-final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://www.youtube.com/live/GTuzVcKrM_c',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://replay.lsm.lv/lv/skaties/tiesraide/ltv1/rita-panorama',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://replay.lsm.lv/lv/skaties/ieraksts/ltv/347886/supernova-2025-pusfinals',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 384,
            'name': 'Supernova',
            'country': 'Latvia',
            'endDateTimeCet': '2025-02-01T22:45:00',
            'dateTimeCet': '2025-02-01T20:10:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'VRT1',
                'link': 'https://www.youtube.com/live/QuoWc3Jy4jo',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'VRT1',
                'link': 'https://www.vrt.be/vrtnu/livestream/video/een/https://www.vrt.be/vrtmax/livestream/video/vrt1/',
                'geoblocked': 1,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'VRT1',
                'link': 'https://live.esc-plus.com/',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 1,
                'replayable': 1,
                'castable': 1,
                'channel': 'VRT1',
                'link': 'https://www.vrt.be/vrtmax/a-z/eurosong/2025/eurosong-s2025a3/',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 382,
            'name': 'Eurosong',
            'country': 'Belgium',
            'endDateTimeCet': '2025-02-01T22:35:00',
            'dateTimeCet': '2025-02-01T20:55:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'La 1',
                'link': 'https://www.youtube.com/live/snl7ZWA9-9g',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'La 1',
                'link': 'https://www.rtve.es/play/videos/directo/canales-lineales/la-1/',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'La 1',
                'link': 'https://www.rtve.es/play/videos/benidorm-fest/benidorm-fest-2025-final/16432342/',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 353,
            'name': 'Festival de Benidorm',
            'country': 'Spain',
            'endDateTimeCet': '2025-02-02T00:00:00',
            'dateTimeCet': '2025-02-01T22:00:00'
        }, {
            'stage': 'Semi-final 1',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVM',
                'link': 'https://www.youtube.com/live/soi0gPD_9MM',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/live/2',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/episode/123195',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 371,
            'name': 'Malta Eurovision Song Contest',
            'country': 'Malta',
            'endDateTimeCet': '2025-02-04T23:15:00',
            'dateTimeCet': '2025-02-04T21:00:00'
        }, {
            'stage': 'Semi-final 2',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/live/2',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/episode/123196',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 372,
            'name': 'Malta Eurovision Song Contest',
            'country': 'Malta',
            'endDateTimeCet': '2025-02-06T23:15:00',
            'dateTimeCet': '2025-02-06T21:00:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'RT\u00c9 One',
                'link': 'https://www.rte.ie/player/onnow',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'RT\u00c9 One',
                'link': 'https://www.rte.ie/player/series/the-late-late-show/SI0000001694?epguid=IH10008885-25-0005',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 407,
            'name': 'The Late Late Show',
            'country': 'Ireland',
            'endDateTimeCet': '2025-02-08T00:45:00',
            'dateTimeCet': '2025-02-07T22:35:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Suspilne Kultura',
                'link': 'https://www.youtube.com/live/IaEYICGx2qk',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Suspilne Kultura',
                'link': 'https://www.youtube.com/live/fWZSP_tOBhc',
                'comment': 'English commentary',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Suspilne Kultura',
                'link': 'https://www.youtube.com/live/VpfO7N9RbjE',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'Suspilne Kultura',
                'link': 'https://suspilne.media/culture/schedule/tv/',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'link': 'https://www.facebook.com/suspilne.eurovision/',
                'replayable': 0,
                'geoblocked': 0,
                'live': 1,
                'castable': 0,
                'channel': 'Suspilne Kultura',
            }],
            'id': 404,
            'name': 'Natsvidbir',
            'country': 'Ukraine',
            'endDateTimeCet': '2025-02-08T21:30:00',
            'dateTimeCet': '2025-02-08T17:30:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Yle TV1',
                'link': 'https://areena.yle.fi/suorat',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Yle TV1',
                'link': 'https://areena.yle.fi/1-72896913',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Yle TV1',
                'link': 'https://areena.yle.fi/1-73049130',
                'comment': 'English commentary',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Yle TV1',
                'link': 'https://areena.yle.fi/1-73049290',
                'comment': 'FI/SE sign language',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Yle TV1',
                'link': 'https://areena.yle.fi/tv/ohjelmat/57-jW13z0rXB',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 370,
            'name': 'Uuden Musiikin Kilpailu',
            'country': 'Finland',
            'endDateTimeCet': '2025-02-08T22:15:00',
            'dateTimeCet': '2025-02-08T20:00:00'
        }, {
            'stage': 'Heat 5',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://lrt.lt/mediateka/tiesiogiai/lrt-televizija',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.youtube.com/live/m67gYVnA100',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.youtube.com/live/8vPvAwTxtds',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.lrt.lt/mediateka/irasas/2000389895/eurovizija-lt-2025-v-atranka',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 399,
            'name': 'Eurovizija.LT',
            'country': 'Lithuania',
            'endDateTimeCet': '2025-02-08T22:00:00',
            'dateTimeCet': '2025-02-08T20:00:00'
        }, {
            'stage': 'Heat 2',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'SVT1',
                'link': 'https://www.svtplay.se/video/8PB953n/melodifestivalen/deltavling-2',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 359,
            'name': 'Melodifestivalen',
            'country': 'Sweden',
            'endDateTimeCet': '2025-02-08T21:30:00',
            'dateTimeCet': '2025-02-08T20:00:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://www.youtube.com/live/GTuzVcKrM_c',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://replay.lsm.lv/lv/skaties/tiesraide/ltv1/rita-panorama',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LTV1',
                'link': 'https://replay.lsm.lv/lv/skaties/ieraksts/ltv/348677/latvijas-televizijas-dziesmu-konkurss-supernova-2025-finals',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 385,
            'name': 'Supernova',
            'country': 'Latvia',
            'endDateTimeCet': '2025-02-08T22:20:00',
            'dateTimeCet': '2025-02-08T20:10:00'
        }, {
            'stage': 'Semi-final 1',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'R\u00daV',
                'link': 'https://www.ruv.is/sjonvarp/beint?channel=ruv',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'R\u00daV',
                'link': 'https://www.ruv.is/sjonvarp/spila/songvakeppnin/37135/b24mfh',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 408,
            'name': 'S\u00f6ngvakeppnin',
            'country': 'Iceland',
            'endDateTimeCet': '2025-02-08T22:25:00',
            'dateTimeCet': '2025-02-08T20:45:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVM',
                'link': 'https://www.youtube.com/live/soi0gPD_9MM',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/live/2',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVM',
                'link': 'https://tvmi.mt/episode/123197',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 373,
            'name': 'Malta Eurovision Song Contest',
            'country': 'Malta',
            'endDateTimeCet': '2025-02-09T00:00:00',
            'dateTimeCet': '2025-02-08T21:00:00'
        }, {
            'stage': 'Night 1',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/dirette/rai1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/video/2025/02/Sanremo-2025-75-Festival-della-Canzone-Italiana-Prima-serata-del-11022025-d6cc68b8-c90a-4e0b-8bf9-88ce0de3ce69.html',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 346,
            'name': 'Festival di Sanremo',
            'country': 'Italy',
            'endDateTimeCet': '2025-02-12T01:30:00',
            'dateTimeCet': '2025-02-11T20:40:00'
        }, {
            'stage': 'Night 2',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/dirette/rai1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/video/2025/02/Sanremo-2025-75-Festival-della-Canzone-Italiana-Seconda-serata-del-12022025-1534bd4a-b595-4054-b0d3-8f64d93503b2.html',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 347,
            'name': 'Festival di Sanremo',
            'country': 'Italy',
            'endDateTimeCet': '2025-02-13T01:30:00',
            'dateTimeCet': '2025-02-12T20:40:00'
        }, {
            'stage': 'Night 3',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/dirette/rai1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/video/2025/02/Sanremo-2025-75-Festival-della-Canzone-Italiana-Terza-serata-del-13022025-66b51a69-999a-4a7a-b5bc-45aa3569ebb2.html',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 348,
            'name': 'Festival di Sanremo',
            'country': 'Italy',
            'endDateTimeCet': '2025-02-14T01:30:00',
            'dateTimeCet': '2025-02-13T20:40:00'
        }, {
            'stage': 'Heat 1',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'RTL',
                'link': 'https://plus.rtl.de/video-tv/live-tv/rtl-1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'RTL',
                'link': 'https://www.ardmediathek.de/video/eurovision-song-contest/chefsache-esc-2025-oder-erste-show/ndr/Y3JpZDovL25kci5kZS8zYzhmNTU0MC1mODkwLTQxYTEtYjU0Yy0yODY4MjM2ZjJmM2Y',
                'geoblocked': 0,
                'live': 0
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'RTL',
                'link': 'https://plus.rtl.de/video-tv/shows/chefsache-esc-2025-wer-singt-fuer-deutschland-1015617/staffel-1-1015618/episode-1-folge-1-1015619',
                'geoblocked': 1,
                'live': 0
            }],
            'id': 394,
            'name': 'Chefsache ESC 2025 \u2013 Wer singt f\u00fcr Deutschland?',
            'country': 'Germany',
            'endDateTimeCet': '2025-02-14T22:55:00',
            'dateTimeCet': '2025-02-14T20:15:00'
        }, {
            'stage': 'Night 4',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/dirette/rai1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/video/2025/02/Sanremo-2025-75-Festival-della-Canzone-Italiana-serata-cover-del-14022025-3e42bca2-4141-42e0-9088-3165d5b1ed5d.html',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 349,
            'name': 'Festival di Sanremo',
            'country': 'Italy',
            'endDateTimeCet': '2025-02-15T02:00:00',
            'dateTimeCet': '2025-02-14T20:40:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'TVP Polonia',
                'link': 'https://www.youtube.com/live/OtGbwUjZX-w',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'TVP Polonia',
                'link': 'https://vod.tvp.pl/live,1/tvp-polonia,399723',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'TVP Polonia',
                'link': 'https://vod.tvp.pl/na-zywo',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'TVP Polonia',
                'link': 'https://vod.tvp.pl/programy,88/eurowizja-odcinki,276170/odcinek-11,S06E11,1907901',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 381,
            'name': 'Wielki fina\u0142 polskich kwalifikacji',
            'country': 'Poland',
            'endDateTimeCet': '2025-02-14T22:45:00',
            'dateTimeCet': '2025-02-14T20:45:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'ETV',
                'link': 'https://otse.err.ee/k/etv',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'ETV',
                'link': 'https://jupiter.err.ee/etv',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'ETV',
                'link': 'https://jupiter.err.ee/1609591320/eesti-laul-2025',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 357,
            'name': 'Eesti Laul',
            'country': 'Estonia',
            'endDateTimeCet': '2025-02-15T20:00:00',
            'dateTimeCet': '2025-02-15T18:15:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'NRK1',
                'link': 'https://tv.nrk.no/serie/melodi-grand-prix-tv/sesong/2025/episode/MUHU25000025',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'NRK1',
                'link': 'https://nrk.no/mgp',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 386,
            'name': 'Melodi Grand Prix',
            'country': 'Norway',
            'endDateTimeCet': '2025-02-15T21:50:00',
            'dateTimeCet': '2025-02-15T19:50:00'
        }, {
            'stage': 'Heat 3',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'SVT1',
                'link': 'https://www.svtplay.se/video/KMy3AJW/melodifestivalen/deltavling-3',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 360,
            'name': 'Melodifestivalen',
            'country': 'Sweden',
            'endDateTimeCet': '2025-02-15T21:30:00',
            'dateTimeCet': '2025-02-15T20:00:00'
        }, {
            'stage': 'Heat 2',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'RTL',
                'link': 'https://plus.rtl.de/video-tv/live-tv/rtl-1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'RTL',
                'link': 'https://www.ardmediathek.de/video/eurovision-song-contest/chefsache-esc-2025-oder-zweite-show/ndr/Y3JpZDovL25kci5kZS8zYmMyZTYzNy1iNWY2LTRkYjMtOTkwNC1mYzVmNDlkYTU4YmM',
                'geoblocked': 0,
                'live': 0
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'RTL',
                'link': 'https://plus.rtl.de/video-tv/shows/chefsache-esc-2025-wer-singt-fuer-deutschland-1015617?utm_campaign=textlink_livestreamartikel&utm_source=rtl&utm_medium=owned&utm_term=chefsache-esc-2025-wer-singt-fuer-deutschland&utm_content=2058947',
                'geoblocked': 1,
                'live': 0
            }],
            'id': 392,
            'name': 'Chefsache ESC 2025 \u2013 Wer singt f\u00fcr Deutschland?',
            'country': 'Germany',
            'endDateTimeCet': '2025-02-15T22:55:00',
            'dateTimeCet': '2025-02-15T20:15:00'
        }, {
            'stage': 'Final (part 2)',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'ETV',
                'link': 'https://otse.err.ee/k/etv',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'ETV',
                'link': 'https://jupiter.err.ee/etv',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'ETV',
                'link': 'https://jupiter.err.ee/1609591323/eesti-laul-2025',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 416,
            'name': 'Eesti Laul',
            'country': 'Estonia',
            'endDateTimeCet': '2025-02-15T21:50:00',
            'dateTimeCet': '2025-02-15T20:30:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.youtube.com/live/zuwGTwRV39o',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://lrt.lt/mediateka/tiesiogiai/lrt-televizija',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.youtube.com/live/mAn_pI8FZ4Y',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'LRT televizija',
                'link': 'https://www.lrt.lt/mediateka/irasas/2000392516/eurovizija-lt-2025-finalas',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 406,
            'name': 'Eurovizija.LT',
            'country': 'Lithuania',
            'endDateTimeCet': '2025-02-16T00:20:00',
            'dateTimeCet': '2025-02-15T20:30:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/dirette/rai1',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': 'Rai 1',
                'link': 'https://www.raiplay.it/video/2025/02/Sanremo-2025-75-Festival-della-Canzone-Italiana-Serata-finale-del-15022025-c0b9e04b-804e-4168-8f2d-ae1454b1fe3d.html',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 350,
            'name': 'Festival di Sanremo',
            'country': 'Italy',
            'endDateTimeCet': '2025-02-16T02:45:00',
            'dateTimeCet': '2025-02-15T20:40:00'
        }, {
            'stage': 'Semi-final 2',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 0,
                'castable': 0,
                'channel': 'R\u00daV',
                'link': 'https://www.ruv.is/sjonvarp/beint?channel=ruv',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 1,
                'castable': 0,
                'channel': 'R\u00daV',
                'link': 'https://www.ruv.is/sjonvarp/spila/songvakeppnin/37135/b24mfi',
                'geoblocked': 0,
                'live': 0
            }],
            'id': 409,
            'name': 'S\u00f6ngvakeppnin',
            'country': 'Iceland',
            'endDateTimeCet': '2025-02-15T22:25:00',
            'dateTimeCet': '2025-02-15T20:45:00'
        }, {
            'stage': 'Final',
            'watchLinks': [{
                'accountRequired': 0,
                'replayable': 1,
                'castable': 1,
                'channel': '1TV',
                'link': 'https://www.youtube.com/live/6J77DMuYPk4',
                'comment': 'Recommended link',
                'geoblocked': 0,
                'live': 1
            }, {
                'accountRequired': 0,
                'replayable': 0,
                'castable': 1,
                'channel': '1TV',
                'link': 'https://www.1tv.am/en/',
                'comment': 'Select "First Channel International"',
                'geoblocked': 0,
                'live': 1
            }],
            'id': 415,
            'name': 'Depi Evratesil',
            'country': 'Armenia',
            'endDateTimeCet': '2025-02-16T19:00:00',
            'dateTimeCet': '2025-02-16T17:00:00'
        }
    ];
}

export async function fetchEvents(): Promise<Event[]> {
    try {
        const client = new DynamoDBClient({
            region: 'eu-west-3'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {modified: _, created: __, rescheduled: ___, previousDateTimeCet: ____, ...lysEvent} = event;
    return lysEvent;
}

export async function publishEventChanges(updatedEvents: Event[], rescheduledEvents: Event[], deletedEvents: Event[]) {
    const client = new DynamoDBClient({
        region: 'eu-west-3'
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