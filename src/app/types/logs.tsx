export type LogEvent = {
    timestamp: string;
    message: string;
}

export type LogsByProcess = { [process: string]: LogEvent[] };