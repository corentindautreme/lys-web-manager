import { fetchEvents } from '@/app/services/events-service';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    // TODO better error management
    try {
        return NextResponse.json(await fetchEvents());
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, {status: 500});
    }
}