'use client';

import { clsx } from 'clsx';
import {
    AdjustmentsHorizontalIcon,
    BellIcon,
    BoltIcon,
    ExclamationTriangleIcon,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useStatuses } from '@/app/(main)/logs/utils';
import { JSX, useEffect, useState } from 'react';
import { useEvents } from '@/app/(main)/events/utils';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import { getLast7DaysEvents, getNext7DaysEvents } from '@/app/(main)/(dashboard)/utils';

export default function ActionCards() {
    const {statuses, error: statusesError} = useStatuses();
    const {events, error: eventsError} = useEvents();
    const {suggestions, error: suggestionsError} = useSuggestions();

    const [actionCards, setActionsCards] = useState<JSX.Element[]>();

    const computeActionCards = () => {
        const actionsCards = [];
        if (statusesError) {
            actionsCards.push(<ActionCard
                key={`actions-status-fetch-error`}
                title="Error"
                category="Dashboard"
                description={<>
                    <span className="font-bold">{statusesError.name}</span> occurred while trying to fetch statuses and
                    logs: {statusesError.message}
                </>}
                type="error"
            />);
        } else {
            actionsCards.push(...Object.entries(statuses!)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([process, status]) => !status.success || status.isLate)
                .map(([process, status], index) => <ActionCard
                    key={`action-${index}`}
                    title={!status.success ? (!!status.lastRun ? 'Error' : 'Down') : 'Warning'}
                    category="Lambda"
                    process={process.includes('|') ? (process.includes('trigger') ? 'Trigger' : 'Lys') : process}
                    options={process.includes('|') ? process : undefined}
                    type={!status.success ? 'error' : 'warn'}
                    description={
                        <div>
                            Lambda
                            {!status.success && (!!status.lastRun ? ' threw an error' : ' has not run in a while')}
                            {status.success && status.isLate && ' has skipped its last run'}
                        </div>
                    }
                    linkHref={`/logs?lambda=${process}`}
                />)
            );
        }

        if (eventsError) {
            actionsCards.push(<ActionCard
                key={`actions-events-fetch-error`}
                title="Error"
                category="Dashboard"
                description={<>
                    <span className="font-bold">{eventsError.name}</span> occurred while trying to fetch
                    events: {eventsError.message}
                </>}
                type="error"
            />);
        } else {
            const upcomingEventsWithoutTimeOrLink = getNext7DaysEvents(events).filter(e => e.dateTimeCet.substring(11, 16) == '00:00' || !e.watchLinks.some(l => l.live == 1)).length;
            const recentEventsWithoutLink = getLast7DaysEvents(events).filter(e => !e.watchLinks.some(l => l.replayable == 1)).length;
            if (upcomingEventsWithoutTimeOrLink > 0) {
                actionsCards.push(<ActionCard
                    type="warn"
                    title="Warning"
                    category="Events"
                    description={<div>{upcomingEventsWithoutTimeOrLink} upcoming event(s) without time or watch
                        link</div>}
                    linkHref={`/events`}
                />);
            }
            if (recentEventsWithoutLink > 0) {
                actionsCards.push(<ActionCard
                    type="warn"
                    title="Warning"
                    category="Events"
                    description={<div>{recentEventsWithoutLink} recent event(s) without replay watch link</div>}
                    linkHref={`/events`}
                />);
            }
        }

        if (suggestionsError) {
            actionsCards.push(<ActionCard
                key={`actions-suggestions-fetch-error`}
                title="Error"
                category="Dashboard"
                description={<>
                    <span className="font-bold">{suggestionsError.name}</span> occurred while trying to fetch
                    suggestions: {suggestionsError.message}
                </>}
                type="error"
            />);
        } else {
            if (suggestions.filter(s => s.reprocessable).length > 0) {
                actionsCards.push(<ActionCard
                    type="info"
                    title="Suggestions"
                    description={
                        <div>There {suggestions.filter(s => s.reprocessable).length > 1 ? 'are' : 'is'} {suggestions.filter(s => s.reprocessable).length} unprocessed
                            suggestion{suggestions.filter(s => s.reprocessable).length > 1 && 's'}</div>}
                    linkHref={`/suggestions`}
                />);
            }
        }
        setActionsCards(actionsCards);
    }

    useEffect(() => {
        if ((!!statuses || !!statusesError) && (!!events || !!eventsError) && (!!suggestions || !!suggestionsError)) {
            computeActionCards();
        }
    }, [statuses, statusesError, events, eventsError, suggestions, suggestionsError])

    return !actionCards
        ? <ActionCardsSkeleton/>
        : (actionCards.length > 0 && <>
            <div className="flex items-center">
                <BellIcon className="w-5 me-2"/>
                <div className="text-lg">Actions</div>
            </div>
            <div className="flex overflow-x-scroll gap-x-2 mt-2 md:px-3">
                {actionCards}
            </div>
        </>);
}

