'use client';

import { useMetrics } from '@/app/(main)/(dashboard)/utils';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import { Box } from '@mui/material';
import { LineChart, lineElementClasses, markElementClasses } from '@mui/x-charts';

export default function Metrics() {
    const {metrics, error} = useMetrics();
    console.log(metrics);
    console.log(error);

    return (metrics &&
        <>
            <h2 className="flex justify-between my-4">
                <div className="flex items-center gap-2 text-lg">
                    <ChartBarIcon className="w-5"/>
                    <div className="">Metrics</div>
                </div>
            </h2>
            <div className="md:px-3">
                <Box className="rounded-xl bg-foreground/10 pt-2 pe-1" sx={{width: '100%', height: 300}}>
                    <LineChart
                        series={[
                            {
                                data: metrics['previous_month_rcu'].measurements.map(m => m.value),
                                label: 'Previous month',
                                color: 'color-mix(in oklab, var(--foreground) 30%, transparent)',
                                id: 'previous_month_rcu'
                            },
                            {
                                data: metrics['current_month_rcu'].measurements.map(m => m.value),
                                label: 'Current month',
                                color: 'var(--foreground)'
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
                        xAxis={[{scaleType: 'point', data: [...Array(31).keys().map(i => i + 1)]}]}

                        sx={{
                            [`.${lineElementClasses.root}, .${markElementClasses.root}`]: {
                                strokeWidth: 1,
                            },
                            [`.${lineElementClasses.root}[data-series="previous_month_rcu"]`]: {
                                strokeDasharray: '8 5',
                            },
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
                                // fill: 'var(--foreground)',
                                fill: 'color-mix(in oklab, var(--foreground) 50%, transparent) !important'
                            },
                            // [`.${lineElementClasses.root}[data-series="uvId"]`]: {
                            //     strokeDasharray: '3 4 5 2',
                            // },
                            // [`.${markElementClasses.root}:not(.${markElementClasses.highlighted})`]: {
                            //     fill: '#fff',
                            // },
                            // [`& .${markElementClasses.highlighted}`]: {
                            //     stroke: 'none',
                            // },
                        }}
                    />
                </Box>
            </div>
        </>
    );
}