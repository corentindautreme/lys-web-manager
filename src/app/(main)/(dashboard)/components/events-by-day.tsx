'use client';

import { Event, ValidEvent } from '@/app/types/events/event';
import { EventCardLite } from '@/app/components/events/event/event-cards';
import { useEffect, useState } from 'react';
import { CheckIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';
import { EventCardLiteSkeleton } from '@/app/components/events/event/event-card-skeletons';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function EventsByDay({eventsParam, showErrorOnly, errorPredicate, showLinks}: {
    eventsParam: Event[],
    showErrorOnly: boolean,
    errorPredicate: (e: Event) => boolean,
    showLinks: 'live' | 'vod' | 'both'
}) {
    const [eventsByDate, setEventsByDate] = useState<{ [date: string]: ValidEvent[] }>();
    const dateBackgroundShift = ['0 0', '0 -100%', '-100% 0', '-100% -100%', '-200% 0', '-200% -100%']

    const computeEventsByDate = (events: ValidEvent[]): { [date: string]: ValidEvent[] } => {
        const eventsByDate = events.reduce((out, e) => {
            const day = new Date(e.dateTimeCet).toLocaleString('en-GB', {weekday: 'short', day: 'numeric'});
            if (day in out) {
                out[day].push(e);
                return out;
            } else {
                out[day] = [e];
                return out;
            }
        }, {} as { [date: string]: ValidEvent[] });
        for (const day in eventsByDate) {
            eventsByDate[day].sort((e1, e2) => e1.error != e2.error ? Number(e2.error) - Number(e1.error) : e1.dateTimeCet.localeCompare(e2.dateTimeCet))
        }
        return eventsByDate;
    }

    useEffect(() => {
        let events = eventsParam.map(e => ({
            ...e,
            error: errorPredicate(e),
        } as ValidEvent));
        if (showErrorOnly) {
            events = events.filter(e => e.error);
        }
        setEventsByDate(computeEventsByDate(events));
    }, [showErrorOnly]);

    return !!eventsByDate ? <>
        {
            Object.keys(eventsByDate).length == 0 ? <EmptyEventsByDay showErrorOnly={showErrorOnly}/> : (
                <div className="relative flex gap-x-2 overflow-x-scroll">
                    {Object.entries(eventsByDate).map(([date, events], index) => (
                        <div className="relative grow min-w-65 max-h-85 pt-5" key={date}>
                            <div
                                className="absolute top-1 left-[50%] rounded-xl transform-[translateX(-50%)] w-fit px-3 py-1 text-white"
                                style={{
                                    background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                                    backgroundBlendMode: 'screen',
                                    backgroundSize: '200% 200%',
                                    backgroundPosition: `${dateBackgroundShift[index % dateBackgroundShift.length]}`
                                }}
                            >
                                {date}
                            </div>
                            <div className="p-3 pt-8 h-full rounded-xl bg-white dark:bg-foreground/10">
                                <div className="flex flex-col gap-y-1.5 h-full overflow-y-scroll">
                                    {events.map(e =>
                                        <div key={e.id} className={clsx('rounded',
                                            {
                                                'border-1 border-foreground/10 dark:border-0': !e.error
                                            }
                                        )}>
                                            <Link href={`/events/edit/${e.id}#${e.id}`}>
                                                <EventCardLite
                                                    event={e}
                                                    showLinks={showLinks}
                                                />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    </> : (
        <EventsByDaySkeleton/>
    );
}

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function EventsByDaySkeleton() {
    return (<div className={`${shimmer} relative overflow-hidden rounded-xl border-1 border-foreground/30`}>
        <div className="flex flex-col gap-y-2 py-2 pl-3">
            <div className="flex items-center gap-x-2">
                <div
                    className="shrink-0 w-6 md:w-12 flex items-center justify-center">
                    <div className="h-5 w-14 rounded bg-gray-300 dark:bg-gray-400/20"></div>
                </div>
                <div className="flex gap-x-2">
                    <EventCardLiteSkeleton/>
                    <EventCardLiteSkeleton/>
                    <EventCardLiteSkeleton/>
                </div>
            </div>
        </div>
    </div>);
}

function EmptyEventsByDay({showErrorOnly}: { showErrorOnly: boolean }) {
    return (<div className="flex flex-col items-center py-10 text-foreground/50 rounded-xl border-1 border-foreground/30">
        {showErrorOnly ? <CheckIcon className="w-12 mb-1"/> :
            <CubeTransparentIcon className="w-12 mb-1"></CubeTransparentIcon>}
        <div className="text-center">No event {showErrorOnly && 'in error '} to display</div>
        {showErrorOnly && <div className="text-center text-sm">Try removing the error filter to show more</div>}
    </div>);
}