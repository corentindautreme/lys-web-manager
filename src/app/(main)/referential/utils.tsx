'use client';

import { Country } from '@/app/types/country'
import useSWR from 'swr';

export function useCountries(): {
    countryData: Country[],
    mutate: (countryData: Country[]) => Promise<void>,
    isLoading: boolean,
    isValidating: boolean,
    error: any
} {
    const {
        data,
        mutate,
        isLoading,
        isValidating,
        error
    } = useSWR('/api/countries', url => fetch(url).then(res => res.json()), {
        // the below ensures the data is never revalidated - in other words, that SWR's cache is never *automatically*
        // refreshed with updated data from the source
        // that way, we can keep our updates (aka, mutations) local, until we decide to revalidate it later (which can
        // be never, for the current client browser session anyway)
        // the below makes this use of useSWR here equivalent to useSWRImmutable - see https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });
    return {
        countryData: data,
        mutate: async (countries: Country[]) => {
            await mutate(countries, {revalidate: false});
        },
        isLoading,
        isValidating,
        error
    };
}