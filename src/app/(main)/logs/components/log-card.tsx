'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

export default function LogCard({title, logs}: { title: string; logs: string[] }) {
    const [unfolded, unfold] = useState(false);
    const error = logs.some(log => log.toLowerCase().includes('error'));

    return (
        <div className={clsx('h-fit flex flex-col rounded-lg p-3',
            {
                'bg-red-400 dark:bg-red-600 text-background': error,
                'bg-foreground/10': !error
            }
        )}>
            <button
                className=""
                onClick={() => unfold(!unfolded)}
            >
                <div className="flex items-center">
                    {title}
                    {unfolded ? <ChevronUpIcon className="ms-2 w-4"/> : <ChevronDownIcon className="ms-2 w-4"/>}
                </div>
            </button>

            {unfolded &&
                <div className="flex mt-3">
                    <div className={clsx('border-l-3', {'border-background': error, 'border-sky-500': !error})}></div>
                    <div className="grow font-mono px-3 py-1 overflow-y-scroll max-h-36 bg-background dark:bg-neutral-900 text-sm text-foreground">
                        {logs.map((line, index) => <p key={`log-${index}`} className="break">{line}</p>)}
                    </div>
                </div>
            }
        </div>
    )
}