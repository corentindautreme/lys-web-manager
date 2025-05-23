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
import { JSX, useEffect, useState } from 'react';
import EventListSkeleton from '@/app/(main)/events/components/event-list-skeleton';
import ErrorScreen from '@/app/components/error-screen';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';

async function submitModifiedEvents(
    events: Event[],
    onSuccess: KeyedMutator<Event[]>,
    onError: (errorName: string, message: string) => void
) {
    const response: DataSubmissionResponse = await submitEvents(events);
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
    const [error, setError] = useState<JSX.Element>();
    const onError = (errorName: string, message: string) => {
        setError(<div className=""><span className="font-bold">{errorName}</span> has occurred with message: {message}</div>);
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
                        <ExclamationTriangleIcon className="shrink-0 w-5 me-1.5"/>
                        {error}
                    </span>
                <form className="text-right" action={() => setError('')}>
                    <button type="submit" className="text-sm underline cursor-pointer">Dismiss</button>
                </form>
            </div>}
        </div>
    );
}

export function insertHeader(event: Event, previous: Event | undefined) {
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
                    title={error.name}
                    message={`${error.message} (status: ${error.cause.status})`}
                    // details={JSON.stringify(error.cause.response)}
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
                                <div className="flex md:hidden py-3 items-center">
                                    <div className="w-full border-t-1 border-foreground/50"></div>
                                    <div className="shrink-0 px-2 text-foreground/50">That's it!</div>
                                    <div className="w-full border-t-1 border-foreground/50"></div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (<EventListSkeleton/>)
            )}
        </>
    );
}