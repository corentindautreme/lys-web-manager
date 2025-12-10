'use client';

import { useEffect, useState } from 'react';
import { TvIcon } from '@heroicons/react/24/outline';
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
            <h2 className="flex items-center my-4">
                <TvIcon className="w-5 me-2"/>
                <div className="text-lg">Next 7 days</div>
                <div className="grow"></div>
                <div className="flex items-center">
                    <label className="flex items-center" htmlFor="showNextInErrorOnly">Filter on
                        error</label>
                    <div className="grow"></div>
                    <input
                        type="checkbox"
                        className={clsx('relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 bg-foreground/10 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2.5 after:h-4 after:ms-1.5 after:rotate-[40deg] after:border-b-4 after:border-r-4',
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
                ? (<EventsByDay eventsParam={displayedEvents} showErrorOnly={showErrorOnly} errorPredicate={isNextEventInError} showLinks='both'/>)
                : (<EventsByDaySkeleton/>)
            }
        </>
    )
}