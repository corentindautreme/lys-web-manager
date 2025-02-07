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

export type WatchLink = {
    link: string,
    channel: string,
    comment?: string,
    live: 0 | 1,
    replayable: 0 | 1,
    castable: 0 | 1,
    geoblocked: 0 | 1,
    accountRequired: 0 | 1
}