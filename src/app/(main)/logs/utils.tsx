'use client';

import useSWR, { KeyedMutator } from 'swr';
import { fetcher } from '@/app/utils/fetching-utils';
import { ProcessStatuses } from '@/app/types/status';

export function useStatuses(): {
    statuses: ProcessStatuses,
    isLoading: boolean,
    isValidating: boolean,
    error: Error & {
        cause: {response: string, status: number};
    },
    mutate: KeyedMutator<ProcessStatuses>
} {
    const {
        data,
        isLoading,
        isValidating,
        error,
        mutate
    } = useSWR('/api/statuses', fetcher, {
        // the below ensures the data is never revalidated - in other words, that SWR's cache is never *automatically*
        // refreshed with updated data from the source
        // that way, we can keep our data stale (and prevent requests to the backend), until we decide to revalidate it
        // later
        // the below makes this use of useSWR here equivalent to useSWRImmutable - see https://swr.vercel.app/docs/revalidation#disable-automatic-revalidations
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });
    return {
        statuses: data,
        isLoading,
        isValidating,
        error,
        mutate
    };
}