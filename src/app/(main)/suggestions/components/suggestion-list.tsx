'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { redirect } from 'next/navigation';
import { CheckIcon, ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
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
        if (s.processed && s.accepted) {
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
    const {suggestions: loadedSuggestions, mutate, isLoading, error} = useSuggestions();
    const {events: events, mutate: mutateEvents} = useEvents();
    const [suggestions, setSuggestions] = useState(loadedSuggestions);
    const modifiedCount = suggestions?.filter(e => e.processed).length;

    // once SWR has loaded the data, set the suggestion list, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        setSuggestions(loadedSuggestions);
    }, [loadedSuggestions]);

    const submittedSuggestionsCallback = async (suggestions: Suggestion[]) => {
        // after successfully submitting processed suggestions (and potential new events!) to AWS, update the
        // suggestions and event caches
        await mutate(suggestions.filter(s => !s.processed));
        const createdEvents = suggestions
            .filter(s => s.processed && s.accepted)
            .map(s => s.events || [])
            .flat();
        if (createdEvents.length > 0) {
            await mutateEvents([...events, ...createdEvents].toSorted((e1, e2) => e1.dateTimeCet.localeCompare(e2.dateTimeCet)));
        }
    }

    return (
        <>
            {!!error ? (
                <ErrorScreen
                    title={error.name}
                    message={`${error.message} (status: ${error.cause.status})`}
                />
            ) : (!isLoading && !!suggestions ?
                    (suggestions.length == 0 ? (
                            <div className="h-[80dvh] md:h-full flex flex-col items-center justify-center text-foreground/50">
                                <CheckIcon className="w-18"/>
                                <h1 className="text-xl">All done!</h1>
                                <div className="text-center">There are no more suggestions to process. Come back tomorrow!</div>
                            </div>
                        ) : (
                            <>
                                <div className="h-full flex flex-col gap-y-1">
                                    {modifiedCount > 0 &&
                                        <UnsavedSuggestionsBanner count={modifiedCount} suggestions={suggestions}
                                                                  events={events}
                                                                  callback={submittedSuggestionsCallback}/>}

                                    <div className="flex overflow-y-auto flex-col gap-y-1">
                                        {suggestions?.map(suggestion => {
                                                return (
                                                    <div key={suggestion.id}>
                                                        <Link
                                                            href={`/suggestions/process/${suggestion.id}#${suggestion.id}`}>
                                                            {/*
                    Stick the ID on a relative div, so that navigating to # "scrolls back up" a litle bit, to
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
                                                )
                                            }
                                        )}
                                    </div>
                                </div>
                            </>
                        )
                    ) : (
                        <SuggestionListSkeleton/>
                    )
            )}
        </>
    );
}