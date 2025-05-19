'use client';

import { Event } from '@/app/types/events/event'
import { EventCard } from '@/app/components/events/event/event-cards';
import Link from 'next/link';
import { clsx } from 'clsx';
import { redirect, useSearchParams } from 'next/navigation';
import { getQueryParamString } from '@/app/utils/event-utils';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEvents } from '@/app/(main)/events/utils';
import { submitEvents } from '@/app/(main)/events/actions';
import { KeyedMutator } from 'swr';
import { useEffect, useState } from 'react';
import EventListSkeleton from '@/app/(main)/events/components/event-list-skeleton';
import ErrorScreen from '@/app/components/error-screen';
import { EventSubmissionResponse } from '@/app/types/event-submission-response';

async function submitModifiedEvents(
    events: Event[],
    onSuccess: KeyedMutator<Event[]>,
    onError: (errorName: string, message: string) => void
) {
    const response: EventSubmissionResponse = await submitEvents(events);
    if (response.success) {
        const updatedEvents = events
            .filter(e => !e.deleted)
            .map(e => {
                e.modified = false;
                e.created = false;
                e.rescheduled = false;
                return e;
            });
        await onSuccess(updatedEvents);
        redirect('/events');
    } else {
        onError(response.error, response.message);
    }
}

function UnsavedEventsBanner({count, events, callback}: {
    count: number,
    events: Event[],
    callback: KeyedMutator<Event[]>
}) {
    const [error, setError] = useState('');
    const onError = (errorName: string, message: string) => {
        setError(`${errorName} occurred with message: ${message}`);
    }
    const submit = submitModifiedEvents.bind(null, events, callback, onError);
    return (
        <div className={clsx('flex flex-col rounded-lg p-3 text-background', {
            'bg-sky-500 ': !error,
            'bg-red-400 dark:bg-red-600': !!error,
        })}>
            <div className="flex">
                    <span className="flex flex-row content-center">
                        <ExclamationCircleIcon className="w-5 me-1"/>
                        {count} unsaved event(s)
                    </span>
                <div className="grow"></div>
                <form action={submit}>
                    <button className="border-1 border-background px-2">Save</button>
                </form>
            </div>
            {!!error && <div className="flex flex-col mt-2 pt-2 border-t-1 border-background">
                    <span className="flex flex-row content-center">
                        <ExclamationTriangleIcon className="shrink-0 w-5 me-1"/>
                        {error}
                    </span>
                <form className="text-right" action={() => setError('')}>
                    <button type="submit" className="text-sm underline cursor-pointer">Dismiss</button>
                </form>
            </div>}
        </div>
    );
}

function insertHeader(event: Event, previous: Event | undefined) {
    const month = new Date(event.dateTimeCet).toLocaleString('en-GB', {month: 'long'});
    const previousMonth = previous && new Date(previous.dateTimeCet).toLocaleString('en-GB', {month: 'long'});
    return previousMonth == month ? '' : (
        <div className={clsx(
            'pb-2 text-xl font-bold',
            {
                'pt-2': !!previous
            }
        )}>{month}</div>
    );
}

export default function EventList({currentEventId}: { currentEventId?: number | undefined }
) {
    const searchParams = useSearchParams();
    const queryString = getQueryParamString(searchParams);
    const {events: loadedEvents, mutate, isLoading, error} = useEvents();
    const [events, setEvents] = useState(loadedEvents);
    const modifiedCount = events?.filter(e => e.modified || e.deleted).length;

    // once SWR has loaded the data, set the event, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        setEvents(loadedEvents);
    }, [loadedEvents]);

    return (
        <>
            {!!error ? (
                <ErrorScreen
                    title={'Error'}
                    message={`${error.message} (status: ${error.cause.status})`}
                    details={error.cause.response}
                />
            ) : (!isLoading && !!events ? (
                    <>
                        <div className="h-full flex flex-col">
                            {modifiedCount > 0 &&
                                <UnsavedEventsBanner count={modifiedCount} events={events} callback={mutate}/>}

                            <div className="flex mt-2 overflow-y-auto flex-col">
                                {events?.map((event, idx) => {
                                        return (
                                            <div key={event.id}>
                                                {insertHeader(event, idx > 0 ? events[idx - 1] : undefined)}
                                                <Link href={`/events/edit/${event.id}${queryString}#${event.id}`}>
                                                    {/*
                        Stick the ID on a relative div, so that navigating to # "scrolls back up" a litle bit, to
                        give a visual cue that there's more above in the list
                        */}
                                                    <div
                                                        id={event.id.toString()}
                                                        className="relative top-[-20px]"
                                                    />
                                                    <EventCard event={event} active={currentEventId == event.id}/>
                                                </Link>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    </>
                ) : (<EventListSkeleton/>)
            )}
        </>
    );
}