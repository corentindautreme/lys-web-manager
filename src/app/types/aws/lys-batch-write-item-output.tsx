import { BatchWriteItemOutput, WriteRequest } from '@aws-sdk/client-dynamodb';

export type LysBatchWriteItemOutput = Omit<BatchWriteItemOutput, 'UnprocessedItems'> & {
    UnprocessedItems: Record<'lys_events' | 'lys_ref_country' | 'lys_suggested_events', WriteRequest[]>;
};