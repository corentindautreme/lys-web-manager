'use client';

import { Event, ValidEvent } from '@/app/types/events/event';
import { EventCardLite } from '@/app/components/events/event/event-cards';
import { useEffect, useState } from 'react';
import { CheckIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';
import { EventCardLiteSkeleton } from '@/app/components/events/event/event-card-skeletons';

export default function EventsByDay({eventsParam, showErrorOnly, errorPredicate, showLinks}: {
    eventsParam: Event[],
    showErrorOnly: boolean,
    errorPredicate: (e: Event) => boolean,
    showLinks: 'live' | 'vod' | 'both'
}) {
    const [eventsByDate, setEventsByDate] = useState<{ [date: string]: ValidEvent[] }>();

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

    return !!eventsByDate ? <div className="rounded-xl border-1 border-foreground/30">
        {
            Object.keys(eventsByDate).length == 0 ? <EmptyEventsByDay showErrorOnly={showErrorOnly}/> : (
                <div className="flex flex-col gap-y-2 py-2 pl-3">
                    {Object.entries(eventsByDate).map(([date, events], index) => (
                        <>
                            {index > 0 && <div className="border-t-1 border-foreground/30 me-3"></div>}
                            <div className="flex items-center gap-x-2">
                                <div
                                    className="shrink-0 w-12 flex flex-col items-center md:items-start text-sm md:text-left">
                                    <div className="text-center">{date}</div>
                                    <div
                                        className="block md:hidden bg-foreground/10 rounded-lg mt-1 px-1 py-0.5 text-xs">{events.length}</div>
                                </div>
                                <div className="flex overflow-x-scroll gap-x-2 pe-3">
                                    {events.map(e => <EventCardLite key={`event-${e.id}`} event={e} showLinks={showLinks}/>)}
                                </div>
                            </div>
                        </>
                    ))}
                </div>
            )
        }
    </div> : (
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

function EmptyEventsByDay({showErrorOnly}: {showErrorOnly: boolean}) {
    return (<div className="flex flex-col items-center py-10 text-foreground/50">
        {showErrorOnly ? <CheckIcon className="w-12 mb-1"/> : <CubeTransparentIcon className="w-12 mb-1"></CubeTransparentIcon>}
        <div className="text-center">No event {showErrorOnly && 'in error '} to display</div>
        {showErrorOnly && <div className="text-center text-sm">Try removing the error filter to show more</div>}
    </div>);
}