'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import Breadcrumbs from '@/app/components/breadcrumbs';
import NewEventButton from '@/app/(main)/events/components/new-event-button';
import { Suspense } from 'react';

export default function Layout({children, events}: { children: React.ReactNode, events: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <main className="h-full md:flex md:flex-col p-3 md:p-6">
            <div className={clsx('flex flex-col w-full',
                {
                    'hidden md:block': layoutSegment === 'edit' || layoutSegment === 'new',
                    'block': layoutSegment == null
                }
            )}>
                <Breadcrumbs breadcrumbs={[
                    {
                        label: 'Dashboard',
                        href: '/'
                    },
                    {
                        label: 'Events',
                        href: '/events',
                        active: true
                    }
                ]}/>
                {/*<EventFilters/>*/}
            </div>
            <div className="h-full md:flex md:flex-row md:gap-x-3 md:overflow-y-auto">
                <div className="w-full flex-none md:w-[300px]">
                    {events}
                </div>
                <div className={clsx(
                    'w-full flex-col md:flex md:grow',
                    {
                        'flex': layoutSegment === 'edit' || layoutSegment === 'new',
                        'hidden': layoutSegment == null
                    }
                )}>
                    <Suspense>
                        {children}
                    </Suspense>
                </div>
            </div>

            {/* Hide the "New" button on mobile on the edit and new screen, but always display it on desktop */}
            {layoutSegment === '(empty)' && <div className="md:hidden"><NewEventButton/></div>}
            <div className="hidden md:block"><NewEventButton/></div>
        </main>
    );
}