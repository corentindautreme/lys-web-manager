'use client';

import { GeneratedEvent, Suggestion, SuggestionDate } from '@/app/types/suggestion';
import { Country } from '@/app/types/country';
import { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    ArrowUturnLeftIcon,
    CheckIcon,
    ChevronDownIcon,
    ChevronUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
    CubeTransparentIcon,
    EyeIcon,
    ListBulletIcon,
    NewspaperIcon,
    SparklesIcon,
    TagIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { EventCard } from '@/app/components/events/event/event-cards';
import { insertHeader } from '@/app/(main)/events/components/event-list';
import { useBreakpoint } from '@/app/utils/display-utils';

export default function SuggestionDetails({suggestionParam, countryData, onSubmit}: {
    suggestionParam: Suggestion,
    countryData: Country,
    onSubmit: (suggestion: Suggestion) => Promise<never>
}) {
    const [suggestion, setSuggestion] = useState(suggestionParam);
    const [events, setEvents] = useState<GeneratedEvent[]>([]);
    const [unfoldedAll, unfoldAll] = useState(false);

    useEffect(() => {
        generateEvents(suggestionParam.dateTimesCet);
    }, []);

    const acceptSuggestion = async () => {
        const newSuggestion: Suggestion = {
            ...suggestion,
            processed: true,
            accepted: true,
            events: events
        };
        await onSubmit(newSuggestion);
    }

    const discardSuggestion = async () => {
        const newSuggestion = {
            ...suggestion,
            processed: true,
            accepted: false
        };
        newSuggestion.dateTimesCet.forEach(d => d.selected = false);
        await onSubmit(newSuggestion);
    }

    const reprocessSuggestion = async () => {
        const newSuggestion = {
            ...suggestion,
            processed: false,
            accepted: false,
        };
        setSuggestion(newSuggestion);
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

    const generateEvents = (suggestedDates: SuggestionDate[]) => {
        const newEvents: GeneratedEvent[] = [];
        suggestedDates.forEach((d, index) => {
            if (d.selected) {
                newEvents.push({
                    id: -1,
                    key: `${suggestionParam.id}-${index}`,
                    country: countryData.country,
                    name: countryData.eventName,
                    dateTimeCet: d.dateTimeCet,
                    endDateTimeCet: d.dateTimeCet.replace('T00', 'T02'),
                    stage: '',
                    watchLinks: [...countryData.watchLinks]
                });
            }
        });
        newEvents.sort((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet));
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
        setSuggestion(newSuggestion);
    }

    return (
        <>
            <div className="block md:hidden">
                <SuggestionActionButtons
                    suggestion={suggestion}
                    accept={acceptSuggestion}
                    discard={discardSuggestion}
                    reprocess={reprocessSuggestion}
                />
            </div>
            <div className="bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900">
                <div className="flex items-center justify-between px-1 space-x-2">
                    <Link
                        href={`/suggestions`}
                        className="flex flex-row items-center"
                    >
                        <ArrowLeftIcon className="w-6"/>
                        <span className="hidden md:block md:ml-1">Back</span>
                    </Link>
                    <SuggestionActionButtons
                        suggestion={suggestion}
                        accept={acceptSuggestion}
                        discard={discardSuggestion}
                        reprocess={reprocessSuggestion}
                    />
                </div>

                <div className={clsx('flex flex-col items-center justify-center w-full mt-4',
                    {
                        'text-foreground/50': suggestion.processed
                    }
                )}>
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
                    <h3 className="text-lg text-center text-foreground/50">{suggestion.country}</h3>
                </div>

                {/* TODO 2xl = suggested dates as a grid? */}
                <div className="block lg:flex lg:mt-4">
                    <div className={clsx('w-full lg:w-[50%] xl:grow p-2',
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
                                       disabled={true}
                                       value={suggestion.name}
                                />
                            </div>

                            <div className="flex items-center mt-2">
                                <NewspaperIcon className="shrink-0 w-5 me-2"/>
                                <input className="p-1 grow bg-foreground/10 text-foreground/50 rounded-lg"
                                       type="text"
                                       name="name"
                                       size={1}
                                       disabled={true}
                                       value={suggestion.sourceLink}
                                />
                                <a
                                    href={suggestion.sourceLink}
                                    target="_blank"
                                    className={clsx('flex px-2 py-1.5 ms-1 rounded-md text-sm',
                                        {
                                            'bg-none border-1 border-foreground/50 text-foreground/50': suggestion.processed,
                                            'bg-sky-500 text-background': !suggestion.processed
                                        }
                                    )}
                                >
                                    <ArrowTopRightOnSquareIcon className="w-5 me-1"/>
                                    <span className="block">Open</span>
                                </a>
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

                        <div className="2xl:grid flex flex-col md:px-3 mt-3 grid-flow-row grid-cols-2 gap-2">
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
                            {suggestion.dateTimesCet.length % 2 == 1 && (
                                <div
                                    className="hidden 2xl:block rounded-xl w-full h-full border-1 border-dashed border-foreground/30"></div>
                            )}
                        </div>

                    </div>

                    <div className={clsx('w-full lg:w-[50%] xl:w-fit p-2',
                        {
                            'text-foreground/50': suggestion.processed
                        }
                    )}>
                        <h2 className="text-lg flex items-center mb-2">
                            <EyeIcon className="w-6 me-1"/>Preview
                        </h2>

                        {events.length == 0 ? (
                            <div className="flex flex-col w-full xl:w-[340px] items-center text-foreground/50 py-18">
                                <CubeTransparentIcon className="w-18"/>
                                <span>No date selected</span>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <div className="bg-gray-100 dark:bg-background p-5 m-auto rounded-2xl">
                                    <div className="w-full xl:w-[300px]">
                                        {events.map((event, index) => (
                                            <>
                                                {insertHeader(event, index > 0 ? events[index - 1] : undefined)}
                                                <EventCard event={event} active={false} shorten={true}/>
                                            </>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="md:hidden h-14"></div>
        </>
    );
}

function SuggestionActionButtons({suggestion, accept, discard, reprocess}: {
    suggestion: Suggestion,
    accept: () => Promise<void>,
    discard: () => Promise<void>,
    reprocess: () => Promise<void>
}) {
    const canAccept = suggestion.dateTimesCet.some(d => d.selected);
    return (
        <div
            className="absolute md:relative md:bottom-0 bottom-14 start-0 w-full md:w-fit flex ps-2 pe-1 pt-2 bg-background dark:bg-neutral-900 border-t-1 md:border-0 border-foreground/10 md:p-0 z-50">
            {suggestion.processed ? (
                <form className="grow md:grow-0" action={async () => await reprocess()}>
                    <button
                        className="w-full px-2 rounded-md  bg-gray-200 dark:bg-neutral-800">
                        <div className="flex items-center justify-center">
                            <ArrowUturnLeftIcon className="w-5 me-1"/>
                            <span className="block py-2 md:py-1 md:text-base">Reprocess</span>
                        </div>
                    </button>
                </form>
            ) : (
                <>
                    <form className="grow md:grow-0" action={async () => await discard()}>
                        <button className="w-full px-2 rounded-md bg-gray-200 dark:bg-neutral-800">
                            <div className="flex items-center justify-center">
                                <XMarkIcon className="w-5 me-0.5"/>
                                <span className="block py-2 md:py-1 md:text-base">Discard</span>
                            </div>
                        </button>
                    </form>
                    <div className="w-2 md:w-1 shrink-0"></div>
                    <form className="grow md:grow-0" action={async () => await accept()}>
                        <button
                            disabled={!canAccept}
                            className={clsx('w-full px-2 rounded-md',
                                {
                                    'bg-sky-500 text-background': !suggestion.processed && canAccept,
                                    'text-foreground/50 cursor-not-allowed': !canAccept
                                })}
                        >
                            <div className="flex items-center justify-center">
                                <CheckIcon className="w-5 me-0.5"/>
                                <span className="block py-2 md:py-1 md:text-base">Accept</span>
                            </div>
                        </button>
                    </form>
                </>
            )}

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
    const selectedBackground2xlVerticalShift = ['0px', '0px', '-100px', '-100px', '-200px', '-200px', '-350px', '-350px', '-200px', '-200px', '-100px', '-100px']
    const selectedBackgroundVerticalShift = ['0px', '-100px', '-200px', '-350px', '-200px', '-100px']
    const selectedBackgroundHorizontalShift = ['0px', '-100%']
    const surroundingSentence: string[] = suggestedDate.sentence.split(suggestedDate.context);
    const {is2xl} = useBreakpoint('2xl');
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
            className={clsx('flex items-center h-fit p-3 md:px-5 rounded-xl bg-foreground/10',
                {
                    'text-white': suggestedDate.selected
                }
            )}
            style={!!suggestedDate.selected ? {
                background: 'linear-gradient(red, transparent), linear-gradient(to top left, lime, transparent), linear-gradient(to top right, blue, transparent)',
                backgroundBlendMode: 'screen',
                backgroundSize: !unfolded ? (is2xl ? '200% 400px' : '100% 400px') : '100%',
                backgroundPosition: !unfolded ? `${is2xl ? selectedBackgroundHorizontalShift[index % selectedBackgroundHorizontalShift.length] : '0'} ${is2xl ? selectedBackground2xlVerticalShift[index % selectedBackground2xlVerticalShift.length] : selectedBackgroundVerticalShift[index % selectedBackgroundVerticalShift.length]}` : '0 0'
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
                className={clsx('relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2.5 after:h-4 after:ms-1.5 after:rotate-[40deg] after:border-b-4 after:border-r-4',
                    {
                        'bg-foreground/10 checked:bg-transparent checked:border-1 border-white after:border-white': !disabled,
                        'bg-black/10': disabled
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