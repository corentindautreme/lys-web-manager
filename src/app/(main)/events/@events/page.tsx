import EventList from '@/app/(main)/events/components/event-list';
import { EventFilterQuery } from '@/app/types/events/event-filter-query';

export default async function Page(props:
                                   {
                                       searchParams: Promise<EventFilterQuery>;
                                   }
) {
    const searchParams = await props.searchParams;
    return (
        <EventList/>
    );
}