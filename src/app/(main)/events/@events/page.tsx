import EventList from '@/app/(main)/events/components/event-list';

export default async function Page(/*props:
                                   {
                                       searchParams: Promise<EventFilterQuery>;
                                   }*/
) {
    // const searchParams = await props.searchParams;
    return (
        <EventList/>
    );
}