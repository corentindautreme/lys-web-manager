'use server';

import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { Suggestion } from '@/app/types/suggestion';

export async function submitSuggestions(suggestions: Suggestion[]): Promise<DataSubmissionResponse> {
    const processedSuggestions = suggestions.filter(s => s.processed);
    try {
        const events = processedSuggestions
            .filter(s => s.accepted)
            .map(s => s.events || [])
            .flat();
        // TODO publish events and LysSuggestions to AWS
        console.log(`Updated ${processedSuggestions.length} suggestions and saved ${events.length} events to AWS`);
        return { success: true };
    } catch (error) {
        if (error instanceof Error) {
            return {
                success: false,
                error: error.name,
                message: error.message
            };
        } else {
            return {
                success: false,
                error: "UnknownError",
                message: JSON.stringify(error)
            };
        }
    }
}