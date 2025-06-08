'use server';

import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { GeneratedEvent, Suggestion } from '@/app/types/suggestion';
import { publishProcessedSuggestions } from '@/app/services/suggestions-service';
import { publishEventChanges } from '@/app/services/events-service';
import { Event } from '@/app/types/events/event';

export async function submitSuggestions(suggestions: Suggestion[]): Promise<DataSubmissionResponse> {
    const processedSuggestions = suggestions.filter(s => s.reprocessable && s.processed);
    try {
        const events = processedSuggestions
            .filter(s => s.accepted)
            .map(s => s.events || [])
            .flat()
            .map((e: GeneratedEvent): Event => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {key: _, ...event} = e;
                return event;
            });
        if (process.env.DEBUG === "TRUE") {
            console.log(`Debug is TRUE - did not update ${processedSuggestions.length} suggestionsnor save ${events.length} events on AWS`);
        } else {
            await publishProcessedSuggestions(processedSuggestions);
            await publishEventChanges(events, [], []);
            console.log(`Updated ${processedSuggestions.length} suggestions and saved ${events.length} events to AWS`);
        }
        return {success: true};
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
                error: 'UnknownError',
                message: JSON.stringify(error)
            };
        }
    }
}