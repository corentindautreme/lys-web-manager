'use client';

import { Suggestion, SuggestionDate } from '@/app/types/suggestion';
import { Event } from '@/app/types/events/event'
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowUturnLeftIcon,
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
import { ChangeEvent, useEffect, useState } from 'react';
import { useCountries } from '@/app/(main)/referential/utils';
import { Country } from '@/app/types/country';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import { EventCard } from '@/app/components/events/event/event-cards';
import { redirect } from 'next/navigation';

function SuggestionActionButtons({onAccept, onDiscard}: {
    onAccept: CallableFunction,
    onDiscard: CallableFunction
}) {
    return (
        <div className="absolute md:relative md:bottom-0 bottom-18 start-0 w-full flex px-2 md:px-0">
            <form className="grow" action={async () => await onDiscard()}>
                <button className="w-full px-2 me-1 rounded-md bg-foreground/10">
                    <div className="flex items-center justify-center">
                        <XMarkIcon className="w-5 me-0.5"/>
                        <span className="block py-2 md:py-1 text-lg md:text-base">Discard</span>
                    </div>
                </button>
            </form>
            <div className="w-2 md:w-1 shrink-0"></div>
            <form className="grow" action={async () => await onAccept()}>
                <button className="w-full px-2 rounded-md bg-sky-500 text-background">
                    <div className="flex items-center justify-center">
                        <CheckIcon className="w-5 me-0.5"/>
                        <span className="block py-2 md:py-1 text-lg md:text-base">Accept</span>
                    </div>
                </button>
            </form>
        </div>
    );
}

type GeneratedEvent = Event & {
    key: string;
}

