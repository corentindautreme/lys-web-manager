import { Metadata } from 'next';
import CreateCountry from '@/app/(main)/referential/components/create-country';

export const metadata: Metadata = {
    title: 'Referential'
};

export default async function Page() {
    return (<CreateCountry/>);
}