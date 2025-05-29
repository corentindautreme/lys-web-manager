import {Metadata} from 'next';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
    title: 'Events'
};

export default async function Page() {
    return (
        <div className="relative hidden md:block h-full rounded-xl bg-background dark:bg-neutral-900">
            <div
                className="flex flex-col h-full px-1 py-3 md:p-3 before:rounded-xl before:backdrop-blur-xs before:absolute before:top-0 before:left-0 before:w-full before:h-full
                        ">
                <div className="flex items-center justify-between px-1 space-x-2">
                    <div className="h-8 w-18 rounded-md bg-gray-200 dark:bg-gray-400/10"/>
                    <div className="flex space-x-2">
                        <div className="h-8 w-18 rounded-md bg-gray-200 dark:bg-gray-400/10"/>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center w-full mt-4">
                    <div className="flex flex-col justify-center items-center space-y-2">
                        <div className="h-10 w-78 rounded-md bg-gray-100 dark:bg-gray-400/10"/>
                        <div className="h-8 w-28 rounded-md bg-gray-100 dark:bg-gray-400/10"/>
                    </div>
                </div>
            </div>
            <div
                className="absolute h-full top-0 w-full flex flex-col items-center justify-center text-foreground/50">
                <FolderOpenIcon className="w-20"/>
                <div>Select an event to start editing it</div>
            </div>
        </div>
    );
}