import { EventFilterQuery } from '@/app/types/events/event-filter-query';
import CountryList from '@/app/(main)/referential/components/country-list';

export default async function Page(props:
                                   {
                                       searchParams: Promise<EventFilterQuery>;
                                   }
) {
    return (
        <CountryList/>
    );
}