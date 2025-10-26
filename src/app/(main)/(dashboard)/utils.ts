import { Event } from '@/app/types/events/event';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetching-utils';
import { UsageMetrics } from '@/app/types/metrics';

export function getNext7DaysEvents(events: Event[]) {
    const now = new Date().toISOString().split('.')[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(new Date().getDate() + 7);
    const then = sevenDaysFromNow.toISOString().split('.')[0];
    return events.filter(e => e.endDateTimeCet >= now && e.endDateTimeCet <= then);
}

export function getLast7DaysEvents(events: Event[]) {
    const now = new Date().toISOString().split('.')[0];
    const sevenDaysBeforeNow = new Date();
    sevenDaysBeforeNow.setDate(new Date().getDate() - 7);
    const then = sevenDaysBeforeNow.toISOString().split('.')[0];
    return events.filter(e => e.endDateTimeCet >= then && e.endDateTimeCet <= now);
}

export function useMetrics(): {
    metrics: UsageMetrics,
    isLoading: boolean,
    isValidating: boolean,
    error: Error & {
        cause: {response: string, status: number};
    }
} {
    const {
        data,
        isLoading,
        isValidating,
        error
    } = useSWR('/api/metrics', fetcher, {
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
        metrics: data,
        isLoading,
        isValidating,
        error
    };
}