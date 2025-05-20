'use client';

import { Event } from '@/app/types/events/event'
import { EventCard } from '@/app/components/events/event/event-cards';
import Link from 'next/link';
import { clsx } from 'clsx';
import { redirect, useSearchParams } from 'next/navigation';
import { getQueryParamString } from '@/app/utils/event-utils';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEvents } from '@/app/(main)/events/utils';
import { submitEvents } from '@/app/(main)/events/actions';
import { KeyedMutator } from 'swr';
import { JSX, useEffect, useState } from 'react';
import EventListSkeleton from '@/app/(main)/events/components/event-list-skeleton';
import ErrorScreen from '@/app/components/error-screen';
import { DataSubmissionResponse } from '@/app/types/data-submission-response';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import SuggestionCard from '@/app/(main)/suggestions/components/suggestion-card';

// async function submitProcessedSuggestions(
//     events: Event[],
//     onSuccess: KeyedMutator<Event[]>,
//     onError: (errorName: string, message: string) => void
// ) {
//     const response: DataSubmissionResponse = await submitEvents(events);
//     if (response.success) {
//         const updatedEvents = events
//             .filter(e => !e.deleted)
//             .map(e => {
//                 e.modified = false;
//                 e.created = false;
//                 e.rescheduled = false;
//                 return e;
//             });
//         await onSuccess(updatedEvents);
//         redirect('/events');
//     } else {
//         onError(response.error, response.message);
//     }
// }
//
// function UnsavedSuggestionsBanner({count, events, callback}: {
//     count: number,
//     events: Event[],
//     callback: KeyedMutator<Event[]>
// }) {
//     const [error, setError] = useState<JSX.Element>();
//     const onError = (errorName: string, message: string) => {
//         setError(<div className=""><span className="font-bold">{errorName}</span> has occurred with message: {message}</div>);
//     }
//     const submit = submitProcessedSuggestions.bind(null, events, callback, onError);
//     return (
//         <div className={clsx('flex flex-col rounded-lg p-3 text-background', {
//             'bg-sky-500 ': !error,
//             'bg-red-400 dark:bg-red-600': !!error,
//         })}>
//             <div className="flex">
//                     <span className="flex flex-row content-center">
//                         <ExclamationCircleIcon className="w-5 me-1"/>
//                         {count} unsaved event(s)
//                     </span>
//                 <div className="grow"></div>
//                 <form action={submit}>
//                     <button className="border-1 border-background px-2">Save</button>
//                 </form>
//             </div>
//             {!!error && <div className="flex flex-col mt-2 pt-2 border-t-1 border-background">
//                     <span className="flex flex-row content-center">
//                         <ExclamationTriangleIcon className="shrink-0 w-5 me-1.5"/>
//                         {error}
//                     </span>
//                 <form className="text-right" action={() => setError('')}>
//                     <button type="submit" className="text-sm underline cursor-pointer">Dismiss</button>
//                 </form>
//             </div>}
//         </div>
//     );
// }

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
                            {/*{modifiedCount > 0 &&*/}
                            {/*    <UnsavedSuggestionsBanner count={modifiedCount} events={suggestions} callback={mutate}/>}*/}

                            <div className="flex mt-2 overflow-y-auto flex-col">
                                {suggestions?.map(suggestion => {
                                        return (
                                            <div key={suggestion.id}>
                                                <Link href={`/suggestions/process/${suggestion.id}`}>
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