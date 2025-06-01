import { WatchLink } from '@/app/types/watch-link';

export interface LysEvent {
    id: number;
    name: string;
    country: string;
    stage: string;
    watchLinks: WatchLink[];
    dateTimeCet: string;        // "2023-10-27T21:00:00"
    endDateTimeCet: string;     // "2023-10-27T23:00:00"
}

export interface Event extends LysEvent {
    modified?: boolean;
    deleted?: boolean;
    created?: boolean;
    rescheduled?: boolean;
    previousDateTimeCet?: string;
}

export type ValidEvent = Event & {
    error: boolean;
}