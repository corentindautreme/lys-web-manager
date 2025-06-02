import { NextResponse } from 'next/server';
import { fetchLysProcessStatuses } from '@/app/services/logs-service';

export async function GET() {
    try {
        return NextResponse.json(await fetchLysProcessStatuses());
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.name, message: error.message}, {status: 500});
        }
        return NextResponse.json({ error: 'Internal Server Error', message: `Unexpected error: ${JSON.stringify(error)}` }, {status: 500});
    }
}