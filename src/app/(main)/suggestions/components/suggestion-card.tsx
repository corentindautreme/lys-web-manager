import { clsx } from 'clsx';
import { Suggestion } from '@/app/types/suggestion';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/16/solid';

export default function SuggestionCard({suggestion, active}: { suggestion: Suggestion, active: boolean | undefined }) {
    const displayedDates = suggestion.processed && suggestion.accepted
        ? suggestion.dateTimesCet.filter(d => d.selected)
        : suggestion.dateTimesCet;
    return (
        <div
            className={clsx(
                'w-full h-auto p-3 flex rounded-md',
                {
                    'text-white shadow-lg': active === true,
                    'bg-background dark:bg-neutral-900 shadow-sm': active !== true && (!suggestion.processed || !suggestion.reprocessable),
                    'bg-foreground/10 shadow-sm': active !== true && suggestion.processed && suggestion.reprocessable,
                }
            )}
            style={!!active ? {
                background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                backgroundBlendMode: 'screen'
            } : {}}
        >
            <div className="flex grow">
                <div className={clsx('h-fill border-e-3 me-3',
                    {
                        'border-neutral-500': suggestion.processed && !active,
                        'border-sky-500': !suggestion.processed && !active
                    }
                )}></div>
                <div className={clsx('flex-col',
                    {
                        'opacity-55 dark:opacity-30': !suggestion.reprocessable && suggestion.processed && !active,
                        'line-through': suggestion.processed && !suggestion.accepted
                    })}
                >
                    <div className="text-xl/5 font-bold my-1">{suggestion.country}</div>
                    <div className={clsx('text-base/4', {
                        'text-foreground/70': !active,
                        'text-white': !!active
                    })}>{suggestion.name}</div>

                    <div className="mt-2 flex flex-wrap">
                        {
                            displayedDates.slice(0, 3).map((suggestedDate, index) => {
                                const date = new Date(suggestedDate.dateTimeCet);
                                const formattedDate = date.toLocaleString('en-US', {month: 'short', day: 'numeric'});
                                return (
                                    <Label
                                        key={`date-${suggestion.id}-${index}`}
                                        style="normal"
                                        active={!!active}
                                        content={formattedDate}
                                        discarded={suggestion.processed && !suggestion.accepted}
                                    />
                                );
                            })
                        }
                        {displayedDates.length > 3 && (
                            <Label
                                style="accent"
                                active={!!active}
                                discarded={suggestion.processed && !suggestion.accepted}
                                content={`+ ${displayedDates.length - 3}`}
                            />
                        )}
                    </div>
                </div>
                <div className="grow"></div>
                {suggestion.processed && (
                    <div className="flex flex-col justify-center items-center ">
                        {suggestion.accepted
                            ? <CheckCircleIcon className={clsx('w-5',
                                {
                                    'text-green-400 dark:text-green-700': !active,
                                    'text-white': active
                                }
                            )}/>
                            : <XCircleIcon className={clsx('w-5', {
                                'text-red-400 dark:text-red-700': !active,
                                'text-white': active
                            })}/>
                        }
                    </div>
                )}
            </div>
        </div>
    );
}

function Label({content, style, active, discarded}: {
    content: string,
    style: string,
    active: boolean,
    discarded: boolean
}) {
    return (
        <div className={clsx(
            'flex items-center w-fit me-1 px-1.5 py-0.5 rounded-lg text-xs',
            {
                'bg-gray-400/30 dark:bg-gray-700/50': !active && style == 'normal',
                'bg-sky-500 text-background': !active && style == 'accent' && !discarded,
                'bg-gray-400/80 dark:bg-gray-300/50': !active && style == 'accent' && discarded,
                'border-1 border-white': active && style == 'normal',
                'border-1 border-white bg-white text-black': active && style == 'accent'
            }
        )}>
            {content}
        </div>
    );
}