'use client';

import { clsx } from 'clsx';
import { BellIcon, ChevronRightIcon, ClockIcon, CogIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

type LogEvent = {
    timestamp: string;
    message: string;
}

export default function LogScreen() {
    const [selectedLog, setSelectedLog] = useState<string>();
    const [showTimestamp, setShowTimestamp] = useState(true);
    const [events, setEvents] = useState<LogEvent[]>([
        {
            'timestamp': '1970-01-01T00:00:00.000Z',
            'message': 'daily|bluesky'
        }
    ]);

    return (
        <div className="flex flex-col">
            <div className="w-full flex items-center gap-x-2 overflow-y-scroll">
                <LogSelector
                    name={'daily-bluesky'}
                    displayName={['Daily', 'Bluesky']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'daily-bluesky'}
                />
                <LogSelector
                    name={'daily-threads'}
                    displayName={['Daily', 'Threads']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'daily-threads'}
                />
                <LogSelector
                    name={'daily-twitter'}
                    displayName={['Daily', 'Twitter']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'daily-twitter'}
                />
                <LogSelector
                    name={'5min-bluesky'}
                    displayName={['5min', 'Bluesky']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === '5min-bluesky'}
                />
                <LogSelector
                    name={'5min-threads'}
                    displayName={['5min', 'Threads']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === '5min-threads'}
                />
                <LogSelector
                    name={'5min-twitter'}
                    displayName={['5min', 'Twitter']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === '5min-twitter'}
                />
                <LogSelector
                    name={'weekly-bluesky'}
                    displayName={['Weekly', 'Bluesky']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'weekly-bluesky'}
                />
                <LogSelector
                    name={'weekly-threads'}
                    displayName={['Weekly', 'Threads']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'weekly-threads'}
                />
                <LogSelector
                    name={'weekly-twitter'}
                    displayName={['Weekly', 'Twitter']}
                    type={'publish'}
                    onClick={setSelectedLog}
                    active={selectedLog === 'weekly-twitter'}
                />
            </div>

            <div className="relative w-full grow flex flex-col mt-2 p-3 rounded-xl bg-background border-1 border-foreground/10 dark:border-0 font-mono">
                <div className="absolute top-0 right-0 py-1 px-2 bg-foreground/10 rounded-bl-xl rounded-tr-xl">
                    <div className="flex items-center">
                        <ClockIcon className="w-4 shrink-0"/>
                        <label className="hidden md:flex items-center ms-1 font-sans text-sm" htmlFor="show-timestamps">Show timestamps</label>
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
                {events.map((log: LogEvent) => (
                    <div>
                        {showTimestamp && <span className="text-foreground/50 me-3">{log.timestamp}</span>}
                        <span>{log.message}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

function LogSelector({name, displayName, type, onClick, active}: {
    name: string,
    displayName: string[],
    type: 'publish' | 'technical'
    onClick: (name: string) => void,
    active: boolean
}) {
    const select = onClick.bind(null, name);

    return (
        <button
            className={clsx('rounded bg-foreground/10 text-sm px-1 py-1.5',
                {
                    'bg-foreground/10': !active,
                    'bg-sky-500 text-background': active
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
                            {segment}
                            {index < displayName.length - 1 && <ChevronRightIcon className="w-3 mx-1"/>}
                        </>
                    )
                )}
            </div>
        </button>
    )
}