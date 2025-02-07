import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Referential'
};

export default async function Page() {
    return 'Create Country'
    // return (<CreateCountry/>);
}