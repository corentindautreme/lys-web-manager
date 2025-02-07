import { WatchLink } from '@/app/types/events/event';

export interface LysCountry {
    id: number;
    country: string;
    countryCode: string;
    eventName: string;
    altEventNames: string[];
    stages: string[];
    watchLinks: WatchLink[];
    defaultChannel?: string;
    likelyDates: string[];
    scheduleLink?: string;
    scheduleDeviceTime?: 0 | 1;
}

export interface Country extends LysCountry {
    modified?: boolean;
    deleted?: boolean;
    created?: boolean;
}