'use client';

import { Country } from '@/app/types/country'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useCountries } from '@/app/(main)/referential/utils';
import { submitCountryData } from '@/app/(main)/referential/actions';
import { KeyedMutator } from 'swr';
import { useEffect, useState } from 'react';
import CountryCard from '@/app/(main)/referential/components/country-card';

async function submitModifiedCountryData(countryData: Country[], callback: KeyedMutator<Country[]>) {
    await submitCountryData(countryData);
    // reflect the changes pushed to backend: remove deleted events and reset "modified" to false
    const updatedCountryData = countryData
        .filter(e => !e.deleted)
        .map(e => {
            e.modified = false;
            return e;
        });
    await callback(countryData);
    redirect('/referential');
}

function UnsavedCountryDataBanner({count, countryData, callback}: {
    count: number,
    countryData: Country[],
    callback: KeyedMutator<Country[]>
}) {
    const submit = submitModifiedCountryData.bind(null, countryData, callback);
    return (
        <form action={submit}>
            {/*<div className="flex rounded-lg p-3 bg-sky-300 dark:bg-sky-700">*/}
            <div className="flex rounded-lg p-3 bg-sky-500 text-background">
                <span className="flex flex-row content-center">
                    <ExclamationCircleIcon className="w-5 me-1"/>
                    {count} unsaved country data
                </span>
                <div className="grow"></div>
                <button className="border-1 border-background px-2">Save</button>
            </div>
        </form>
    )
}

export default function CountryList({currentCountryId}: { currentCountryId?: number | undefined }
) {
    const {countryData: loadedCountryData, mutate, isLoading} = useCountries();
    const [countryData, setCountryData] = useState(loadedCountryData);
    const modifiedCount = countryData?.filter(c => c.modified || c.deleted).length;

    // once SWR has loaded the data, set the event, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        setCountryData(loadedCountryData);
    }, [loadedCountryData]);

    return (
        <>
            {!isLoading && !!countryData ? (
                <>
                    <div className="h-full flex flex-col">
                        {modifiedCount > 0 &&
                            <UnsavedCountryDataBanner count={modifiedCount} countryData={countryData} callback={mutate}/>}

                        <div className="flex mt-2 overflow-y-auto flex-col">
                            {countryData?.map((countryData, idx) => {
                                    return (
                                        <div key={countryData.id}>
                                            <Link href={`/referential/edit/${countryData.id}#${countryData.id}`}>
                                                {/*
                        Stick the ID on a relative div, so that navigating to # "scrolls back up" a litle bit, to
                        give a visual cue that there's more above in the list
                        */}
                                                <div
                                                    id={countryData.id.toString()}
                                                    className="relative top-[-20px]"
                                                />
                                                <CountryCard countryData={countryData} active={currentCountryId == countryData.id}/>
                                            </Link>
                                        </div>
                                    )
                                }
                            )}
                        </div>
                    </div>
                </>
            ) : ('Loading...')}
        </>
    );
}