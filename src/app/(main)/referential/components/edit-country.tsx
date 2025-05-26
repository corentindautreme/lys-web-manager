'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCountries } from '@/app/(main)/referential/utils';
import { Country } from '@/app/types/country';
import CountryDetails from '@/app/(main)/referential/components/country-details';

export default function EditCountry({countryId}: { countryId: number }) {
    const {countryData: countries, mutate, isLoading} = useCountries();
    const [countryData, setCountryData] = useState<Country>();

    // once SWR has loaded the data, set the event, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        if (!!countries) {
            const countryData = countries.filter((c: Country) => c.id == countryId)[0];
            setCountryData(countryData);
        }
    }, [countries, countryId]);

    const updateCache = async (countryData: Country) => {
        const newCountries = [...countries].filter((c: Country) => c.id != countryId);
        newCountries.push(countryData);
        newCountries.sort((c1, c2) => c1.country.localeCompare(c2.country));
        await mutate(newCountries);
    }

    const saveCountryData = async (countryData: Country) => {
        await updateCache(countryData);
        redirect('/referential');
    };

    const toggleDelete = async (countryData: Country) => {
        countryData.deleted = !countryData.deleted;
        await updateCache(countryData);
        if (countryData.deleted) {
            redirect('/referential');
        } else {
            setCountryData(countryData);
            // redirect to the current country to force a component remount (and thus display the mutations made to the country list)
            redirect(`/referential/edit/${countryId}`);
        }
    };

    return (
        <>
            {!isLoading && !!countryData ? (
                <CountryDetails countryDataParam={countryData} onSave={saveCountryData} onDelete={toggleDelete}/>
            ) : (
                <>Loading...</>
            )}
        </>
    );
}