export default function ProcessSuggestion({suggestionId}: { suggestionId: number }) {
    const {suggestions, mutate, isLoading: isLoadingSuggestions} = useSuggestions();
    const {countryData, isLoading: isLoadingCountryData, error: countryDataError} = useCountries();
    const [suggestion, setSuggestion] = useState<Suggestion>();
    const [currentCountryData, setCurrentCountryData] = useState<Country | null>(null);
    const [eventName, setEventName] = useState('');
    const [events, setEvents] = useState<GeneratedEvent[]>([]);
    const [unfoldedAll, unfoldAll] = useState(false);

    const updateSuggestionCache = async (suggestion: Suggestion) => {
        suggestion.processed = true;
        const newSuggestions = [...suggestions].filter((s: Suggestion) => s.id != suggestionId);
        newSuggestions.push(suggestion);
        newSuggestions.sort((s1, s2) => s2.id - s1.id);
        await mutate(newSuggestions);
        // TODO doesn't work if one date or more was checked
        redirect('/suggestions');
    }

    const onAccept = async (suggestion: Suggestion) => {
        suggestion.accepted = true;
        await updateSuggestionCache(suggestion);
    }

    const onDiscard = async (suggestion: Suggestion) => {
        suggestion.accepted = false;
        suggestion.dateTimesCet.forEach(d => d.selected = false);
        await updateSuggestionCache(suggestion);
    }

    // TODO properly map repeating stages
    const setStages = (events: GeneratedEvent[]) => {
        if (events.length == 0) {
            return;
        } else if (events.length == 1) {
            events[0].stage = 'Final';
        } else if (!!currentCountryData) {
            const referentialStages = currentCountryData.stages;
            let repeatedStagesCount = referentialStages.filter(s => s.endsWith('...')).length;
            let repeatedStageIndex;

            // default stages if not properly defined in referential
            let stages;
            if ((repeatedStagesCount == 0 && events.length > referentialStages.length) || repeatedStagesCount > 1) {
                stages = ['Night...', 'Final'];
                repeatedStageIndex = 0;
            } else {
                stages = [...referentialStages];
                repeatedStageIndex = stages.findIndex(stage => stage.endsWith('...'));
            }
            const repeatedStageName = stages[repeatedStageIndex];
            const stageCountToRepeat = events.length - stages.filter(s => !s.endsWith('...')).length;

            let idxStage = 0;
            let idxEvent = 0;
            // define the stage of the first non-repeated stages of the event (to handle cases where the repetition
            // occurs in the middle of the series)
            for (; idxStage < repeatedStageIndex; idxStage++, idxEvent++) {
                events[idxEvent].stage = stages[idxStage];
            }
            // define the stage for the shows of the repeated stage of the event (e.g. all heats)
            for (let repeatedCount = 1; repeatedCount < stageCountToRepeat; repeatedCount++, idxEvent++) {
                events[idxEvent].stage = repeatedStageName.replace('...', (stageCountToRepeat > 1 ? ` ${repeatedCount}` : ''));
            }
            // define the stage for the last shows of the event
            for (idxStage = repeatedStageIndex + 1; idxStage < stages.length; idxStage++, idxEvent++) {
                events[idxEvent].stage = stages[idxStage];
            }
        }
    }

    const generateEvent = (d: SuggestionDate, key: string) => {
        if (!!currentCountryData) {
            const newEvents: GeneratedEvent[] = [...events, {
                id: -1,
                key: key,
                country: currentCountryData.country,
                name: currentCountryData.eventName,
                dateTimeCet: d.dateTimeCet,
                endDateTimeCet: d.dateTimeCet.replace('T00', 'T02'),
                stage: '',
                watchLinks: [...currentCountryData.watchLinks]
            }].sort((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet));
            // regenerate stages
            setStages(newEvents);
            setEvents(newEvents);
        }
    }

    const removeEvent = (key: string) => {
        const newEvents = [...events].filter(e => e.key !== key);
        // regenerate stages
        setStages(newEvents);
        setEvents(newEvents);
    }

    const onSuggestedDateSelected = (d: SuggestionDate, key: string, e: ChangeEvent<HTMLInputElement>) => {
        if (!!suggestion) {
            const newSuggestion: Suggestion = {...suggestion};
            newSuggestion.dateTimesCet = [...suggestion.dateTimesCet];
            const idx = newSuggestion.dateTimesCet.indexOf(d);
            newSuggestion.dateTimesCet[idx].selected = e.target.checked;
            if (e.target.checked) {
                generateEvent(d, key);
            } else {
                removeEvent(key);
            }
            setSuggestion(newSuggestion);
        }
    }

    const reprocessSuggestion = async () => {

    }

    // once SWR has loaded the data, set the suggestion, so we can start processing it (and hide the loading screen)
    useEffect(() => {
        if (!!suggestions && !!countryData) {
            const suggestion = suggestions.filter((s: Suggestion) => s.id == suggestionId)[0];
            setCurrentCountryData(countryData.filter(c => c.country == suggestion.country)[0]);
            setSuggestion(suggestion);
            setEventName(suggestion.name);
            console.log(suggestion);
        }
    }, [suggestions, countryData]);

    return (
        <>
            {!isLoadingSuggestions && !!suggestion ? (
                <>
                    <div className="block md:hidden">
                        <SuggestionActionButtons
                            onAccept={onAccept.bind(null, suggestion)}
                            onDiscard={onDiscard.bind(null, suggestion)}
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
                            {!suggestion.processed ?
                                (
                                    <div className="hidden md:flex">
                                        <SuggestionActionButtons
                                            onAccept={onAccept.bind(null, suggestion)}
                                            onDiscard={onDiscard.bind(null, suggestion)}
                                        />
                                    </div>
                                ) : (
                                    <form action={async () => await reprocessSuggestion()}>
                                        <button className="px-2 me-1 rounded-md bg-foreground/10">
                                            <div className="flex items-center">
                                                <ArrowUturnLeftIcon className="w-5 me-1"/>
                                                <span className="block py-1">Reprocess</span>
                                            </div>
                                        </button>
                                    </form>
                                )}
                        </div>

                        <div className={clsx('w-full mt-4',
                            {
                                'text-foreground/50': suggestion.processed
                            }
                        )}>
                            <h3 className="text-lg text-center text-foreground/50">{suggestion.country}</h3>
                            <div className="flex flex-col-reverse md:flex-row justify-center items-center font-bold">
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
                                        <input className="p-1 grow bg-foreground/10 rounded-lg"
                                               type="text"
                                               name="name"
                                               placeholder="Event name (e.g. Melodifestivalen)"
                                               value={eventName}
                                               onChange={(e) => setEventName(e.target.value)}
                                               disabled={suggestion.processed}
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
                                    {suggestion.dateTimesCet.map((suggestedDate, index) => (
                                        <SuggestedDate
                                            suggestedDate={suggestedDate}
                                            dateKey={`${suggestionId}-${index}`}
                                            index={index}
                                            onSelect={(e: ChangeEvent<HTMLInputElement>) => onSuggestedDateSelected(suggestedDate, `${suggestionId}-${index}`, e)}
                                            forceUnfold={unfoldedAll}
                                            disabled={suggestion.processed}
                                        />
                                    ))}
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
            ) : (
                'Loading...'
            )}
        </>
    );
}

function SuggestedDate({suggestedDate, dateKey, index, onSelect, forceUnfold, disabled}: {
    suggestedDate: SuggestionDate,
    dateKey: string,
    index: number,
    onSelect: (e: ChangeEvent<HTMLInputElement>) => void,
    forceUnfold: boolean,
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

    useEffect(() => {
        unfold(forceUnfold);
    }, [forceUnfold]);

    return (
        <div key={dateKey}
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
                        // 'checked:bg-sky-500 after:border-white dark:after:border-black': !disabled,
                        'checked:bg-transparent checked:border-1 border-white after:border-white': !disabled,
                        'checked:border-foreground/30 after:border-foreground/50': disabled
                    }
                )}
                id="scheduleDeviceTime"
                name="scheduleDeviceTime"
                checked={!!suggestedDate.selected}
                onChange={onSelect}
                disabled={disabled}
            />
        </div>
    )
}