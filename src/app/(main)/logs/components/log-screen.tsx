'use client';

import { clsx } from 'clsx';
import { BellIcon, ChevronRightIcon, ClockIcon, CogIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ExclamationCircleIcon as ExclamationCircleFullIcon } from '@heroicons/react/16/solid';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStatuses } from '@/app/(main)/logs/utils';
import { ProcessStatuses } from '@/app/types/status';

export default function LogScreen() {
    const {statuses: loadedStatuses, isLoading, error} = useStatuses();
    const [statuses, setStatuses] = useState<ProcessStatuses>();
    const queryParams = useSearchParams();
    const lambdaParam = queryParams.get('lambda');
    const [selectedLog, setSelectedLog] = useState(lambdaParam ? lambdaParam : undefined);
    const [showTimestamp, setShowTimestamp] = useState(true);

    useEffect(() => {
        setStatuses(loadedStatuses);
    }, [loadedStatuses]);

    const publishers = [
        'daily|bluesky',
        'daily|threads',
        'daily|twitter',
        '5min|bluesky',
        '5min|threads',
        '5min|twitter',
        'weekly|bluesky',
        'weekly|threads',
        'weekly|twitter'
    ];

    if (isLoading) {
        return <LogScreenSkeleton/>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="w-full shrink-0 flex items-center gap-x-2 overflow-y-scroll pb-2">
                {!error && !!statuses && <>
                    <BellIcon className="shrink-0 w-5 me-[-0.25em]"/>
                    <div className="font-bold">Publishers</div>
                    {
                        publishers.map((process, index) => (
                            <>
                                {index > 0 && process.substring(0, 4) != publishers[index - 1].substring(0, 4) &&
                                    <div className="border-l-1 border-foreground/10 h-full"></div>
                                }
                                <LogSelector
                                    key={process}
                                    index={index}
                                    name={process}
                                    displayName={process.split('|')}
                                    style={statuses[process].success ? 'normal' : 'error'}
                                    onClick={setSelectedLog}
                                    active={selectedLog === process}
                                />
                            </>
                        ))}
                    <CogIcon className="shrink-0 w-5 me-[-0.25em]"/>
                    <div className="font-bold">Technical</div>
                    {['fetcher', 'dump', 'refresh'].map((process, index) => <LogSelector
                        key={process}
                        index={index}
                        name={process}
                        displayName={process.split('|')}
                        style={statuses[process].success ? 'normal' : 'error'}
                        onClick={setSelectedLog}
                        active={selectedLog === process}
                    />)}
                </>}
            </div>

            <div
                className="relative w-full grow overflow-y-scroll flex flex-col p-3 rounded-xl bg-background border-1 border-foreground/10 dark:border-0 font-mono">
                <div
                    className="absolute top-0 right-0 py-1 px-2 bg-foreground/10 dark:bg-neutral-900 rounded-bl-xl rounded-tr-xl">
                    <div className="flex items-center">
                        <ClockIcon className="w-4 shrink-0"/>
                        <label className="hidden md:flex items-center ms-1 font-sans text-sm"
                               htmlFor="show-timestamps">Show
                            timestamps</label>
                        <div className="grow"></div>
                        <input
                            type="checkbox"
                            className="relative peer ms-1 appearance-none shrink-0 rounded-md w-5 h-5 bg-foreground/10 after:content-[''] after:hidden checked:after:inline-block after:w-2 after:h-3.5 after:ms-1.5 after:mb-0.5 after:rotate-[40deg] after:border-b-3 after:border-r-3 checked:bg-sky-500 after:border-white dark:after:border-black"
                            id="show-timestamps"
                            name="show-timestamps"
                            checked={showTimestamp}
                            onChange={(e) => setShowTimestamp(e.target.checked)}
                        />
                    </div>
                </div>
                {!!selectedLog && !!statuses
                    ? selectedLog in statuses && statuses[selectedLog].logs.length > 0
                        ? statuses[selectedLog].logs.map((log, index) => (
                            <>
                                <div className={clsx('text-sm',
                                    {
                                        'bg-red-700 dark:bg-red-300 text-background': log.message.toLowerCase().includes('error')
                                    }
                                )}>
                                    {showTimestamp && <span className={clsx('text-foreground/50 me-3',
                                        {
                                            'bg-red-700 dark:bg-red-300 text-background!': log.message.toLowerCase().includes('error')
                                        }
                                    )}>{log.timestamp}</span>}
                                    <span>{log.message}</span>
                                </div>
                                {index < statuses[selectedLog].logs.length - 1 && log.message.startsWith('START RequestId') &&
                                    <div className="w-full my-1 border-t-1 border-foreground/30"></div>}
                            </>
                        )) : ('No log found for this process')
                    : (
                        <div className="flex items-center justify-center h-full font-sans">
                            {error
                                ? <div
                                    className="w-full md:w-100 p-3 flex flex-col items-center justify-center text-center">
                                    <ExclamationCircleIcon className="w-16"/>
                                    <div className="py-1">
                                        <span className="font-bold">{error.name}</span> occurred while trying to fetch
                                        statuses and logs: {error.message}
                                    </div>
                                </div>
                                : <div className="text-foreground/50">
                                    Select logs to display
                                </div>
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}

function LogSelector({index, name, displayName, style, onClick, active}: {
    index: number,
    name: string,
    displayName: string[],
    style: 'normal' | 'error'
    onClick: (name: string) => void,
    active: boolean
}) {
    const selectedBackgroundShift = ['0%', '200%', '400%', '200%'];
    const select = onClick.bind(null, name);

    return (
        <button
            className={clsx('rounded text-sm px-1 py-1.5',
                {
                    'bg-foreground/10': !active,
                    'text-white': active
                }
            )}
            style={active ? {
                background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                backgroundBlendMode: 'screen',
                backgroundSize: '100% 600%',
                backgroundPosition: `0 ${selectedBackgroundShift[index % selectedBackgroundShift.length]}`
            } : {}}
            onClick={select}
        >
            <div className="flex items-center">
                {displayName.map(
                    (segment, index) => (
                        <>
                            <span className="capitalize">{segment}</span>
                            {index < displayName.length - 1 && <ChevronRightIcon className="w-3 mx-1"/>}
                        </>
                    )
                )}
                {style == 'error' && <div
                    className={clsx('flex items-center justify-center rounded-xl ms-1',
                        {
                            'text-red-700 dark:text-red-300': !active,
                        }
                    )}><ExclamationCircleFullIcon className="w-4"/></div>}
            </div>
        </button>
    )
}

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function LogScreenSkeleton() {
    return (<div className={`relative overflow-hidden flex flex-col h-full`}>
        <div className="relative overflow-hidden w-fit shrink-0 flex items-center gap-x-2 mb-2">
            <div className={`${shimmer} h-4 w-28 rounded bg-gray-200 dark:bg-gray-400/20`}/>
            <div className={`h-6 w-28 rounded bg-gray-300 dark:bg-gray-400/10`}/>
            <div className="h-6 w-28 rounded bg-gray-300 dark:bg-gray-400/10"/>
            <div className="h-6 w-28 rounded bg-gray-300 dark:bg-gray-400/10"/>
        </div>

        <div
            className="flex flex-col gap-y-1 relative overflow-hidden w-full grow rounded-xl bg-background border-1 border-foreground/10 dark:border p-3">
            <div className={`${shimmer} h-4 w-200 rounded bg-gray-300 dark:bg-gray-400/10`}/>
            <div className="h-4 w-250 rounded bg-gray-300 dark:bg-gray-400/10"/>
            <div className="h-4 w-175 rounded bg-gray-300 dark:bg-gray-400/10"/>
            <div className="h-4 w-200 rounded bg-gray-300 dark:bg-gray-400/10"/>
        </div>
    </div>);
}