export type LogEvent = {
    timestamp: string;
    message: string;
}

export type LogsByProcess = { [process: string]: LogEvent[] };

export type ProcessStatus = { success: boolean, logs: LogEvent[] };

export type ProcessStatuses = { [process: string]: ProcessStatus };