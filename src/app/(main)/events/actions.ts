'use server';

import { Event } from '@/app/types/events/event'
import { pulishEventChanges } from '@/app/services/events-service';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';

export async function submitEvents(events: Event[]): Promise<DataSubmissionResponse> {
    const updatedEvents = events.filter(e => !e.deleted && (e.created || (e.modified && !e.rescheduled)));
    const rescheduledEvents = events.filter(e => !e.created && !e.deleted && e.rescheduled);
    const deletedEvents = events.filter(e => e.deleted && !e.created);
    try {
        await pulishEventChanges(updatedEvents, rescheduledEvents, deletedEvents);
        console.log(`Updated ${updatedEvents.length + rescheduledEvents.length} and deleted ${deletedEvents.length} events on AWS`);
        return { success: true };
    } catch (error) {
        // TODO AWS error management (test by changing table name in submit steps?)
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