import { Metadata } from 'next';
import EditCountry from '@/app/(main)/referential/components/edit-country';

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
    return (<EditCountry countryId={id}/>);
}