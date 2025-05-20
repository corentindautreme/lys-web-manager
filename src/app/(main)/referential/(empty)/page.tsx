import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Referential'
};

export default async function Page() {
    return (
        <div className="hidden md:block">
            Select a country to edit its data
        </div>
    );
}