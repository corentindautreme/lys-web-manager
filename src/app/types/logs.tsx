export interface LogEvent {
    timestamp: string;
    message: string;
}

export interface LogsByProcess {
    [process: string]: LogEvent[];
}