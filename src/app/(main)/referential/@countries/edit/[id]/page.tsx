import CountryList from '@/app/(main)/referential/components/country-list';

export default async function Page(props:
                                   {
                                       params: Promise<{ id: number }>;
                                   }
) {
    const params = await props.params;
    const id = params.id;

    return (
        <CountryList currentCountryId={id}/>
    );
}