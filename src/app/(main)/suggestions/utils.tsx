'use client';

import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetching-utils';
import { Suggestion } from '@/app/types/suggestion';

export function useSuggestions(): {
    suggestions: Suggestion[],
    mutate: (suggestions: Suggestion[]) => Promise<void>,
    isLoading: boolean,
    isValidating: boolean,
    error: Error & {
        cause: {response: string, status: number};
    }
} {
    const {
        data,
        mutate,
        isLoading,
        isValidating,
        error
    } = useSWR('/api/suggestions', fetcher, {
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
        suggestions: data,
        mutate: async (suggestions: Suggestion[]) => {
            await mutate(suggestions, {revalidate: false, optimisticData: suggestions});
        },
        isLoading,
        isValidating,
        error
    };
}