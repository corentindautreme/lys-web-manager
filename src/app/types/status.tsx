import { LogEvent } from '@/app/types/logs';

export type ProcessStatus = {
    success: boolean,
    logs: LogEvent[],
    lastRun?: string,
    isLate: boolean
};

export type ProcessStatuses = { [process: string]: ProcessStatus };