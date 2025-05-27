'use client';

import { Country } from '@/app/types/country'
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCountries } from '@/app/(main)/referential/utils';
import { submitCountryData } from '@/app/(main)/referential/actions';
import { useEffect, useState } from 'react';
import CountryCard from '@/app/(main)/referential/components/country-card';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { clsx } from 'clsx';
import CountryListSkeleton from '@/app/(main)/referential/components/country-list-skeleton';

async function submitModifiedCountryData(countryData: Country[],
                                         onSuccess: (countryData: Country[]) => void,
                                         onError: (errorName: string, message: string) => void) {
    const response: DataSubmissionResponse = await submitCountryData(countryData);
    if (response.success) {
        // reflect the changes pushed to backend: remove deleted countries and reset edition trackers to false
        const updatedCountryData = countryData
            .filter(e => !e.deleted)
            .map(e => {
                e.modified = false;
                e.created = false;
                return e;
            });
        await onSuccess(updatedCountryData);
        redirect('/referential');
    } else {
        onError(response.error || '', response.message || '');
    }
}

function UnsavedCountryDataBanner({count, countryData, callback}: {
    count: number,
    countryData: Country[],
    callback: (countryData: Country[]) => void
}) {
    const [error, setError] = useState('');
    const onError = (errorName: string, message: string) => {
        setError(`${errorName} occurred with message: ${message}`);
    }
    const submit = submitModifiedCountryData.bind(null, countryData, callback, onError);
    return (
        <div className={clsx('flex flex-col rounded-lg p-3 text-background', {
            'bg-sky-500 ': !error,
            'bg-red-400 dark:bg-red-600': !!error,
        })}>
            <div className="flex">
                <span className="flex flex-row content-center">
                    <ExclamationCircleIcon className="w-5 me-1"/>
                    {count} unsaved country data
                </span>
                <div className="grow"></div>
                <form action={submit}>
                    <button className="border-1 border-background px-2">Save</button>
                </form>
            </div>
            {!!error && <div className="flex flex-col mt-2 pt-2 border-t-1 border-background">
                    <span className="flex flex-row content-center">
                        <ExclamationTriangleIcon className="shrink-0 w-5 me-1"/>
                        {error}
                    </span>
                <form className="text-right" action={() => setError('')}>
                    <button type="submit" className="text-sm underline cursor-pointer">Dismiss</button>
                </form>
            </div>}
        </div>
    );
}

export default function CountryList({currentCountryId}: { currentCountryId?: number | undefined }) {
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
                            <UnsavedCountryDataBanner count={modifiedCount} countryData={countryData}
                                                      callback={mutate}/>
                        }

                        <div className="flex mt-2 overflow-y-auto flex-col">
                            {countryData?.map(countryData => {
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
                                                <CountryCard countryData={countryData}
                                                             active={currentCountryId == countryData.id}/>
                                            </Link>
                                        </div>
                                    )
                                }
                            )}

                            <div className="md:hidden h-18"></div>
                        </div>
                    </div>
                </>
            ) : <CountryListSkeleton/>
            }
        </>
    );
}