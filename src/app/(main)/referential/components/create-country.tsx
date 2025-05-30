'use client';

import { redirect, useSearchParams } from 'next/navigation';
import { useCountries } from '@/app/(main)/referential/utils';
import { Country } from '@/app/types/country';
import CountryDetails from '@/app/(main)/referential/components/country-details';

export default function CreateCountry() {
    const queryParams = useSearchParams();
    const fromId = queryParams.get('fromId');
    const {countryData, mutate} = useCountries();
    const id = countryData.toSorted((c1, c2) => c2.id - c1.id)[0].id + 1;
    const countryDataToCopy = fromId ? countryData.filter((countryData: Country) => countryData.id === parseInt(fromId, 10))[0] : null;

    const saveCountryData = async (newCountry: Country) => {
        const newCountryData = [...countryData, newCountry];
        newCountryData.sort((c1, c2) => c1.country.localeCompare(c2.country));
        await mutate(newCountryData);
        redirect('/referential');
    };

    const newCountryData = countryDataToCopy ? {
        id: id,
        country: countryDataToCopy.country,
        countryCode: countryDataToCopy.countryCode,
        eventName: countryDataToCopy.eventName,
        altEventNames: [...countryDataToCopy.altEventNames],
        stages: [...countryDataToCopy.stages],
        watchLinks: [...countryDataToCopy.watchLinks],
        defaultChannel: countryDataToCopy.defaultChannel,
        likelyDates: [...countryDataToCopy.likelyDates],
        scheduleLink: countryDataToCopy.scheduleLink,
        scheduleDeviceTime: countryDataToCopy.scheduleDeviceTime,
        modified: true,
        created: true
    } : {
        id: id,
        country: '',
        countryCode: '',
        eventName: '',
        altEventNames: [],
        stages: ['Night...', 'Final'],
        watchLinks: [],
        defaultChannel: '',
        likelyDates: [],
        scheduleLink: '',
        scheduleDeviceTime: 0,
        modified: true,
        created: true
    } as Country;

    return (
        <CountryDetails countryDataParam={newCountryData} onSave={saveCountryData}/>
    );
}