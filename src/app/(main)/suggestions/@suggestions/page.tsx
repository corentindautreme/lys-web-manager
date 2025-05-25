import { EventFilterQuery } from '@/app/types/events/event-filter-query';
import SuggestionList from '@/app/(main)/suggestions/components/suggestion-list';

export default async function Page(props:
                                   {
                                       searchParams: Promise<EventFilterQuery>;
                                   }
) {
    return (
        <SuggestionList/>
    );
}