import { clsx } from 'clsx';
import { ReactElement } from 'react';
import { BackwardIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Country } from '@/app/types/country';

export default function CountryCard({countryData, active}: { countryData: Country, active: boolean | undefined }) {
    const liveLinkCount = countryData.watchLinks.filter(l => l.live == 1).length;
    const replayableLinkCount = countryData.watchLinks.filter(l => l.replayable == 1).length;
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
                background: "linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)",
                backgroundBlendMode: "screen"
            }: {}}
        >
            <div className={clsx('flex grow',
                {
                    'line-through opacity-55 dark:opacity-30': !!countryData.deleted
                }
            )}>
                <div className={clsx('h-fill border-e-3 me-3',
                    {
                        'border-neutral-500': !!countryData.deleted && !active,
                        'border-sky-500': !countryData.deleted && !active
                    }
                )}></div>
                <div className="flex-col">
                    <div className="text-xl/5 font-bold my-1">{countryData.country}</div>
                    <div className={clsx('text-base/4', {'text-foreground/70': !active, 'text-white': !!active})}>{countryData.eventName}</div>
                    {countryData.watchLinks && (
                        <div className="mt-2 flex">
                            <Label icon={LinkIcon} style={liveLinkCount == 0 ? 'error' : 'normal'} active={!!active}
                                   content={`${liveLinkCount} link(s)`}/>
                            <Label icon={BackwardIcon} style={replayableLinkCount == 0 ? 'error' : 'normal'}
                                   active={!!active}
                                   content={`${replayableLinkCount} VOD link(s)`}/>
                        </div>
                    )}
                </div>
                <div className="grow"></div>
                {countryData.modified && !countryData.deleted && (
                    <div className="flex items-center">
                        <div className="rounded-xl w-2.5 h-2.5 bg-sky-500"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Label({icon, content, style, active}: {
    icon: ReactElement,
    content: string,
    style: 'normal' | 'error',
    active: boolean
}) {
    const Icon = icon;
    return (
        <div className={clsx(
            'flex items-center w-fit me-1 px-1.5 py-0.5 rounded-xs text-xs',
            {
                'bg-red-300 dark:bg-red-800': style === 'error' && !active,
                'bg-gray-400/30 dark:bg-gray-700/50': style === 'normal' && !active,
                'border-1 border-white': active
            }
        )}>
            <Icon className="w-3.5 me-1"/> {content}
        </div>
    );
}