import { Event } from '@/app/types/events/event';

export function getNext7DaysEvents(events: Event[]) {
    const now = new Date().toISOString().split('.')[0];
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(new Date().getDate() + 7);
    const then = sevenDaysFromNow.toISOString().split('.')[0];
    return events.filter(e => e.endDateTimeCet >= now && e.endDateTimeCet <= then);
}

export function getLast7DaysEvents(events: Event[]) {
    const now = new Date().toISOString().split('.')[0];
    const sevenDaysBeforeNow = new Date();
    sevenDaysBeforeNow.setDate(new Date().getDate() - 7);
    const then = sevenDaysBeforeNow.toISOString().split('.')[0];
    return events.filter(e => e.endDateTimeCet >= then && e.endDateTimeCet <= now);
}