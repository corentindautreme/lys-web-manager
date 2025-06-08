'use server';

import { Event } from '@/app/types/events/event'
import { publishEventChanges } from '@/app/services/events-service';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';

export async function submitEvents(events: Event[]): Promise<DataSubmissionResponse> {
    const updatedEvents = events.filter(e => !e.deleted && (e.created || (e.modified && !e.rescheduled)));
    const rescheduledEvents = events.filter(e => !e.created && !e.deleted && e.rescheduled);
    const deletedEvents = events.filter(e => e.deleted && !e.created);
    try {
        if (process.env.DEBUG === "TRUE") {
            console.log(`Debug is TRUE - did not update ${updatedEvents.length + rescheduledEvents.length} nor delete ${deletedEvents.length} events on AWS`);
        } else {
            await publishEventChanges(updatedEvents, rescheduledEvents, deletedEvents);
            console.log(`Updated ${updatedEvents.length + rescheduledEvents.length} and deleted ${deletedEvents.length} events on AWS`);
        }
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