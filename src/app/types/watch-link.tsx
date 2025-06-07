export interface WatchLink {
    link: string;
    channel: string;
    comment?: string;
    live: 0 | 1;
    replayable: 0 | 1;
    castable: 0 | 1;
    geoblocked: 0 | 1;
    accountRequired: 0 | 1;
}