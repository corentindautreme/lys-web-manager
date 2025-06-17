'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { redirect, useSearchParams } from 'next/navigation';
import {
    CheckIcon,
    DocumentCheckIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { JSX, useEffect, useState } from 'react';
import ErrorScreen from '@/app/components/error-screen';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import SuggestionCard from '@/app/(main)/suggestions/components/suggestion-card';
import { Suggestion } from '@/app/types/suggestion';
import { Event } from '@/app/types/events/event';
import { submitSuggestions } from '@/app/(main)/suggestions/actions';
import { useEvents } from '@/app/(main)/events/utils';
import SuggestionListSkeleton from '@/app/(main)/suggestions/components/suggestion-list-skeleton';

async function submitProcessedSuggestions(
    suggestions: Suggestion[],
    nextEventId: number,
    onSuccess: (suggestions: Suggestion[]) => Promise<void>,
    onError: (errorName: string, message: string) => void
) {
    // set id on each event before saving them
    suggestions.forEach(s => {
        if (s.reprocessable && s.processed && s.accepted) {
            s.events?.forEach(e => {
                e.id = nextEventId++;
            });
        }
    });
    const response: DataSubmissionResponse = await submitSuggestions(suggestions);
    if (response.success) {
        await onSuccess(suggestions);
        redirect('/suggestions');
    } else {
        onError(response.error || '', response.message || '');
    }
}

function UnsavedSuggestionsBanner({count, suggestions, events, callback}: {
    count: number,
    suggestions: Suggestion[],
    events: Event[],
    callback: (suggestions: Suggestion[]) => Promise<void>
}) {
    const [error, setError] = useState<JSX.Element>();
    const onError = (errorName: string, message: string) => {
        setError(<div className=""><span className="font-bold">{errorName}</span> has occurred with message: {message}
        </div>);
    }
    const nextEventId = events.toSorted((e1, e2) => e2.id - e1.id)[0].id + 1;
    const submit = submitProcessedSuggestions.bind(null, suggestions, nextEventId, callback, onError);
    return (
        <div className={clsx('flex flex-col rounded-lg p-3 text-background', {
            'bg-sky-500 ': !error,
            'bg-red-400 dark:bg-red-600': !!error,
        })}>
            <div className="flex items-center justify-between">
                <div className="flex flex-row items-center">
                    <ExclamationCircleIcon className="shrink-0 w-5 me-1"/>
                    <span className="block text-sm md:text-base">{count} processed pending</span>
                </div>
                <form action={submit}>
                    <button className="border-1 border-background px-2">Submit</button>
                </form>
            </div>
            {!!error && <div className="flex flex-col mt-2 pt-2 border-t-1 border-background">
                    <span className="flex flex-row content-center">
                        <ExclamationTriangleIcon className="shrink-0 w-5 me-1.5"/>
                        {error}
                    </span>
                <form className="text-right" action={() => setError(undefined)}>
                    <button type="submit" className="text-sm underline cursor-pointer">Dismiss</button>
                </form>
            </div>}
        </div>
    );
}

export default function SuggestionList({currentSuggestionId}: { currentSuggestionId?: number | undefined }
) {
    const queryParams = useSearchParams();
    const showProcessed = queryParams.get('showProcessed');
    const {suggestions: loadedSuggestions, mutate, isLoading, error} = useSuggestions();
    const {events: events, mutate: mutateEvents} = useEvents();
    const [suggestions, setSuggestions] = useState(loadedSuggestions);
    const [processableSuggestions, setProcessableSuggestions] = useState<Suggestion[]>();
    const [unprocessableSuggestions, setUnprocessableSuggestions] = useState<Suggestion[]>();
    const [hideProcessed, toggleHideProcessed] = useState(!showProcessed || false);
    const modifiedCount = suggestions?.filter(s => s.reprocessable && s.processed).length;

    // once SWR has loaded the data, set the suggestion list, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        if (!!loadedSuggestions) {
            setSuggestions(loadedSuggestions);
            setProcessableSuggestions(loadedSuggestions.filter(e => e.reprocessable));
            setUnprocessableSuggestions(loadedSuggestions.filter(e => !e.reprocessable));
        }
    }, [loadedSuggestions]);

    const toggleHideProcessedSuggestions = (shouldHide: boolean) => {
        toggleHideProcessed(shouldHide);
        window.history.replaceState(null, '', shouldHide ? '?' : '?showProcessed=true');
    }

    const submittedSuggestionsCallback = async (suggestions: Suggestion[]) => {
        // after successfully submitting processed suggestions (and potential new events!) to AWS, flag the newly
        // processed suggestions as un-reprocessable (= as if they were coming straight from the backend) and update the
        // suggestions and event caches
        const createdEvents = suggestions
            .filter(s => s.reprocessable && s.processed && s.accepted)
            .map(s => s.events || [])
            .flat();
        await mutate(suggestions.map(s => ({...s, reprocessable: !s.processed})));
        if (createdEvents.length > 0) {
            await mutateEvents([...events, ...createdEvents].toSorted((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet)));
        }
    }

    return (
        <>
            {!!error ? (
                <ErrorScreen
                    title={error.name}
                    message={`${error.message} (status: ${error.cause.status})`}/>
            ) : (!isLoading && !!suggestions && !!processableSuggestions && !!unprocessableSuggestions ? (
                    <div className="h-full overflow-y-auto">
                        <div className="mt-2 mx-auto w-fit flex items-center p-2 bg-foreground/10 rounded-3xl">
                            <label className="flex items-center text-sm" htmlFor="hideProcessed">
                                <DocumentCheckIcon className="w-5 me-1"/>
                                Hide recently processed
                            </label>
                            <input
                                type="checkbox"
                                className="relative peer ms-2 appearance-none shrink-0 rounded w-4 h-4 bg-foreground/10 after:content-[''] after:hidden checked:after:inline-block after:w-2 after:h-3.5 after:ms-1 after:mb-1.5 after:rotate-[40deg] after:border-b-3 after:border-r-3 checked:bg-sky-500 after:border-white dark:after:border-black"
                                id="hideProcessed"
                                name="hideProcessed"
                                checked={hideProcessed}
                                onChange={(e) => toggleHideProcessedSuggestions(e.target.checked)}
                            />
                        </div>
                        {hideProcessed && processableSuggestions.length == 0 ? (
                            <div
                                className="h-[80dvh] flex flex-col items-center justify-center text-foreground/50">
                                <CheckIcon className="w-18"/>
                                <h1 className="text-xl">All done!</h1>
                                <div className="text-center">There are no more suggestions to process. Come back
                                    tomorrow!
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-y-1">
                                    {modifiedCount > 0 &&
                                        <UnsavedSuggestionsBanner count={modifiedCount} suggestions={suggestions}
                                                                  events={events}
                                                                  callback={submittedSuggestionsCallback}
                                        />
                                    }
                                    <div className="flex flex-col gap-y-1">
                                        {/* Unprocessed suggestions */}
                                        {processableSuggestions.map((suggestion, index) => {
                                                return (
                                                    <>
                                                        {(index == 0 || (!!suggestion.extractionDate && suggestion.extractionDate != suggestions.filter(s => s.reprocessable)[index - 1].extractionDate)) &&
                                                            <div className="py-1 font-bold">
                                                                {new Date(suggestion.extractionDate!).toLocaleString('en-US', {
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </div>
                                                        }
                                                        <div key={suggestion.id}>
                                                            <Link
                                                                href={`/suggestions/process/${suggestion.id}${!hideProcessed ? '?showProcessed=true' : ''}#${suggestion.id}`}>
                                                                {/*
                                                                Stick the ID on a relative div, so that navigating to # "scrolls back up" a little bit, to
                                                                give a visual cue that there's more above in the list
                                                                */}
                                                                <div
                                                                    id={suggestion.id.toString()}
                                                                    className="relative top-[-20px]"
                                                                />
                                                                <SuggestionCard suggestion={suggestion}
                                                                                active={currentSuggestionId == suggestion.id}/>
                                                            </Link>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        )}
                                        {/* Already processed suggestions (loaded from AWS) */}
                                        {!hideProcessed && unprocessableSuggestions.map((suggestion, index) => {
                                                return (
                                                    <>
                                                        {(index == 0 || (!!suggestion.extractionDate && suggestion.extractionDate.substring(5, 7) != suggestions.filter(s => !s.reprocessable)[index - 1].extractionDate?.substring(5, 7))) &&
                                                            <div className="py-1 font-bold">
                                                                {new Date(suggestion.extractionDate!).toLocaleString('en-US', {month: 'long'})}
                                                            </div>
                                                        }
                                                        <div key={suggestion.id}>
                                                            <Link
                                                                href={`/suggestions/process/${suggestion.id}${!hideProcessed ? '?showProcessed=true' : ''}#${suggestion.id}`}>
                                                                {/*
                                                                Stick the ID on a relative div, so that navigating to # "scrolls back up" a little bit, to
                                                                give a visual cue that there's more above in the list
                                                                */}
                                                                <div
                                                                    id={suggestion.id.toString()}
                                                                    className="relative top-[-20px]"
                                                                />
                                                                <SuggestionCard suggestion={suggestion}
                                                                                active={currentSuggestionId == suggestion.id}/>
                                                            </Link>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>) : <SuggestionListSkeleton/>
            )}
        </>
    );
}