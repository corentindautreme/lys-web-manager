import { Event } from '@/app/types/events/event';

export interface LysSuggestion {
    id: number;
    accepted: boolean;
    country: string;
    dateTimesCet: SuggestionDate[];
    name: string;
    processed: boolean;
    sourceLink: string;
}

export interface SuggestionDate {
    context: string;
    dateTimeCet: string;
    sentence: string;
    selected?: boolean;
}

export type GeneratedEvent = Event & {
    key: string;
}

export interface Suggestion extends LysSuggestion {
    events?: GeneratedEvent[];
    reprocessable: boolean;
    extractionDate?: string;
}

export interface SourceDetails {
    title: string;
    description: string;
    image: string;
}

export interface SourceDetailsResponse {
    data?: SourceDetails;
    error?: {error: string, message: string};
}