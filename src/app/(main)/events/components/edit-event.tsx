'use client';

import { Event } from '@/app/types/events/event'
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useEvents } from '@/app/(main)/events/utils';
import EventDetails from '@/app/(main)/events/components/event-details';

export default function EditEvent({eventId}: { eventId: number }) {
    const {events, mutate, isLoading} = useEvents();
    const [event, setEvent] = useState<Event>();
    const router = useRouter();

    // once SWR has loaded the data, set the event, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        if (!!events) {
            const event = events.filter((event: Event) => event.id == eventId)[0];
            setEvent(event);
        }
    }, [eventId, events]);

    const updateCache = async (event: Event) => {
        const newEvents = [...events].filter((event: Event) => event.id != eventId);
        newEvents.push(event);
        newEvents.sort((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet));
        await mutate(newEvents);
    }

    const saveEvent = async (event: Event) => {
        await updateCache(event);
        router.back();
    };

    const toggleDelete = async (event: Event) => {
        event.deleted = !event.deleted;
        await updateCache(event);
        if (event.deleted) {
            router.back();
        } else {
            setEvent(event);
            // redirect to the current event to force a component remount (and thus display the mutations made to the event list)
            redirect(`/events/edit/${eventId}`);
        }
    };

    return (
        <>
            {!isLoading && !!event ? (
                <EventDetails eventParam={event} onSave={saveEvent} onDelete={toggleDelete}/>
            ) : (
                <>Loading...</>
            )}
        </>
    );
}