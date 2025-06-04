'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import Breadcrumbs from '@/app/components/breadcrumbs';

export default function Layout({children, suggestions}: { children: React.ReactNode, suggestions: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <main className="h-full md:flex md:flex-col p-3 md:p-6">
            <div className={clsx('flex flex-col w-full',
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
            <div className="h-full md:flex md:flex-row md:gap-x-3 md:overflow-y-auto">
                <div className="w-full flex-none md:w-[300px]">
                    {suggestions}
                </div>
                <div className={clsx(
                    'w-full flex-col md:flex md:flex-grow',
                    {
                        'flex': layoutSegment === 'process',
                        'hidden': layoutSegment == null
                    }
                )}>
                    {children}
                </div>
            </div>
        </main>
    );
}