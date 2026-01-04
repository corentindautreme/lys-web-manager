
export interface UsageMetrics {
    [process: string]: ProcessMetrics;
}

export interface ProcessMetrics {
    measurements: {label: string, value: number}[];
}