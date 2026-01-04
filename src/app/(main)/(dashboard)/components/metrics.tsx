'use client';

import { useMetrics } from '@/app/(main)/(dashboard)/utils';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { Box } from '@mui/material';
import { LineChart, lineElementClasses, markElementClasses, chartsTooltipClasses } from '@mui/x-charts';
import { ProcessMetrics } from '@/app/types/metrics';

function getCurrentMonthAreaColor(metrics: ProcessMetrics) {
    const lastMeasurement = metrics.measurements[metrics.measurements.length - 1];
    let color = 'var(--color-sky-500)';
    if (lastMeasurement.value > 17_000) {
        color = 'var(--color-red-500)';
    } else if (lastMeasurement.value > 12_000) {
        color = 'var(--color-yellow-500)';
    }
    return `color-mix(in oklab, ${color} 50%, transparent)`;
}

export default function Metrics() {
    const {metrics, isLoading, error} = useMetrics();

    return (
        <>
            <h2 className="flex justify-between my-4">
                <div className="flex items-center gap-2 text-lg">
                    <ChartBarIcon className="w-5"/>
                    <div className="">Metrics</div>
                </div>
            </h2>
            <div className="md:px-3">
                <div className="rounded-xl bg-foreground/10 pt-2 h-[200px] md:h-[300px] w-full">
                    <div className="flex justify-center mt-2">RCU consumption</div>
                    <Box sx={{width: '100%', height: '90%'}} className="!w-[102%] md:!w-[100%] -ms-[3%] md:-ms-3">
                        {isLoading || error
                            ? <div className="h-full w-full flex items-center justify-center">
                                {error ? `Error while loading RCU metrics: ${error.message} (status: ${error.cause.status})` : 'Loading data...'}
                            </div>
                            : <LineChart
                                loading={isLoading}
                                hideLegend={true}
                                series={[
                                    {
                                        data: metrics['previous_month_rcu'].measurements.map(m => m.value),
                                        label: 'Previous month',
                                        color: 'color-mix(in oklab, var(--foreground) 10%, transparent)',
                                        id: 'previous_month_rcu',
                                        area: true,
                                        valueFormatter: (value: number | null) => (value !== null && value > 18_600 ? '⚠️' : '') + value
                                    },
                                    {
                                        data: metrics['current_month_rcu'].measurements.map(m => m.value),
                                        label: 'Current month',
                                        color: getCurrentMonthAreaColor(metrics['current_month_rcu']),
                                        area: true
                                    },
                                    {
                                        data: Array(31).fill(18600),
                                        label: 'Limit',
                                        showMark: false,
                                        color: 'var(--color-red-400)',
                                        valueFormatter: () => null,
                                        disableHighlight: true,
                                        id: 'limit'
                                    }
                                ]}
                                xAxis={[
                                    {
                                        scaleType: 'point',
                                        data: [...Array(31).keys().map(i => i >= 30 ? 'EOM' : (i + 1) + '')],
                                        tickInterval: ['1', '15', 'EOM']
                                    }
                                ]}
                                yAxis={[
                                    {
                                        valueFormatter: (value: number) => value === 0 ? '0' : value / 1_000 + 'k'
                                    }
                                ]}
                                sx={{
                                    [`.${lineElementClasses.root}[data-series="limit"]`]: {
                                        strokeWidth: 2,
                                    },
                                    [`& .${markElementClasses.root}`]: {
                                        r: 0
                                    },
                                    [`& .${markElementClasses.root}.css-tekril-MuiMarkElement-root`]: {
                                        stroke: 0
                                    },
                                    '.MuiChartsAxis-root .MuiChartsAxis-line': {
                                        stroke: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
                                    },
                                    '.MuiChartsAxis-tickLabel': {
                                        fill: 'color-mix(in oklab, var(--foreground) 50%, transparent) !important',
                                        font: 'var(--font-family) !important',
                                        fontSize: '12px !important'
                                    },
                                    '& .MuiChartsAxis-tick': {
                                        stroke: 'color-mix(in oklab, var(--foreground) 30%, transparent) !important',
                                    }
                                }}
                                slotProps={{
                                    tooltip: {
                                        color: 'black',
                                        sx: {
                                            [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.valueCell}, &.${chartsTooltipClasses.root} .${chartsTooltipClasses.labelCell}`]: {
                                                color: 'var(--foreground)',
                                            },
                                            [`&.${chartsTooltipClasses.root} .${chartsTooltipClasses.paper}`]: {
                                                background: 'var(--background)',
                                                color: 'var(--foreground)',
                                            },
                                        },
                                    },
                                }}
                            >
                            </LineChart>
                        }
                    </Box>
                </div>
            </div>
        </>
    );
}