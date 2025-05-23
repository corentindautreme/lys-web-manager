'use client';

import Link from 'next/link';
import { clsx } from 'clsx';
import { redirect } from 'next/navigation';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { KeyedMutator } from 'swr';
import { JSX, useEffect, useState } from 'react';
import EventListSkeleton from '@/app/(main)/events/components/event-list-skeleton';
import ErrorScreen from '@/app/components/error-screen';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import SuggestionCard from '@/app/(main)/suggestions/components/suggestion-card';
import { Suggestion } from '@/app/types/suggestion';
import { submitSuggestions } from '@/app/(main)/suggestions/actions';

async function submitProcessedSuggestions(
    suggestions: Suggestion[],
    onSuccess: KeyedMutator<Suggestion[]>,
    onError: (errorName: string, message: string) => void
) {
    const response: DataSubmissionResponse = await submitSuggestions(suggestions);
    if (response.success) {
        const updatedSuggestions = suggestions.filter(s => !s.processed);
        await onSuccess(updatedSuggestions);
        redirect('/suggestions');
    } else {
        onError(response.error, response.message);
    }
}

function UnsavedSuggestionsBanner({count, suggestions, callback}: {
    count: number,
    suggestions: Suggestion[],
    callback: KeyedMutator<Suggestion[]>
}) {
    const [error, setError] = useState<JSX.Element>();
    const onError = (errorName: string, message: string) => {
        setError(<div className=""><span className="font-bold">{errorName}</span> has occurred with message: {message}</div>);
    }
    const submit = submitProcessedSuggestions.bind(null, suggestions, callback, onError);
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
    const [suggestions, setSuggestions] = useState(loadedSuggestions);
    const modifiedCount = suggestions?.filter(e => e.processed).length;

    // once SWR has loaded the data, set the suggestion list, so we can start editing it (and hide the loading screen)
    useEffect(() => {
        setSuggestions(loadedSuggestions);
    }, [loadedSuggestions]);

    return (
        <>
            {!!error ? (
                <ErrorScreen
                    title={error.name}
                    message={`${error.message} (status: ${error.cause.status})`}
                />
            ) : (!isLoading && !!suggestions ? (
                    <>
                        <div className="h-full flex flex-col">
                            {modifiedCount > 0 &&
                                <UnsavedSuggestionsBanner count={modifiedCount} suggestions={suggestions} callback={mutate}/>}

                            <div className="flex mt-2 overflow-y-auto flex-col">
                                {suggestions?.map(suggestion => {
                                        return (
                                            <div key={suggestion.id}>
                                                <Link href={`/suggestions/process/${suggestion.id}#${suggestion.id}`}>
                                                    {/*
                        Stick the ID on a relative div, so that navigating to # "scrolls back up" a litle bit, to
                        give a visual cue that there's more above in the list
                        */}
                                                    <div
                                                        id={suggestion.id.toString()}
                                                        className="relative top-[-20px]"
                                                    />
                                                    <SuggestionCard suggestion={suggestion} active={currentSuggestionId == suggestion.id}/>
                                                </Link>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </div>
                    </>
                ) : (<EventListSkeleton/>)
            )}
        </>
    );
}