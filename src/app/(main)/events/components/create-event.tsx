'use client';

import { Event } from '@/app/types/events/event'
import { redirect, useSearchParams } from 'next/navigation';
import { useEvents } from '@/app/(main)/events/utils';
import EventDetails from '@/app/(main)/events/components/event-details';

export default function CreateEvent() {
    const queryParams = useSearchParams();
    const fromId = queryParams.get('fromId');
    const {events, mutate} = useEvents();
    const id = events.toSorted((e1, e2) => e2.id - e1.id)[0].id + 1;
    const eventToCopy = fromId ? events.filter((event: Event) => event.id === parseInt(fromId, 10))[0] : null;

    const saveEvent = async (event: Event) => {
        const newEvents = [...events, event];
        newEvents.sort((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet));
        await mutate(newEvents);
        redirect('/events');
    };

    const event = eventToCopy ? {
        id: id,
        stage: eventToCopy.stage,
        watchLinks: [...eventToCopy.watchLinks],
        country: eventToCopy.country,
        name: eventToCopy.name,
        endDateTimeCet: eventToCopy.endDateTimeCet,
        dateTimeCet: eventToCopy.dateTimeCet,
        modified: true,
        created: true
    } : {
        id: id,
        stage: '',
        watchLinks: [],
        country: '',
        name: '',
        endDateTimeCet: '',
        dateTimeCet: '',
        modified: true,
        created: true
    };

    return (
        <EventDetails eventParam={event} onSave={saveEvent}/>
    );
}