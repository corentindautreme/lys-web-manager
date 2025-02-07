import { NextResponse } from 'next/server';
import { getCountries } from '@/app/services/countries-service';

export function GET(req: Request) {
    return NextResponse.json(getCountries());
}