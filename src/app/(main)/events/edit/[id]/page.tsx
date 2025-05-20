import { Metadata } from 'next';
import EditEvent from '@/app/(main)/events/components/edit-event';

export const metadata: Metadata = {
    title: 'Events'
};

export default async function Page(props:
                                   {
                                       params: Promise<{ id: number }>;
                                   }
) {
    const params = await props.params;
    const id = params.id;
    return (<EditEvent eventId={id}/>);
}