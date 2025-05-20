import { clsx } from 'clsx';
import { Suggestion } from '@/app/types/suggestion';

export default function SuggestionCard({suggestion, active}: { suggestion: Suggestion, active: boolean | undefined }) {
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
                    'opacity-55 dark:opacity-30': suggestion.processed
                }
            )}>
                <div className={clsx('h-fill border-e-3 me-3',
                    {
                        'border-neutral-500': suggestion.processed && !active,
                        'border-sky-500': !suggestion.processed && !active
                    }
                )}></div>
                <div className="flex-col">
                    <div className="text-xl/5 font-bold my-1">{suggestion.country}</div>
                    <div className={clsx('text-base/4', {
                        'text-foreground/70': !active,
                        'text-white': !!active
                    })}>{suggestion.name}</div>

                    <div className="mt-2 flex flex-wrap">
                        {
                            suggestion.dateTimesCet.slice(0, 4).map((suggestedDate) => {
                                const date = new Date(suggestedDate.dateTimeCet);
                                const formattedDate = date.toLocaleString('en-US', {month: 'short', day: 'numeric'});
                                return (<Label style="normal" active={!!active} content={formattedDate}/>);
                            })
                        }
                        {suggestion.dateTimesCet.length > 4 && (<Label style="accent" active={!!active} content={`+ ${suggestion.dateTimesCet.length - 4}`}/>)}
                    </div>
                </div>
                <div className="grow"></div>
                {/* TODO accepted/discarded indicator (checkmark/x icon?) */}
                {/*{suggestion.modified && !suggestion.deleted && (*/}
                {/*    <div className="flex items-center">*/}
                {/*        <div className="rounded-xl w-2.5 h-2.5 bg-sky-500"></div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </div>
    );
}

function Label({content, style, active}: {
    content: string,
    style: string,
    active: boolean
}) {
    return (
        <div className={clsx(
            'flex items-center w-fit me-1 px-1.5 py-0.5 rounded-lg text-xs',
            {
                'bg-gray-400/30 dark:bg-gray-700/50': !active && style == 'normal',
                'bg-sky-500 text-background': !active && style == 'accent',
                'border-1 border-white': active && style == 'normal',
                'border-1 border-white bg-white text-black': active && style == 'accent'
            }
        )}>
            {content}
        </div>
    );
}