function ActionCard({title, category, process, options, description, type, linkHref}: {
    title?: string;
    category?: string;
    process?: string;
    options?: string;
    description: JSX.Element;
    type: 'error' | 'warn' | 'info',
    linkHref?: string;
}) {
    return (
        <div className={clsx('shrink-0 w-65 md:w-75 text-sm rounded-xl bg-foreground/10 flex items-center')}>
            <Link href={linkHref || '#'} className="w-full">
                <div className="flex flex-col w-full p-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            {title && <div
                                className={clsx('flex items-center gap-0.5 w-fit rounded font-bold px-1 py-0.5', {
                                    'bg-red-400 dark:bg-red-300 text-background': type == 'error',
                                    'bg-amber-400 text-black': type == 'warn',
                                    'bg-foreground/10': type == 'info'
                                })}>
                                {title === 'Down' && <BoltIcon className="w-4"/>}
                                {title === 'Error' && <XMarkIcon className="w-4"/>}
                                {title === 'Warning' && <ExclamationTriangleIcon className="w-4"/>}
                                {title}
                            </div>}
                            {category && <div className="w-fit rounded px-1 py-0.5 bg-foreground/10">
                                {category}
                            </div>}
                        </div>
                        {process && <div className="flex items-center gap-0.5 py-1 text-foreground/50 text-xs">
                            <PlayIcon className="w-4"/>
                            <div>{process}</div>
                            {options && <>
                                <AdjustmentsHorizontalIcon className="w-4"/>
                                <div>{options}</div>
                            </>}
                        </div>}
                        <div className="text-sm py-1">{description}</div>
                    </div>
                </div>
            </Link>
        </div>);
}

export function ActionCardsSkeleton() {
    return <>
        <div className="flex items-center">
            <BellIcon className="w-5 me-2"/>
            <div className="text-lg">Actions</div>
        </div>
        <div className="flex gap-x-2 mt-2 md:px-3">
            <ActionCardSkeleton/>
            <div className="hidden lg:block"><ActionCardSkeleton/></div>
            <div className="hidden xl:block"><ActionCardSkeleton/></div>
            <div className="hidden 2xl:block"><ActionCardSkeleton/></div>
        </div>
    </>;
}

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

function ActionCardSkeleton() {
    return (<div
        className={clsx(`${shimmer} overflow-hidden relative shrink-0 w-65 md:w-75 text-sm p-3 rounded-xl bg-foreground/10 flex items-center`)}>
        <div className="flex items-center gap-x-2 w-full">
            <div className="w-fit bg-foreground/10 p-3 rounded-4xl">
                <div className="w-10 h-10"/>
            </div>
            <div className="flex flex-col w-full">
                <div className="h-4 w-16 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                <div className="h-4 w-full mt-2 rounded-t rounded-e bg-foreground/10 dark:bg-gray-400/20"/>
                <div className="h-4 w-30 rounded-b bg-foreground/10 dark:bg-gray-400/20"/>
                <div className="flex justify-end mt-2">
                    <div className="h-4 w-16 rounded bg-foreground/10 dark:bg-gray-400/20"/>
                </div>
            </div>
        </div>
    </div>);
}