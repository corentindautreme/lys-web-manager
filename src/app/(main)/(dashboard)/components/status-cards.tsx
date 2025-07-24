'use client';

import {
    BoltIcon,
    CheckCircleIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon, ExclamationCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { ProcessStatus, ProcessStatuses } from '@/app/types/status';
import { useEffect, useState } from 'react';
import { useBreakpoint } from '@/app/utils/display-utils';
import { useStatuses } from '@/app/(main)/logs/utils';
import { clsx } from 'clsx';
import Link from 'next/link';

export function StatusCards() {
    const {statuses: loadedStatuses, error} = useStatuses();
    const [statuses, setStatuses] = useState<ProcessStatuses>();

    useEffect(() => {
        if (!!loadedStatuses) {
            setStatuses(loadedStatuses);
        }
    }, [loadedStatuses])

    if (error) return (<div className="flex items-center justify-center h-full font-sans">
        <div
            className="w-full md:w-100 p-3 flex flex-col items-center justify-center text-center">
            <ExclamationCircleIcon className="w-16"/>
            <div className="py-1">
                <span className="font-bold">{error.name}</span> occurred while trying to fetch
                statuses and logs: {error.message}
            </div>
        </div>
    </div>);

    return (
        !statuses
            ? <StatusCardsSkeleton/>
            : <div className="flex lg:flex flex-col xl:grid md:grid grid-cols-2 grid-flow-row gap-2 md:px-3">
                <StatusCard
                    cardName="Triggers"
                    processStatuses={{
                        'daily|trigger': {...statuses['daily|trigger'], name: "Daily" },
                        '5min|trigger': {...statuses['5min|trigger'], name: "5 min" },
                        'weekly|trigger': {...statuses['weekly|trigger'], name: "Weekly" }
                    }}
                />
                <StatusCard
                    cardName="Daily"
                    processStatuses={{
                        'daily|bluesky': {...statuses['daily|bluesky'], name: "Bluesky" },
                        'daily|threads': {...statuses['daily|threads'], name: "Threads" },
                        'daily|twitter': {...statuses['daily|twitter'], name: "Twitter" }
                    }}
                />
                <StatusCard
                    cardName="5min"
                    processStatuses={{
                        '5min|bluesky': {...statuses['5min|bluesky'], name: "Bluesky" },
                        '5min|threads': {...statuses['5min|threads'], name: "Threads" },
                        '5min|twitter': {...statuses['5min|twitter'], name: "Twitter" }
                    }}
                />
                <StatusCard
                    cardName="Weekly"
                    processStatuses={{
                        'weekly|bluesky': {...statuses['weekly|bluesky'], name: "Bluesky" },
                        'weekly|threads': {...statuses['weekly|threads'], name: "Threads" },
                        'weekly|twitter': {...statuses['weekly|twitter'], name: "Twitter" }
                    }}
                />
                <StatusCard
                    cardName="Technical"
                    processStatuses={{
                        'fetcher': {...statuses['fetcher'], name: "Fetcher" },
                        'dump': {...statuses['dump'], name: "Dump" },
                        'refresh': {...statuses['refresh'], name: "Refresh" }
                    }}
                />
            </div>
    )
}

export function StatusCard({cardName, processStatuses}: {
    cardName: string,
    processStatuses: { [p: string]: ProcessStatus & { name: string } }
}) {
    const {isMd} = useBreakpoint('md');
    const [unfolded, setUnfolded] = useState(isMd);

    const unfold = () => setUnfolded(!unfolded);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const atLeastOneThrewError = Object.entries(processStatuses).some(([p, status]) => !status.success);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isAtLeastOneLate = Object.entries(processStatuses).some(([p, status]) => status.isLate);

    const globalStatus = atLeastOneThrewError ? 'error' : isAtLeastOneLate ? 'warn' : 'success';

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.getDate() === today.getDate()
            && date.getMonth() === today.getMonth()
            && date.getFullYear() === today.getFullYear();
    }

    const getLastRunString = (isoDateTime?: string) => {
        if (!isoDateTime) {
            return 'at -';
        }
        const date = new Date(isoDateTime);
        return isToday(date)
            ? `at ${date.toLocaleString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`
            : `on ${date.toLocaleString('en-US', {month: 'short', day: 'numeric'})}`;
    }

    return (<div className="w-full h-fit p-3 rounded-xl bg-foreground/10">
        <button
            className={clsx('w-full', {'mb-2': unfolded})}
            onClick={unfold}
        >
            <div className="flex items-center">
                <div className={clsx('py-0.5 px-2 rounded',
                    {
                        'bg-foreground/10': globalStatus == 'success',
                        'bg-amber-400 text-black': globalStatus === 'warn',
                        'bg-red-400 dark:bg-red-300 text-background': globalStatus === 'error',
                    }
                )}>
                    {cardName}
                </div>
                {unfolded ? <ChevronUpIcon className="ms-2 w-4"/> : <ChevronDownIcon className="ms-2 w-4"/>}
                <div className="grow"></div>
                {globalStatus == 'success' && <CheckCircleIcon className="w-6"/>}
                {globalStatus == 'warn' && <ExclamationTriangleIcon className="w-6"/>}
                {globalStatus == 'error' && <XCircleIcon className="w-6"/>}
            </div>
        </button>
        {unfolded && <div className="flex gap-2 items-center justify-center">
            {Object.entries(processStatuses).map(([process, status]) => (
                <Link href={`/logs?lambda=${process}`}>
                    <div key={`status-${cardName}-${process}`} className="flex flex-col items-center p-2">
                        <div className={clsx('w-fit p-3 rounded-4xl',
                            {
                                'bg-foreground/10': status.success && !status.isLate,
                                'bg-amber-400 text-black': status.success && status.isLate,
                                'bg-red-400 dark:bg-red-300 text-background': !status.success
                            })
                        }>
                            {status.success && status.isLate && <ExclamationTriangleIcon className="w-10"/>}
                            {status.success && !status.isLate && <CheckIcon className="w-10"/>}
                            {!status.success && status.logs.length == 0 && <BoltIcon className="w-10"/>}
                            {!status.success && status.logs.length > 0 && <XMarkIcon className="w-10"/>}
                        </div>
                        <div className={clsx(
                            'my-1 text-center capitalize',
                            {'font-bold': !status.success || status.isLate}
                        )}>
                            {status.name}
                        </div>
                        <div className="text-sm text-center">Last run {getLastRunString(status.lastRun) || '-'}</div>
                    </div>
                </Link>
            ))}
        </div>}
    </div>);
}

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function StatusCardsSkeleton() {
    return (<div className="flex lg:flex flex-col xl:grid md:grid grid-cols-2 grid-flow-row gap-2 md:px-3">
        <StatusCardSkeleton/>
        <div className="hidden md:block"><StatusCardSkeleton/></div>
        <div className="hidden xl:block"><StatusCardSkeleton/></div>
        <div className="hidden xl:block"><StatusCardSkeleton/></div>
    </div>);
}

function StatusCardSkeleton() {
    return (
        <div className="relative overflow-hidden w-full h-fit p-3 rounded-xl bg-foreground/10">
            <div className={shimmer}>
                <div className="h-7 w-16 md:mb-2 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                <div className="hidden md:flex gap-2 items-center justify-center">
                    <div className="flex flex-col items-center p-2">
                        <div className="w-16 h-16 rounded-4xl bg-foreground/10"></div>
                        <div className="mt-3 h-5 w-16 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                        <div className="h-8 mt-2 w-20 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                    </div>
                    <div className="flex flex-col items-center p-2">
                        <div className="w-16 h-16 rounded-4xl bg-foreground/10"></div>
                        <div className="mt-3 h-5 w-16 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                        <div className="h-8 mt-2 w-20 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                    </div>
                    <div className="flex flex-col items-center p-2">
                        <div className="w-16 h-16 rounded-4xl bg-foreground/10"></div>
                        <div className="mt-3 h-5 w-16 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                        <div className="h-8 mt-2 w-20 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                    </div>
                </div>
            </div>
        </div>
    );
}