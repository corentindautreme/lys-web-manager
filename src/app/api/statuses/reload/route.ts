import { NextRequest, NextResponse } from 'next/server';
import { fetchLysProcessStatuses, reloadLysProcessesStatuses } from '@/app/services/logs-service';

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const processes = (searchParams.get('processes') || "").split(",");
    try {
        return process.env.DEBUG === "TRUE" ? NextResponse.json(reloadLysProcessesStatuses(processes)) : NextResponse.json(await fetchLysProcessStatuses(processes));
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({error: error.name, message: error.message}, {status: 500});
        }
        return NextResponse.json({ error: 'Internal Server Error', message: `Unexpected error: ${JSON.stringify(error)}` }, {status: 500});
    }
}