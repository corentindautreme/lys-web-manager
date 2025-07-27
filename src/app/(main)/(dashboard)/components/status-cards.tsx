'use client';

import {
    ArrowPathIcon,
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
import { useEffect, useRef, useState } from 'react';
import { useBreakpoint } from '@/app/utils/display-utils';
import { useStatuses } from '@/app/(main)/logs/utils';
import { clsx } from 'clsx';
import Link from 'next/link';

export function StatusCards() {
    const {statuses: loadedStatuses, error, isValidating, mutate} = useStatuses();
    const [statuses, setStatuses] = useState<ProcessStatuses>();
    const statusesRef = useRef(statuses);

    const [showReloadTriggers, setShowReloadTriggers] = useState(false);
    const [reloadingTriggers, setReloadingTriggers] = useState(false);
    const [showReloadPublishers, setShowReloadPublishers] = useState(false);
    const [reloadingPublishers, setReloadingPublishers] = useState(false);
    const [showReloadFetcher, setShowReloadFetcher] = useState(false);
    const [reloadingFetcher, setReloadingFetcher] = useState(false);
    const [showReloadRefresh, setShowReloadRefresh] = useState(false);
    const [reloadingRefresh, setReloadingRefresh] = useState(false);
    const [showReloadDump, setShowReloadDump] = useState(false);
    const [reloadingDump, setReloadingDump] = useState(false);

    useEffect(() => {
        if (!!loadedStatuses) {
            setStatuses(loadedStatuses);
            statusesRef.current = loadedStatuses;
        }
    }, [loadedStatuses]);

    const updateStatusesCache = (statuses: ProcessStatuses) => {
        mutate(statuses);
    }

    useEffect(() => {
        async function updateTriggersStatuses() {
            const triggerStatuses = await fetch('/api/statuses/reload?processes=trigger').then(res => res.json()) as ProcessStatuses;
            const newStatuses = {...statusesRef.current, ...triggerStatuses};
            updateStatusesCache(newStatuses);
            statusesRef.current = newStatuses;
        }

        if (reloadingTriggers) {
            updateTriggersStatuses().then(() => setReloadingTriggers(false));
        }
    }, [reloadingTriggers]);

    useEffect(() => {
        async function updatePublishersStatuses() {
            const publisherStatuses = await fetch('/api/statuses/reload?processes=publisher').then(res => res.json()) as ProcessStatuses;
            const newStatuses = {...statusesRef.current, ...publisherStatuses};
            updateStatusesCache(newStatuses);
            statusesRef.current = newStatuses;
        }

        if (reloadingPublishers) {
            updatePublishersStatuses().then(() => setReloadingPublishers(false));
        }
    }, [reloadingPublishers]);

    useEffect(() => {
        async function updateFetcherStatuses() {
            const fetcherStatus = await fetch('/api/statuses/reload?processes=fetcher').then(res => res.json()) as ProcessStatuses;
            const newStatuses = {...statusesRef.current, ...fetcherStatus};
            updateStatusesCache(newStatuses);
            statusesRef.current = newStatuses;
        }

        if (reloadingFetcher) {
            updateFetcherStatuses().then(() => setReloadingFetcher(false));
        }
    }, [reloadingFetcher]);

    useEffect(() => {
        async function updateDumpStatuses() {
            const dumpStatus = await fetch('/api/statuses/reload?processes=dump').then(res => res.json()) as ProcessStatuses;
            const newStatuses = {...statusesRef.current, ...dumpStatus};
            updateStatusesCache(newStatuses);
            statusesRef.current = newStatuses;
        }

        if (reloadingDump) {
            updateDumpStatuses().then(() => setReloadingDump(false));
        }
    }, [reloadingDump]);

    useEffect(() => {
        async function updateRefreshStatus() {
            const refreshStatus = await fetch('/api/statuses/reload?processes=refresh').then(res => res.json()) as ProcessStatuses;
            const newStatuses = {...statusesRef.current, ...refreshStatus};
            updateStatusesCache(newStatuses);
            statusesRef.current = newStatuses;
        }

        if (reloadingRefresh) {
            updateRefreshStatus().then(() => setReloadingRefresh(false));
        }
    }, [reloadingRefresh]);

    const reloadTriggerStatuses = () => {
        if (!showReloadTriggers) {
            setShowReloadTriggers(true);
        } else {
            setReloadingTriggers(true);
            setShowReloadTriggers(false);
        }
    }

    const reloadPublisherStatuses = () => {
        if (!showReloadPublishers) {
            setShowReloadPublishers(true);
        } else {
            setReloadingPublishers(true);
            setShowReloadPublishers(false);
        }
    }

    const reloadFetcherStatus = () => {
        if (!showReloadFetcher) {
            setShowReloadFetcher(true);
        } else {
            setReloadingFetcher(true);
            setShowReloadFetcher(false);
        }
    }

    const reloadDumpStatus = () => {
        if (!showReloadDump) {
            setShowReloadDump(true);
        } else {
            setReloadingDump(true);
            setShowReloadDump(false);
        }
    }

    const reloadRefreshStatus = () => {
        if (!showReloadRefresh) {
            setShowReloadRefresh(true);
        } else {
            setReloadingRefresh(true);
            setShowReloadRefresh(false);
        }
    }

    const reloadStatuses = (process: string) => {
        if (process === 'trigger') {
            reloadTriggerStatuses();
        } else if (process === 'publisher') {
            reloadPublisherStatuses();
        } else if (process === 'fetcher') {
            reloadFetcherStatus();
        } else if (process === 'dump') {
            reloadDumpStatus();
        } else if (process === 'refresh') {
            reloadRefreshStatus();
        }
    }

    const showReloadTechnical = (process: string) => {
        if (process === 'fetcher') {
            return showReloadFetcher;
        } else if (process === 'dump') {
            return showReloadDump;
        } else if (process === 'refresh') {
            return showReloadRefresh;
        } else {
            return false;
        }
    }

    const isReloadingTechnical = (process: string) => {
        if (process === 'fetcher') {
            return reloadingFetcher;
        } else if (process === 'dump') {
            return reloadingDump;
        } else if (process === 'refresh') {
            return reloadingRefresh;
        } else {
            return false;
        }
    }

    return (
        <>
            <h2 className="flex justify-between my-4">
                <div className="flex items-center gap-2 text-lg">
                    <BoltIcon className="w-5"/>
                    <div className="">Status</div>
                </div>
                <button onClick={() => mutate()} disabled={isValidating}>
                    <div className={clsx('flex items-center gap-1 rounded py-1 px-2',
                        {
                            'text-foreground/50 cursor-not-allowed': isValidating,
                            'bg-foreground/10 cursor-pointer': !isValidating
                        }
                    )}>
                        <ArrowPathIcon
                            className={clsx('w-4', {'animate-spin': isValidating})}/> {isValidating ? 'Loading...' : 'Reload'}
                    </div>
                </button>
            </h2>
            {error ? <Error error={error}/> : !statuses
                ? <StatusCardsSkeleton/>
                : <div className={clsx('flex lg:flex flex-col xl:grid md:grid grid-cols-2 grid-flow-row gap-2 md:px-3',
                    {
                        'opacity-50': isValidating
                    }
                )}>
                    <StatusCard
                        cardName="Triggers"
                        processStatuses={{
                            'daily|trigger': {...statuses['daily|trigger'], name: 'Daily', process: 'trigger'},
                            '5min|trigger': {...statuses['5min|trigger'], name: '5 min', process: 'trigger'},
                            'weekly|trigger': {...statuses['weekly|trigger'], name: 'Weekly', process: 'trigger'}
                        }}
                        reloadStatuses={reloadStatuses}
                        showReloadBtn={() => showReloadTriggers}
                        isReloading={() => reloadingTriggers}
                    />
                    <StatusCard
                        cardName="Daily"
                        processStatuses={{
                            'daily|bluesky': {...statuses['daily|bluesky'], name: 'Bluesky', process: 'publisher'},
                            'daily|threads': {...statuses['daily|threads'], name: 'Threads', process: 'publisher'},
                            'daily|twitter': {...statuses['daily|twitter'], name: 'Twitter', process: 'publisher'}
                        }}
                        reloadStatuses={reloadStatuses}
                        showReloadBtn={() => showReloadPublishers}
                        isReloading={() => reloadingPublishers}
                    />
                    <StatusCard
                        cardName="5min"
                        processStatuses={{
                            '5min|bluesky': {...statuses['5min|bluesky'], name: 'Bluesky', process: 'publisher'},
                            '5min|threads': {...statuses['5min|threads'], name: 'Threads', process: 'publisher'},
                            '5min|twitter': {...statuses['5min|twitter'], name: 'Twitter', process: 'publisher'}
                        }}
                        reloadStatuses={reloadStatuses}
                        showReloadBtn={() => showReloadPublishers}
                        isReloading={() => reloadingPublishers}
                    />
                    <StatusCard
                        cardName="Weekly"
                        processStatuses={{
                            'weekly|bluesky': {...statuses['weekly|bluesky'], name: 'Bluesky', process: 'publisher'},
                            'weekly|threads': {...statuses['weekly|threads'], name: 'Threads', process: 'publisher'},
                            'weekly|twitter': {...statuses['weekly|twitter'], name: 'Twitter', process: 'publisher'}
                        }}
                        reloadStatuses={reloadStatuses}
                        showReloadBtn={() => showReloadPublishers}
                        isReloading={() => reloadingPublishers}
                    />
                    <StatusCard
                        cardName="Technical"
                        processStatuses={{
                            'fetcher': {...statuses['fetcher'], name: 'Fetcher', process: 'fetcher'},
                            'dump': {...statuses['dump'], name: 'Dump', process: 'dump'},
                            'refresh': {...statuses['refresh'], name: 'Refresh', process: 'refresh'}
                        }}
                        reloadStatuses={reloadStatuses}
                        showReloadBtn={(process: string) => showReloadTechnical(process)}
                        isReloading={(process: string) => isReloadingTechnical(process)}
                    />
                </div>}
        </>
    )
}

function Error({error}: { error: Error & { cause: { response: string; status: number; } } }) {
    return (<div className="flex items-center justify-center h-full font-sans">
        <div
            className="w-full md:w-100 p-3 flex flex-col items-center justify-center text-center">
            <ExclamationCircleIcon className="w-16"/>
            <div className="py-1">
                <span className="font-bold">{error.name}</span> occurred while trying to fetch
                statuses and logs: {error.message}
            </div>
        </div>
    </div>);
}

export function StatusCard({cardName, processStatuses, reloadStatuses, showReloadBtn, isReloading}: {
    cardName: string,
    processStatuses: { [p: string]: ProcessStatus & { name: string, process: string } },
    reloadStatuses: (process: string) => void,
    showReloadBtn: (process: string) => boolean,
    isReloading: (process: string) => boolean
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
                {!Object.values(processStatuses).map(s => s.process).some(p => isReloading(p)) && globalStatus == 'success' &&
                    <CheckCircleIcon className="w-6"/>}
                {!Object.values(processStatuses).map(s => s.process).some(p => isReloading(p)) && globalStatus == 'warn' &&
                    <ExclamationTriangleIcon className="w-6"/>}
                {!Object.values(processStatuses).map(s => s.process).some(p => isReloading(p)) && globalStatus == 'error' &&
                    <XCircleIcon className="w-6"/>}
                {Object.values(processStatuses).map(s => s.process).some(p => isReloading(p)) &&
                    <ArrowPathIcon className="w-6 animate-spin"/>}
            </div>
        </button>
        {unfolded && <div className="flex gap-2 items-center justify-center">
            {Object.entries(processStatuses).map(([process, status]) => (
                <div key={`status-${cardName}-${process}`} className="flex flex-col items-center p-2">
                    <button
                        onClick={() => reloadStatuses(status.process)}
                        disabled={isReloading(status.process)}
                    >
                        <div className={clsx('w-fit p-3 rounded-4xl',
                            {
                                'bg-foreground/10': status.success && !status.isLate,
                                'bg-amber-400 text-black': status.success && status.isLate,
                                'bg-red-400 dark:bg-red-300 text-background': !status.success,
                                'opacity-50 animate-spin': isReloading(status.process)
                            })
                        }>
                            {!showReloadBtn(status.process) && !isReloading(status.process) && status.success && status.isLate &&
                                <ExclamationTriangleIcon className="w-10"/>}
                            {!showReloadBtn(status.process) && !isReloading(status.process) && status.success && !status.isLate &&
                                <CheckIcon className="w-10"/>}
                            {!showReloadBtn(status.process) && !isReloading(status.process) && !status.success && status.logs.length == 0 &&
                                <BoltIcon className="w-10"/>}
                            {!showReloadBtn(status.process) && !isReloading(status.process) && !status.success && status.logs.length > 0 &&
                                <XMarkIcon className="w-10"/>}
                            {(showReloadBtn(status.process) || isReloading(status.process)) &&
                                <ArrowPathIcon className="w-10"/>}
                        </div>
                    </button>
                    <Link href={`/logs?lambda=${process}`} className={clsx({'opacity-50': isReloading(status.process)})}>
                        <div className={clsx(
                            'my-1 text-center capitalize',
                            {'font-bold': !status.success || status.isLate}
                        )}>
                            {status.name}
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