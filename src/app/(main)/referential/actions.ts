'use server';

import { Country } from '@/app/types/country'
import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { pulishCountryChanges } from '@/app/services/countries-service';

export async function submitCountryData(countryData: Country[]): Promise<DataSubmissionResponse> {
    try {
        const updatedCountryData = countryData.filter(e => e.modified && !e.deleted);
        const deletedCountryData = countryData.filter(e => e.deleted && !e.created);
        if (process.env.DEBUG === "TRUE") {
            console.log(`Debug is TRUE - did not update ${updatedCountryData.length} nor delete ${deletedCountryData.length} country data on AWS`);
        } else {
            await pulishCountryChanges(updatedCountryData, deletedCountryData);
            console.log(`Updated ${updatedCountryData.length} and deleted ${deletedCountryData.length} countries to AWS`);
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