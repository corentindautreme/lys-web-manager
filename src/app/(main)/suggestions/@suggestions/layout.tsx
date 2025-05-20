'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { clsx } from 'clsx';
import { Suspense } from 'react';
import CountryListSkeleton from '@/app/(main)/referential/components/country-list-skeleton';

export default function Layout({children}: { children: React.ReactNode }) {
    const layoutSegment = useSelectedLayoutSegment();

    return (
        <div className={clsx("h-full md:block", {"hidden": layoutSegment === 'process'})}>
            {/* TODO replace with appropriate skeleton */}
            <Suspense fallback={<CountryListSkeleton/>}>
                {children}
            </Suspense>
        </div>
    );
}