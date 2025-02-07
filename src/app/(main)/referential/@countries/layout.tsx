'use client';

import {useSelectedLayoutSegment} from 'next/navigation';
import {clsx} from 'clsx';
import {Suspense} from 'react';
import EventListSkeleton from '@/app/(main)/events/components/event-list-skeleton';

export default function Layout({children}: { children: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <div className={clsx("h-full md:block", {"hidden": layoutSegment === 'edit' || layoutSegment === 'new'})}>
            {/*TODO replace with country list skeleton*/}
            <Suspense fallback={<EventListSkeleton/>}>
                {children}
            </Suspense>
        </div>
    );
}