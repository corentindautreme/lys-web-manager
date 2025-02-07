import { Country } from '@/app/types/country';

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

export function getCountryById(id: number): Country | null {
    const countryData = getCountries().filter(e => e.id == id);
    return countryData.length > 0 ? countryData[0] : null;
}