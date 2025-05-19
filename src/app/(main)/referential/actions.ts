'use server';

import { Country } from '@/app/types/country'
import { EventSubmissionResponse } from '@/app/types/event-submission-response';

export async function submitCountryData(countryData: Country[]): Promise<EventSubmissionResponse> {
    try {
        const updatedCountryData = countryData.filter(e => e.modified && !e.deleted);
        const deletedCountryData = countryData.filter(e => e.deleted && !e.created);
        // TODO submit to AWS
        console.log(`Updated ${updatedCountryData.length} and deleted ${deletedCountryData.length} countries to AWS`);
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