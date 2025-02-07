import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Referential'
};

export default async function Page(props:
                                   {
                                       params: Promise<{ id: number }>;
                                   }
) {
    const params = await props.params;
    const id = params.id;
    return (`Editing country ${id}`);
    // return (<EditCountry countryId={id}/>);
}