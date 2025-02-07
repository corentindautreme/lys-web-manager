'use server';

import { Country } from '@/app/types/country'

export async function submitCountryData(countryData: Country[]) {
    const updatedCountryData = countryData.filter(e => e.modified && !e.deleted);
    const deletedCountryData = countryData.filter(e => e.deleted && !e.created);
    // TODO submit to AWS
    // TODO LysCountry need to be submitted => how to obtain LysCountry from Country?
    console.log(`Updated ${updatedCountryData.length} and deleted ${deletedCountryData.length} countries to AWS`);
}