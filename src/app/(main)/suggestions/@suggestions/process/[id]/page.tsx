import SuggestionList from '@/app/(main)/suggestions/components/suggestion-list';

export default async function Page(props:
                                   {
                                       params: Promise<{ id: number }>;
                                   }
) {
    const params = await props.params;
    const id = params.id;

    return (
        <SuggestionList currentSuggestionId={id}/>
    );
}