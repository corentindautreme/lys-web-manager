import { Metadata } from 'next';
import CreateEvent from '@/app/(main)/events/components/create-event';

export const metadata: Metadata = {
    title: 'Events'
};

export default async function Page() {
    return (<CreateEvent/>);
}