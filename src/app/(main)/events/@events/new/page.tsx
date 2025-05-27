import EventList from '@/app/(main)/events/components/event-list';

export default async function Page(/*props:
                                   {
                                       searchParams: Promise<EventFilterQuery>;
                                       params: Promise<{ id: number }>;
                                   }*/
) {
    // const params = await props.params;
    // const searchParams = await props.searchParams;

    return (
        <EventList/>
    );
}