import { NextResponse } from 'next/server';
import { fetchCountries } from '@/app/services/countries-service';

export async function GET(req: Request) {
    // TODO better error management
    try {
        return NextResponse.json(await fetchCountries());
    } catch (e) {
        // if (e instanceof Error) {
        //
        // } else {
            return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
        // }
    }
}