'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import Breadcrumbs from '@/app/components/breadcrumbs';
import NewEventButton from '@/app/(main)/events/components/new-event-button';

export default function Layout({children, events}: { children: React.ReactNode, events: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <main className="h-full md:flex md:flex-col">
            <div className={clsx('flex flex-col w-full px-3 md:px-0 mb-2',
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
            <div className="h-full md:flex md:flex-row md:overflow-y-auto">
                <div className="w-full px-3 flex-none md:w-[300px] md:px-0">
                    {events}
                </div>
                <div className={clsx(
                    'w-full flex-col md:flex md:flex-grow md:pl-8 md:overflow-y-auto',
                    {
                        'flex p-1 md:p-3 md:py-0': layoutSegment === 'edit' || layoutSegment === 'new',
                        'hidden': layoutSegment == null
                    }
                )}>
                    {children}
                </div>
            </div>

            {/* Hide the "New" button on mobile on the edit and new screen, but always display it on desktop */}
            {layoutSegment === "(empty)" && <div className="md:hidden"><NewEventButton/></div>}
            <div className="hidden md:block"><NewEventButton/></div>
        </main>
    );
}