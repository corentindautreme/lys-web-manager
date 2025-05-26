import { Event } from '@/app/types/events/event';
import { clsx } from 'clsx';
import { BackwardIcon, LinkIcon } from '@heroicons/react/24/outline';

export function EventCard({event, active, shorten}: { event: Event, active: boolean | undefined, shorten?: boolean }) {
    const date = new Date(event.dateTimeCet);
    const liveLinkCount = event.watchLinks.filter(l => l.live == 1).length;
    const replayableLinkCount = event.watchLinks.filter(l => l.replayable == 1).length;
    return (
        <div
            className={clsx(
                'w-full h-auto mb-1 p-3 flex rounded-md',
                {
                    'text-white shadow-lg': active === true,
                    'bg-background dark:bg-neutral-900 shadow-sm': active !== true
                }
            )}
            style={!!active ? {
                background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                backgroundBlendMode: 'screen'
            } : {}}
        >
            <div className={clsx('flex grow',
                {
                    'line-through opacity-55 dark:opacity-30': !!event.deleted
                }
            )}>
                <div className="flex flex-col justify-center items-center">
                    <div
                        className="text-3xl font-bold">{date.toLocaleString('default', {day: '2-digit'})}</div>
                    <div className="text-base/3">{date.toLocaleString('en-GB', {month: 'short'})}</div>
                    <div className={clsx('text-xs mt-2 ', {
                        'text-foreground/70': !active,
                        'text-white': active
                    })}>{date.toLocaleString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</div>
                </div>
                <div className={clsx('h-fill border-e-3 mx-3',
                    {
                        'border-neutral-500': !!event.deleted && !active,
                        'border-sky-500': !event.deleted && !active
                    }
                )}></div>
                <div className="flex-col">
                    <div className={clsx('text-xs/3', {
                        'text-foreground/70': !active,
                        'text-white': !!active
                    })}>{event.country}</div>
                    <div className="text-xl/5 font-bold my-1">{event.name}</div>
                    <div className={clsx('text-base/4', {
                        'text-foreground/70': !active,
                        'text-white': !!active
                    })}>{event.stage}</div>
                    {event.watchLinks && (
                        <div className="mt-2 flex">
                            <Label icon="link" style={liveLinkCount == 0 ? 'error' : 'normal'} active={!!active}
                                   content={`${liveLinkCount} ${!shorten ? 'link(s)' : ''}`}/>
                            <Label icon="vod" style={replayableLinkCount == 0 ? 'error' : 'normal'}
                                   active={!!active} content={`${replayableLinkCount} ${!shorten ? 'VOD' : ''}`}/>
                        </div>
                    )}
                </div>
                <div className="grow"></div>
                {event.modified && !event.deleted && (
                    <div className="flex items-center">
                        <div className={clsx('rounded-xl w-2.5 h-2.5',
                            {
                                'bg-sky-500': !active,
                                'bg-white': active
                            }
                        )}></div>
                    </div>
                )}
            </div>
        </div>
    );
}

// export function EventCardLite({event}: { event: Event }) {
//     return (
//         <></>
//     )
// }

function Label({icon, content, style, active}: {
    icon: 'link' | 'vod',
    content: string,
    style: 'normal' | 'error',
    active: boolean
}) {
    return (
        <div className={clsx(
            'flex items-center w-fit me-1 px-1.5 py-0.5 rounded-xs text-xs',
            {
                'bg-red-300 dark:bg-red-900': style === 'error' && !active,
                'bg-gray-400/30 dark:bg-gray-700/50': style === 'normal' && !active,
                'border-1 border-white': active
            }
        )}>
            {icon == 'link' ? <LinkIcon className="w-3.5 me-1"/> : <BackwardIcon className="w-3.5 me-1"/>} {content}
        </div>
    );
}