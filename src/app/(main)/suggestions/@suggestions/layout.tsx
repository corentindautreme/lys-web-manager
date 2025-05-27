'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import { Suspense } from 'react';
import SuggestionListSkeleton from '@/app/(main)/suggestions/components/suggestion-list-skeleton';

export default function Layout({children}: { children: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <div className={clsx('h-full md:block', {'hidden': layoutSegment === 'process'})}>
            <Suspense fallback={<SuggestionListSkeleton/>}>
                {children}
            </Suspense>
        </div>
    );
}