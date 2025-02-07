'use client';

import { Event } from '@/app/types/events/event'
import useSWR from 'swr';

export function useEvents(): {
    events: Event[],
    mutate: (events: Event[]) => Promise<void>,
    isLoading: boolean,
    isValidating: boolean,
    error: any
} {
    const fetcher = (url: string) => fetch(url).then(res => {
        if (res.ok) {
            return res.json();
        }
        const error = new Error('Could not fetch events');
        error.message = 'Could not fetch events';
        error.cause = {
            // TODO res.text() or res.json() don't work
            response: res.text(),
            status: res.status
        };
        throw error;
    });
    const {
        data,
        mutate,
        isLoading,
        isValidating,
        error
    } = useSWR('/api/events', fetcher, {
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
        events: data,
        mutate: async (events: Event[]) => {
            await mutate(events, {revalidate: false});
        },
        isLoading,
        isValidating,
        error
    };
}