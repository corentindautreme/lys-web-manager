'use client';

import { clsx } from 'clsx';
import { BellIcon, ChevronRightIcon, ClockIcon, CogIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { LogEvent } from '@/app/types/logs';
import { EXPECTED_PUBLISHERS } from '@/app/services/logs-service';

export default function LogScreen({logsByPublisher}: { logsByPublisher: { [publisher: string]: LogEvent[] } }) {
    const [selectedLog, setSelectedLog] = useState<string>();
    const [showTimestamp, setShowTimestamp] = useState(true);
    const [events, setEvents] = useState<LogEvent[]>([
        {
            'timestamp': '1970-01-01T00:00:00.000Z',
            'message': 'daily|bluesky'
        }
    ]);

    const getStyle = (publisher: string): "normal" | "error" => {
        return logsByPublisher[publisher].length == 0 || logsByPublisher[publisher].some(e => e.message.toLowerCase().includes('error')) ? 'error' : 'normal';
    }

    return (
        <div className="flex flex-col">
            <div className="w-full flex items-center gap-x-2 overflow-y-scroll">
                {EXPECTED_PUBLISHERS.map(publisher => <LogSelector
                    name={publisher}
                    displayName={publisher.split('|')}
                    type={'publish'}
                    style={getStyle(publisher)}
                    onClick={setSelectedLog}
                    active={selectedLog === publisher}
                />)}
            </div>

            <div
                className="relative w-full grow flex flex-col mt-2 p-3 rounded-xl bg-background border-1 border-foreground/10 dark:border-0 font-mono">
                <div
                    className="absolute top-0 right-0 py-1 px-2 bg-foreground/10 dark:bg-neutral-900 rounded-bl-xl rounded-tr-xl">
                    <div className="flex items-center">
                        <ClockIcon className="w-4 shrink-0"/>
                        <label className="hidden md:flex items-center ms-1 font-sans text-sm" htmlFor="show-timestamps">Show
                            timestamps</label>
                        <div className="grow"></div>
                        <input
                            type="checkbox"
                            className="relative peer ms-1 appearance-none shrink-0 rounded-md w-5 h-5 bg-foreground/10 after:content-[''] after:hidden checked:after:inline-block after:w-2 after:h-3.5 after:ms-1.5 after:mb-0.5 after:rotate-[40deg] after:border-b-3 after:border-r-3 checked:bg-sky-500 after:border-white dark:after:border-black"
                            id="show-timestamps"
                            name="show-timestamps"
                            checked={showTimestamp}
                            onChange={(e) => setShowTimestamp(e.target.checked)}
                        />
                    </div>
                </div>
                {!!selectedLog
                    ? selectedLog in logsByPublisher && logsByPublisher[selectedLog].length > 0
                        ? logsByPublisher[selectedLog].map(log => (
                            <div className="text-sm">
                                {showTimestamp && <span className="text-foreground/50 me-3">{log.timestamp}</span>}
                                <span>{log.message}</span>
                            </div>
                        )) : ('No log found for this process')
                    : (
                        'Select logs to display'
                    )
                }
            </div>
        </div>
    )
}

function LogSelector({name, displayName, type, style, onClick, active}: {
    name: string,
    displayName: string[],
    type: 'publish' | 'technical',
    style: 'normal' | 'error'
    onClick: (name: string) => void,
    active: boolean
}) {
    const select = onClick.bind(null, name);

    return (
        <button
            className={clsx('rounded bg-foreground/10 text-sm px-1 py-1.5',
                {
                    'bg-foreground/10': !active && style == 'normal',
                    'bg-sky-500 text-background': active && style == 'normal',
                    'bg-red-300 dark:bg-red-900': !active && style == 'error'
                }
            )}
            onClick={select}
        >
            <div className="flex items-center">
                {type === 'publish' && <BellIcon className="w-4 me-1"/>}
                {type === 'technical' && <CogIcon className="w-4 me-1"/>}
                {displayName.map(
                    (segment, index) => (
                        <>
                            <span className="capitalize">{segment}</span>
                            {index < displayName.length - 1 && <ChevronRightIcon className="w-3 mx-1"/>}
                        </>
                    )
                )}
            </div>
        </button>
    )
}