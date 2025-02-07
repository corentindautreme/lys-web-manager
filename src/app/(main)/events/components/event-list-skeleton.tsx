import {EventCardSkeleton} from '@/app/components/events/event/event-card-skeletons';

export default function EventListSkeleton() {
    return (
        <>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
        </>
    );
}