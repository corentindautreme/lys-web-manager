import ProcessSuggestion from '@/app/(main)/suggestions/components/process-suggestion';

export default async function Page(props:
                                   {
                                       params: Promise<{ id: number }>;
                                   }
) {
    const params = await props.params;
    const id = params.id;

    return (<ProcessSuggestion suggestionId={id}/>);
}