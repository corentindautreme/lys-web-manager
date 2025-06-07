import { LogEvent } from '@/app/types/logs';

export interface ProcessStatus {
    success: boolean;
    logs: LogEvent[];
    lastRun?: string;
    isLate: boolean;
}

export interface ProcessStatuses {
    [process: string]: ProcessStatus;
}