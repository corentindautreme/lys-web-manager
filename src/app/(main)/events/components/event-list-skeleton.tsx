import { EventCardSkeleton } from '@/app/components/events/event/event-card-skeletons';

const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export default function EventListSkeleton() {
    return (
        <div className="flex flex-col gap-y-1">
            <div className="flex h-6 w-36 mb-2 rounded-md bg-gray-300 dark:bg-gray-400/10">
                <div className={`${shimmer} relative w-36 overflow-hidden h-auto md:w-[300px]`}></div>
            </div>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
            <EventCardSkeleton/>
        </div>
    );
}