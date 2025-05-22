'use client';

import { Suggestion, SuggestionDate } from '@/app/types/suggestion';
import { Country } from '@/app/types/country';
import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
    CubeTransparentIcon,
    EyeIcon,
    ListBulletIcon,
    SparklesIcon,
    TagIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { EventCard } from '@/app/components/events/event/event-cards';
import { Event } from '@/app/types/events/event';

type GeneratedEvent = Event & {
    key: string;
}

export default function SuggestionDetails({suggestionParam, countryData, onSubmit}: {
    suggestionParam: Suggestion,
    countryData: Country,
    onSubmit: (suggestion: Suggestion) => Promise<never>
}) {
    const canSubmit = !suggestionParam.processed;
    const [suggestion, setSuggestion] = useState(suggestionParam);
    const [events, setEvents] = useState<GeneratedEvent[]>([]);
    const [unfoldedAll, unfoldAll] = useState(false);

    useEffect(() => {
        suggestionParam.dateTimesCet
            .forEach((d, index) => {
                if (d.selected) {
                    generateEvent(d, `${suggestionParam.id}-${index}`);
                }
            });
    }, []);

    const acceptSuggestion = async () => {
        const newSuggestion: Suggestion = {
            ...suggestion,
            processed: true,
            accepted: true
        };
        // TODO selected dates are lost here
        setSuggestion(newSuggestion);
        await onSubmit(newSuggestion);
    }

    const discardSuggestion = async () => {
        const newSuggestion = {
            ...suggestion,
            processed: true,
            accepted: false
        };
        setSuggestion(newSuggestion);
        await onSubmit(newSuggestion);
    }

    const accept = async () => {
        if (!suggestion.processed || !suggestion.accepted) {
            // if the suggestion hasn't been processed yet or has been rejected, switch it to approved
            setSuggestion({
                ...suggestion,
                processed: true,
                accepted: true
            });
        } else {
            // otherwise, the suggestion was already approved => act as a toggle off
            setSuggestion({
                ...suggestion,
                processed: false,
                accepted: false
            });
        }
    }

    const discard = async () => {
        if (!suggestion.processed || suggestion.accepted) {
            // if the suggestion hasn't been processed yet or has been accepted, switch it to rejected
            setSuggestion({
                ...suggestion,
                processed: true,
                accepted: false
            });
        } else {
            // otherwise, the suggestion was already rejected => act as a toggle off
            setSuggestion({
                ...suggestion,
                processed: false
            });
        }
    }

    const submit = async () => {
        await onSubmit(suggestion);
    }

    const setStages = (events: GeneratedEvent[]) => {
        if (events.length == 0) {
            return;
        } else if (events.length == 1) {
            events[0].stage = 'Final';
        } else if (!!countryData) {
            const repeatedStagesCount = countryData.stages.filter(s => s.endsWith('...')).length;
            const referentialStages = (countryData.stages.length < events.length && !countryData.stages.some(s => s.endsWith('...'))) || repeatedStagesCount > 1
                ? countryData.stages
                : ['Night...', 'Final'];

            const nonRepeatingStages = countryData.stages.filter(s => !s.endsWith('...'));

            let stages: string[];

            const repeatingStageIndex = referentialStages.findIndex(s => s.endsWith('...'));
            const repeatingStage = referentialStages[repeatingStageIndex].replace('...', '');

            if (nonRepeatingStages.length >= events.length) {
                stages = nonRepeatingStages.slice(nonRepeatingStages.length - events.length, nonRepeatingStages.length);
            } else {
                // determine how many repeat stages need to be inserted to fill the gap
                const gap = events.length - nonRepeatingStages.length;
                // fill the array in 3 parts
                //  * at the beginning, the early non-repeating stages (e.g. Pre-show or something)
                //  * in the middle, the repeating stage, repeated {gap} times
                //  * at the end, the late non-repeating stages (e.g. Andra Chansen, Final)
                stages = [
                    ...referentialStages.slice(0, repeatingStageIndex),
                    ...Array.from(Array(gap).keys()).map(i => `${repeatingStage}${gap == 1 ? '' : ` ${i + 1}`}`),
                    ...referentialStages.slice(repeatingStageIndex + 1)
                ]
            }
            events.forEach((event, index) => event['stage'] = stages[index]);
        }
    }

    const generateEvent = (suggestedDate: SuggestionDate, key: string) => {
        // TODO save events on the Suggestion (split in 2 types (Lys/(local)), like the rest?)
        const newEvents: GeneratedEvent[] = [...events, {
            id: -1,
            key: key,
            country: countryData.country,
            name: countryData.eventName,
            dateTimeCet: suggestedDate.dateTimeCet,
            endDateTimeCet: suggestedDate.dateTimeCet.replace('T00', 'T02'),
            stage: '',
            watchLinks: [...countryData.watchLinks]
        }].sort((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet));
        // regenerate stages
        setStages(newEvents);
        setEvents(newEvents);
    }

    const removeEvent = (key: string) => {
        const newEvents = [...events];
        newEvents.splice(events.findIndex((e) => e.key === key), 1);
        // regenerate stages
        setStages(newEvents);
        setEvents(newEvents);
    }

    const onToggleSuggestedDate = (suggestedDate: SuggestionDate, key: string) => {
        const newSuggestion = {...suggestion};
        const dateIndex = newSuggestion.dateTimesCet.indexOf(suggestedDate);
        newSuggestion.dateTimesCet[dateIndex].selected = !newSuggestion.dateTimesCet[dateIndex].selected;
        if (newSuggestion.dateTimesCet[dateIndex].selected) {
            generateEvent(suggestedDate, key);
        } else {
            removeEvent(key);
        }
        console.log(newSuggestion);
        setSuggestion(newSuggestion);
    }

    return (
        <>
            <div className="block md:hidden">
                <SuggestionActionButtons
                    suggestion={suggestion}
                    // accept={accept}
                    // discard={discard}
                    accept={acceptSuggestion}
                    discard={discardSuggestion}
                />
            </div>
            <div className="bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900">
                <div className="flex px-1 flex-row justify-between space-x-2">
                    <Link
                        href={`/suggestions`}
                        className="flex flex-row items-center"
                    >
                        <ArrowLeftIcon className="w-6"/>
                        <span className="hidden md:block md:ml-1">Back</span>
                    </Link>
                    <div className="hidden w-auto grow"></div>
                    <SuggestionActionButtons suggestion={suggestion} accept={acceptSuggestion} discard={discardSuggestion}/>
                    <form action={async () => await submit()}>
                        <button
                            type="submit"
                            className={clsx('w-full px-2 rounded-md ',
                                {
                                    'bg-sky-500 text-background': canSubmit && suggestion.processed,
                                    'bg-none border-1 border-foreground/50 text-foreground/50 cursor-not-allowed': !canSubmit || !suggestion.processed,
                                }
                            )}
                            disabled={!canSubmit || !suggestion.processed}
                        >
                            <div className="flex items-center justify-center">
                                <CheckIcon className="w-5 me-0.5"/>
                                <span className="block py-1 md:text-base">Submit</span>
                            </div>
                        </button>
                    </form>
                </div>

                <div className={clsx('flex flex-col items-center justify-center w-full mt-4',
                    {
                        'text-foreground/50': suggestion.processed
                    }
                )}>
                    <h3 className="text-lg text-center text-foreground/50">{suggestion.country}</h3>
                    <div className="flex flex-col md:flex-row justify-center items-center font-bold">
                        <h1 className="text-2xl text-center">
                            {suggestion.name}
                        </h1>
                        <span className="block md:inline-block">
                                    {suggestion.processed && (
                                        <div
                                            className={clsx('rounded-md ms-2 px-1 py-1 text-xs uppercase text-white dark:text-black',
                                                {
                                                    'bg-red-700 dark:bg-red-300': !suggestion.accepted,
                                                    'bg-lime-600 dark:bg-lime-300': suggestion.accepted
                                                }
                                            )}
                                        >
                                            {suggestion.accepted ? 'Accepted' : 'Discarded'}
                                        </div>
                                    )}
                                </span>
                    </div>
                    {/*<SuggestionActionButtons*/}
                    {/*    suggestion={suggestion}*/}
                    {/*    accept={accept}*/}
                    {/*    discard={discard}*/}
                    {/*/>*/}
                </div>

                <div className="block lg:flex lg:mt-4">
                    <div className={clsx('w-full lg:w-[50%] p-2',
                        {
                            'text-foreground/50': suggestion.processed
                        }
                    )}>
                        <h2 className="text-lg flex items-center mb-2">
                            <ListBulletIcon className="w-6 me-1"/>Details
                        </h2>

                        <div className="py-3 md:px-3">
                            <div className="flex items-center">
                                <TagIcon className="w-5 me-2"/>
                                <input className="p-1 grow bg-foreground/10 text-foreground/50 rounded-lg"
                                       type="text"
                                       name="name"
                                       placeholder="Event name (e.g. Melodifestivalen)"
                                       disabled={true}
                                       value={suggestion.name}
                                />
                            </div>
                        </div>

                        <h2 className="text-lg flex items-center my-2">
                            <SparklesIcon className="w-6 me-1"/>Suggested dates
                            <div className="grow"></div>
                            <button onClick={() => unfoldAll(!unfoldedAll)}
                                    className="flex rounded-xl items-center p-2">
                                {unfoldedAll ? <XMarkIcon className="w-5"/> :
                                    <ChevronUpDownIcon className="w-5"/>}
                                <div className="block text-sm">{unfoldedAll ? 'Fold' : 'Unfold'} all</div>
                            </button>
                        </h2>

                        <div className="md:px-3 mt-3 flex flex-col gap-2">
                            {suggestion.dateTimesCet.map((suggestedDate, index) => {
                                    return (
                                        <SuggestedDate
                                            suggestedDate={suggestedDate}
                                            key={`${suggestion.id}-${index}`}
                                            dateKey={`${suggestion.id}-${index}`}
                                            index={index}
                                            callback={onToggleSuggestedDate}
                                            forceUnfold={unfoldedAll}
                                            selected={suggestedDate.selected}
                                            disabled={suggestion.processed}
                                        />
                                    )
                                }
                            )}
                        </div>

                    </div>

                    <div className={clsx('w-full lg:w-[50%] p-2',
                        {
                            'text-foreground/50': suggestion.processed
                        }
                    )}>
                        <h2 className="text-lg flex items-center mb-2">
                            <EyeIcon className="w-6 me-1"/>Preview
                        </h2>

                        {events.length == 0 ? (
                            <div className="flex flex-col items-center text-foreground/50 py-18">
                                <CubeTransparentIcon className="w-18"/>
                                <span>No date selected</span>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="bg-gray-100 dark:bg-background p-5 md:px-18 rounded-2xl">
                                    {events.map((event, index) => (
                                        <EventCard event={event} active={false} shorten={true}/>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}

function SuggestionActionButtons({suggestion, accept, discard}: {
    suggestion: Suggestion,
    accept: () => Promise<void>,
    discard: () => Promise<void>
}) {
    return (
        <div
            className="absolute md:relative md:bottom-0 bottom-18 start-0 w-full flex items-center justify-center px-2 md:px-0 md:mt-2">
            <form className="grow md:grow-0" action={async () => await discard()}>
                <button className={clsx('w-full px-2 rounded-md',
                    {
                        'bg-sky-500 text-background': suggestion.processed && !suggestion.accepted,
                        'bg-foreground/10': !suggestion.processed || suggestion.accepted
                    })}>
                    <div className="flex items-center justify-center">
                        <XMarkIcon className="w-5 me-0.5"/>
                        <span className="block py-2 md:py-1 text-lg md:text-base">Discard</span>
                    </div>
                </button>
            </form>
            <div className="w-2 md:w-1 shrink-0"></div>
            <form className="grow md:grow-0" action={async () => await accept()}>
                <button className={clsx('w-full px-2 rounded-md',
                    {
                        'bg-sky-500 text-background': suggestion.processed && suggestion.accepted,
                        'bg-foreground/10': !suggestion.processed || !suggestion.accepted
                    })}>
                    <div className="flex items-center justify-center">
                        <CheckIcon className="w-5 me-0.5"/>
                        <span className="block py-2 md:py-1 text-lg md:text-base">Accept</span>
                    </div>
                </button>
            </form>
            <div className="w-2 md:w-1 shrink-0"></div>
        </div>
    );
}

function SuggestedDate({suggestedDate, dateKey, index, callback, forceUnfold, selected, disabled}: {
    suggestedDate: SuggestionDate,
    dateKey: string,
    index: number,
    callback: (d: SuggestionDate, key: string) => void,
    forceUnfold: boolean,
    selected: boolean,
    disabled: boolean
}) {
    const [unfolded, unfold] = useState(forceUnfold);
    const date = new Date(suggestedDate.dateTimeCet);
    const selectedBackgroundShift = ['0px', '-100px', '-200px', '-350px', '-200px', '-100px']
    const surroundingSentence: string[] = suggestedDate.sentence.split(suggestedDate.context);
    const contextualizedSentence = (
        <>
            {surroundingSentence[0]}
            <span className={clsx(
                {
                    'bg-white text-black': suggestedDate.selected,
                    'bg-sky-500 text-background': !suggestedDate.selected,
                }
            )}>{suggestedDate.context}</span>
            {surroundingSentence[1]}
        </>
    );

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        callback(suggestedDate, dateKey);
    }

    useEffect(() => {
        unfold(forceUnfold);
    }, [forceUnfold]);

    return (
        <div
            className={clsx('flex items-center p-3 md:px-5 rounded-xl bg-foreground/10',
                {
                    'text-white': suggestedDate.selected
                }
            )}
            style={!!suggestedDate.selected ? {
                background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                backgroundBlendMode: 'screen',
                backgroundSize: !unfolded ? '100% 400px' : '100%',
                backgroundPosition: !unfolded ? `0 ${selectedBackgroundShift[index % selectedBackgroundShift.length]}` : '0 0'
            } : {}}
        >
            <div className="grow">
                <button className="flex w-full items-center text-sm"
                        onClick={() => unfold(!unfolded)}>
                    <div className={clsx({'font-bold': !!suggestedDate.selected})}>
                        {date.toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
                    </div>
                    {unfolded
                        ? (<ChevronUpIcon className="ml-1.5 w-5"/>)
                        : (<ChevronDownIcon className="ml-1.5 w-5"/>)
                    }
                </button>
                {unfolded && (
                    <div className="p-3">
                        <div className={clsx('border-l-4 p-1 ps-3', {
                            'border-sky-500': !suggestedDate.selected,
                            'border-white': !!suggestedDate.selected
                        })}>
                            <span>{contextualizedSentence}</span>
                        </div>
                        <div className="flex items-center text-sm mt-2">
                            <ClockIcon className="w-4 me-1"/>
                            <span>{date.toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}</span>
                        </div>
                    </div>
                )}
            </div>
            <input
                type="checkbox"
                className={clsx('relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 bg-foreground/10 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2.5 after:h-4 after:ms-1.5 after:rotate-[40deg] after:border-b-4 after:border-r-4',
                    {
                        'checked:bg-transparent checked:border-1 border-white after:border-white': !disabled,
                        'checked:border-foreground/30 after:border-foreground/50': disabled
                    }
                )}
                id="scheduleDeviceTime"
                name="scheduleDeviceTime"
                checked={selected}
                onChange={onChange}
                disabled={disabled}
            />
        </div>
    )
}