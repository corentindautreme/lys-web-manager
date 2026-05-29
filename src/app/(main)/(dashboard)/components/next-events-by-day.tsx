'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import EventsByDay, { EventsByDaySkeleton } from '@/app/(main)/(dashboard)/components/events-by-day';
import { useEvents } from '@/app/(main)/events/utils';
import { Event } from '@/app/types/events/event';
import { getNext7DaysEvents } from '@/app/(main)/(dashboard)/utils';

export default function NextEventsByDay() {
    const [showErrorOnly, setShowErrorOnly] = useState(true);
    const [displayedEvents, setDisplayedEvents] = useState<Event[]>();
    const {events} = useEvents();

    const isNextEventInError = (e: Event): boolean => e.dateTimeCet.substring(11, 16) === '00:00' || !e.watchLinks.some(l => l.live == 1);

    useEffect(() => {
        if (!!events) {
            setDisplayedEvents(getNext7DaysEvents(events));
        }
    }, [events]);

    return (
        <>
            <h2 className="flex items-center gap-2 my-4">
                <div className="font-bold text-sm">Upcoming</div>
                <div className="grow h-px bg-foreground/25"></div>
                <div className="flex items-center">
                    <label className="flex items-center text-xs" htmlFor="showNextInErrorOnly">Filter on error</label>
                    <div className="grow"></div>
                    <input
                        type="checkbox"
                        className={clsx('relative peer ms-1 appearance-none shrink-0 rounded w-4 h-4 bg-foreground/10 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2 after:h-3.5 after:ms-1 after:mb-3 after:rotate-[40deg] after:border-b-4 after:border-r-4',
                            {
                                'checked:bg-sky-500 after:border-white dark:after:border-black': true
                            }
                        )}
                        id="showNextInErrorOnly"
                        name="showNextInErrorOnly"
                        checked={showErrorOnly}
                        onChange={(e) => setShowErrorOnly(e.target.checked)}
                    />
                </div>
            </h2>

            {!!displayedEvents
                ? (<EventsByDay eventsParam={displayedEvents} showErrorOnly={showErrorOnly} errorPredicate={isNextEventInError} dateMarker={'today'}/>)
                : (<EventsByDaySkeleton/>)
            }
        </>
    )
}