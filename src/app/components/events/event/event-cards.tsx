import { Event, ValidEvent } from '@/app/types/events/event';
import { clsx } from 'clsx';
import { BackwardIcon, CheckIcon, ExclamationTriangleIcon, LinkIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { JSX } from 'react';
import Link from 'next/link';

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

export function EventCardLite({event, showLinks}: { event: ValidEvent, showLinks: 'live' | 'vod' | 'both' }) {
    const liveLinkCount = event.watchLinks.filter(l => l.live == 1).length;
    const replayableLinkCount = event.watchLinks.filter(l => l.replayable == 1).length;
    const time = event.dateTimeCet.substring(11, 16);

    return (
        <Link href={`/events/edit/${event.id}#${event.id}`}>
            <div className={clsx('shrink-0 flex rounded p-3',
                {
                    'bg-foreground/10': !event.error,
                    'bg-red-400 text-white': event.error
                }
            )}>
                <div className={clsx('h-fill border-e-3 me-3',
                    {
                        'border-sky-500': !event.error,
                        'border-white': event.error
                    }
                )}></div>
                <div className="flex-col">
                    <div className="">
                        <div className="text">{event.country}</div>
                        <div className="text-sm">{event.stage}</div>
                    </div>
                    <div className="mt-1 flex">
                        <Label icon={time != '00:00' ? 'ok' : 'ko'} style={event.error ? 'normal' : 'valid'}
                               active={event.error} content={time}/>
                        {/* When showing "both",
                        * if no live link, show the "link" indicator (ko)
                        * if live link(s) AND replayable links, show the "link" indicator (ok)
                        * if live link(s) BUT no replayable links, show the "vod" indicator (ko)
                    */}
                        {/* When showing "live", show the "link" indicator (ok if live links, ko otherwise)) */}
                        {/* When showing "vod", show the "vod link" indicator (ok if vod links, ko otherwise)) */}
                        {(showLinks == 'live' || (showLinks == 'both' && (liveLinkCount == 0 || replayableLinkCount > 0))) &&
                            <Label icon={liveLinkCount > 0 ? 'ok' : 'ko'} style={liveLinkCount > 0 ? 'valid' : 'error'}
                                   active={event.error} content={<LinkIcon className="w-3.5"/>}/>
                        }
                        {(showLinks == 'vod' || (showLinks == 'both' && liveLinkCount > 0 && replayableLinkCount == 0)) &&
                            <Label icon={replayableLinkCount > 0 ? 'ok' : 'warn'}
                                   style={replayableLinkCount > 0 ? 'valid' : 'error'}
                                   active={event.error} content={<BackwardIcon className="w-3.5"/>}/>
                        }
                    </div>
                </div>
            </div>
        </Link>
    )
}

function Label({icon, content, style, active}: {
    icon: 'link' | 'vod' | 'ok' | 'ko' | 'warn',
    content: string | JSX.Element,
    style: 'normal' | 'error' | 'valid',
    active?: boolean
}) {
    let displayIcon;
    switch (icon) {
        case 'link':
            displayIcon = <LinkIcon className="w-3.5 me-1"/>;
            break;
        case 'vod':
            displayIcon = <BackwardIcon className="w-3.5 me-1"/>
            break;
        case 'ok':
            displayIcon = <CheckIcon className="w-3.5 me-0.5"/>
            break;
        case 'ko':
            displayIcon = <XMarkIcon className="w-3.5 me-0.5"/>
            break;
        case 'warn':
            displayIcon = <ExclamationTriangleIcon className="w-3.5 me-0.5"/>
            break;
    }
    return (
        <div className={clsx(
            'flex items-center w-fit me-1 px-1.5 py-0.5 rounded-xs text-xs',
            {
                'bg-red-300 dark:bg-red-900': style === 'error' && !active,
                'bg-green-300 dark:bg-green-900 border-1 border-green-300 dark:border-green-900': style === 'valid' && !active,
                'bg-gray-400/30 dark:bg-gray-700/50': style === 'normal' && !active,
                'border-1 border-white': active
            }
        )}>
            {displayIcon} {content}
        </div>
    );
}