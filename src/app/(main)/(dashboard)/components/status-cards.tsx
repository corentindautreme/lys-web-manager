'use client';

import {
    CheckCircleIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpIcon, ExclamationCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { ProcessStatuses } from '@/app/types/status';
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
                    cardName="Daily"
                    processStatuses={{
                        'daily|bluesky': statuses['daily|bluesky'],
                        'daily|threads': statuses['daily|threads'],
                        'daily|twitter': statuses['daily|twitter']
                    }}
                />
                <StatusCard
                    cardName="5min"
                    processStatuses={{
                        '5min|bluesky': statuses['5min|bluesky'],
                        '5min|threads': statuses['5min|threads'],
                        '5min|twitter': statuses['5min|twitter']
                    }}
                />
                <StatusCard
                    cardName="Weekly"
                    processStatuses={{
                        'weekly|bluesky': statuses['weekly|bluesky'],
                        'weekly|threads': statuses['weekly|threads'],
                        'weekly|twitter': statuses['weekly|twitter']
                    }}
                />
                <StatusCard
                    cardName="Technical"
                    processStatuses={{
                        'fetcher': statuses['fetcher'],
                        'dump': statuses['dump'],
                        'refresh': statuses['refresh']
                    }}
                />
            </div>
    )
}

export function StatusCard({cardName, processStatuses}: {
    cardName: string,
    processStatuses: ProcessStatuses
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
                <div key={`status-${cardName}-${process}`} className="flex flex-col items-center p-2">
                    <div className={clsx('w-fit p-3 rounded-4xl',
                        {
                            'bg-foreground/10': status.success && !status.isLate,
                            'bg-amber-400 text-black': status.success && status.isLate,
                            'bg-red-400 dark:bg-red-300 text-background': !status.success
                        })
                    }>
                        {status.success
                            ? status.isLate ? <ExclamationTriangleIcon className="w-10"/> :
                                <CheckIcon className="w-10"/>
                            : <XMarkIcon className="w-10"/>
                        }
                    </div>
                    <Link href={`/logs?lambda=${process}`}>
                        <div className={clsx(
                            'my-1 text-center capitalize',
                            {'font-bold': !status.success || status.isLate}
                        )}>
                            {process.split('|').reverse()[0]}
                        </div>
                        <div className="text-sm text-center">Last run {getLastRunString(status.lastRun) || '-'}</div>
                    </Link>
                </div>
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