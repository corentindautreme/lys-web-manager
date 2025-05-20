'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function Layout({children, suggestions}: { children: React.ReactNode, suggestions: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <main className="h-full md:flex md:flex-col">
            <div className={clsx('flex flex-col w-full px-3 md:px-0 mb-2',
                {
                    'hidden md:block': layoutSegment === 'process',
                    'block': layoutSegment == null
                }
            )}>
                <Breadcrumbs breadcrumbs={[
                    {
                        label: 'Dashboard',
                        href: '/'
                    },
                    {
                        label: 'Suggestions',
                        href: '/suggestions',
                        active: true
                    }
                ]}/>
            </div>
            <div className="h-full md:flex md:flex-row md:overflow-y-auto">
                <div className="w-full px-3 flex-none md:w-[300px] md:px-0">
                    {suggestions}
                </div>
                <div className={clsx(
                    'w-full flex-col md:flex md:flex-grow md:pl-8 md:overflow-y-auto',
                    {
                        'flex p-1 md:p-3 md:py-0': layoutSegment === 'process',
                        'hidden': layoutSegment == null
                    }
                )}>
                    {children}
                </div>
            </div>
        </main>
    );
}