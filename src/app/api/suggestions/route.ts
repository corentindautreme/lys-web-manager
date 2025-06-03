import { NextResponse } from 'next/server';
import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { fetchSuggestions, getSuggestions } from '@/app/services/suggestions-service';

export async function GET() {
    try {
        return process.env.DEBUG === "TRUE" ? NextResponse.json(getSuggestions()) : NextResponse.json(await fetchSuggestions());
    } catch (error) {
        if (error instanceof DynamoDBServiceException) {
            return NextResponse.json({error: error.name, message: error.message}, {status: error.$metadata.httpStatusCode || 500});
        }
        else if (error instanceof Error) {
            return NextResponse.json({error: error.name, message: error.message}, {status: 500});
        }
        return NextResponse.json({ error: 'Internal Server Error', message: `Unexpected error: ${JSON.stringify(error)}` }, {status: 500});
    }
}