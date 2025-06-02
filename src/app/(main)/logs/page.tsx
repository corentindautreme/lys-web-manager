import LogScreen, { LogScreenSkeleton } from '@/app/(main)/logs/components/log-screen';
import { Suspense } from 'react';

export default function Page() {
    return (
        <div className="h-full flex flex-col bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900">
            <Suspense fallback={<LogScreenSkeleton/>}>
                <LogScreen/>
            </Suspense>
        </div>
    );
}