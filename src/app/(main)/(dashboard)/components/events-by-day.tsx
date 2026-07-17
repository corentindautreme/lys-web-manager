'use client';

import { Event, ValidEvent } from '@/app/types/events/event';
import { EventCard } from '@/app/components/events/event/event-cards';
import { useEffect, useRef, useState } from 'react';
import { CheckIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';
import { EventCardSkeleton } from '@/app/components/events/event/event-card-skeletons';
import { clsx } from 'clsx';
import Link from 'next/link';

export default function EventsByDay({eventsParam, showErrorOnly, errorPredicate, dateMarker, highlightErrors}: {
    eventsParam: Event[],
    showErrorOnly: boolean,
    errorPredicate: (e: Event) => boolean,
    dateMarker: 'today' | 'yday',
    highlightErrors: {
        time?: { isError: (e: Event) => boolean },
        liveLinks?: { isError: (e: Event) => boolean },
        vodLinks?: { isError: (e: Event) => boolean },
    }
}) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const markedDate = dateMarker === 'today'
        ? today.toLocaleString('en-GB', {weekday: 'short', day: 'numeric'})
        : yesterday.toLocaleString('en-GB', {weekday: 'short', day: 'numeric'});

    const [eventsByDate, setEventsByDate] = useState<{ [date: string]: ValidEvent[] }>();
    const [currentDate, setCurrentDate] = useState<string | null>(null);

    const eventsContainerRef = useRef<HTMLDivElement>(null);

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
        const eventsByDate = computeEventsByDate(events);
        setEventsByDate(computeEventsByDate(events));
        setCurrentDate(Object.keys(eventsByDate)[0]);
    }, [showErrorOnly]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const newDate = entry.target.attributes.getNamedItem('data-date')?.value || '';
                        setCurrentDate(newDate);
                        const dateElement = document.getElementById("date-" + dateToId(newDate));
                        dateElement?.scrollIntoView({ block: 'nearest' });
                    }
                });
            },
            {
                root: eventsContainerRef.current,
                rootMargin: '0px -50% 0px -50%',
                threshold: 0.5
            }
        );

        const sections = document.querySelectorAll('.event-container');
        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [eventsByDate]);

    const displayEvents = (date: string) => {
        const eventElement = document.getElementById(dateToId(date));
        eventElement?.scrollIntoView({ block: 'nearest' });
        setCurrentDate(date);
    }

    const dateToId = (date: string) => date.toLowerCase().replace(' ', '');

    return !!eventsByDate && currentDate !== null ? <>
        {
            Object.keys(eventsByDate).length == 0 ? <EmptyEventsByDay showErrorOnly={showErrorOnly}/> : (
                <div className="flex flex-col">
                    <div className="flex items-end mb-3 justify-between overflow-x-scroll no-scrollbar">
                        {Object.keys(eventsByDate).map(date => (
                            <div
                                key={date}
                                id={`date-${dateToId(date)}`}
                                className="flex flex-col items-center shrink-0 w-1/4 text-center cursor-pointer"
                            >
                                {date === markedDate &&
                                    <div className="text-[10px] px-1 rounded bg-amber-300 dark:bg-amber-700">
                                        {dateMarker.toUpperCase()}
                                    </div>
                                }
                                <div
                                    onClick={() => displayEvents(date)}
                                    className={clsx({
                                        'font-bold underline decoration-8 underline-offset-4': date === currentDate,
                                        'text-foreground/50': date !== currentDate
                                    })}>
                                    {date}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div ref={eventsContainerRef} className="w-full flex gap-x-2 overflow-x-scroll overflow-y-hidden snap-x snap-mandatory motion-reduce:scroll-auto scroll-smooth">
                        { Object.entries(eventsByDate).map(([date, events]) => (
                            <div
                                key={dateToId(date)}
                                id={dateToId(date)}
                                data-date={date}
                                className={clsx('event-container snap-start w-full shrink-0 flex flex-wrap items-stretch gap-2', {
                                    'h-0' : date !== currentDate,
                                    'h-fit': date === currentDate
                                })}
                            >
                                { events.map(event => (
                                    <div
                                        className="flex flex-col items-stretch w-full md:w-auto lg:w-full basis-auto md:basis-[calc(50%-0.25rem)] lg:basis-auto xl:basis-[calc(50%-0.25rem)]"
                                        key={event.id}>
                                        <Link className="w-full flex h-full" href={`/events/edit/${event.id}#${event.id}`}>
                                            <EventCard
                                                event={event} active={false}
                                                highlightError={{
                                                    time: highlightErrors?.time?.isError(event),
                                                    liveLinks: highlightErrors?.liveLinks?.isError(event),
                                                    vodLinks: highlightErrors?.vodLinks?.isError(event),
                                                }}
                                            />
                                        </Link>
                                    </div>
                                )) }
                            </div>
                        )) }
                    </div>
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
    return (<div className={`overflow-hidden`}>
        <div className="flex flex-col">
            <div className="flex flex-1 items-end mb-3 justify-between overflow-x-scroll no-scrollbar">
                <div className={`flex flex-col pt-4 items-center shrink-0 w-1/4 text-center cursor-pointer`}>
                    <div className={`${shimmer} relative overflow-hidden rounded bg-foreground/10 w-12 h-5`}></div>
                </div>
                <div className="flex flex-col pt-4 items-center shrink-0 w-1/4 text-center cursor-pointer">
                    <div className={`${shimmer} relative overflow-hidden rounded bg-foreground/10 w-12 h-5`}></div>
                </div>
                <div className="flex flex-col pt-4 items-center shrink-0 w-1/4 text-center cursor-pointer">
                    <div className={`${shimmer} relative overflow-hidden rounded bg-foreground/10 w-12 h-5`}></div>
                </div>
                <div className="flex flex-col pt-4 items-center shrink-0 w-1/4 text-center cursor-pointer">
                    <div className={`${shimmer} relative overflow-hidden rounded bg-foreground/10 w-12 h-5`}></div>
                </div>
            </div>
            <EventCardSkeleton/>
        </div>
    </div>);
}

function EmptyEventsByDay({showErrorOnly}: { showErrorOnly: boolean }) {
    return (
        <div className="flex flex-col items-center pt-5 pb-8 text-foreground/50">
            {showErrorOnly ? <CheckIcon className="w-12 mb-1"/> :
                <CubeTransparentIcon className="w-12 mb-1"></CubeTransparentIcon>}
            <div className="text-center">No event {showErrorOnly && 'in error '} to display</div>
            {showErrorOnly && <div className="text-center text-sm">Try removing the error filter to show more</div>}
        </div>);
}