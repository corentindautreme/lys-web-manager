export interface Suggestion {
    id: number;
    accepted: boolean;
    country: string;
    dateTimesCet: SuggestionDate[];
    name: string;
    processed: boolean;
    sourceLink: string;
}

interface SuggestionDate {
    context: string;
    dateTimeCet: string;
    sentence: string;
}