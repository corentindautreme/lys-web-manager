import {Metadata} from 'next';

export const metadata: Metadata = {
    title: 'Suggestions'
};

export default async function Page() {
    return (
        <div className="hidden md:block">
            Select a suggestion to process it
        </div>
    );
}