'use client';

import { Event } from '@/app/types/events/event'
import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ArrowTopRightOnSquareIcon,
    ArrowUpOnSquareIcon,
    ArrowUturnLeftIcon,
    ClockIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    GlobeEuropeAfricaIcon,
    ListBulletIcon,
    PlayIcon,
    PlusCircleIcon,
    TagIcon,
    TrashIcon,
    TrophyIcon,
    TvIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { useCountries } from '@/app/(main)/referential/utils';
import { Country } from '@/app/types/country';
import { WatchLink } from '@/app/types/watch-link';
import WatchLinkList, { SwappedHistory } from '@/app/components/watch-links/watch-link-list';
import WatchLinkCard from '@/app/components/watch-links/watch-link-card';

type EventKey = ('country' | 'name' | 'stage' | 'dateTimeCet' | 'endDateTimeCet');

export default function EventDetails({eventParam, onSave, onDelete}: {
    eventParam: Event,
    onSave: (event: Event) => Promise<void>,
    onDelete?: ((event: Event) => Promise<void>)
}) {
    const router = useRouter();
    const isNewEvent = !onDelete && !eventParam.name;
    const [templateSelected, setTemplateSelected] = useState(false);
    const initialDateTime = eventParam.dateTimeCet;
    const [event, setEvent] = useState(eventParam);
    const {countryData, isLoading: countryDataLoading, error: countryDataError} = useCountries();
    const [currentCountryData, setCurrentCountryData] = useState<Country | null>(null);

    const [displayNewLinkForm, setDisplayNewLinkForm] = useState(false);
    const [newWatchLink, setNewWatchLink] = useState({
        link: '',
        comment: '',
        channel: '',
        live: 0,
        replayable: 0,
        castable: 0,
        geoblocked: 0,
        accountRequired: 0
    } as WatchLink);

    useEffect(() => {
        if (!!eventParam.country && !!countryData) {
            const currentCountryData = countryData.filter(c => c.country == eventParam.country)[0];
            setCurrentCountryData(currentCountryData);
            setNewWatchLink({
                link: '',
                comment: '',
                channel: currentCountryData.defaultChannel || '',
                live: 0,
                replayable: 0,
                castable: 0,
                geoblocked: 0,
                accountRequired: 0
            });
        }
    }, [countryData, eventParam.country]);

    const saveEvent = async () => {
        await onSave(event);
    }

    const toggleDelete = async () => {
        if (!!onDelete) {
            await onDelete(event);
        }
    }

    /**
     * To be triggered upon any modification of the event (field, new watch link, etc.) for the changes to be reflected
     * in the app
     * @param event the modified event
     */
    const onEventModified = (event: Event) => {
        event.modified = true;
        setEvent(event);
    }

    /**
     * To be triggered upon modification of an input field of the event (name, stage, start time, etc.)
     * @param e the HTML input element describing the update of the input field
     */
    const onEventDataChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newEvent = {
            ...event,

        };
        if (e.target.name == 'dateTimeCet') {
            newEvent.rescheduled = true;
            newEvent.previousDateTimeCet = initialDateTime;
        }
        newEvent[e.target.name as EventKey] = e.target.value;
        onEventModified(newEvent);
    }

    const onWatchLinkChanged = (index: number, watchLink: WatchLink, deleted?: boolean) => {
        const newEvent = {
            ...event,
        };
        if (!!deleted) {
            newEvent.watchLinks.splice(index, 1);
        } else {
            newEvent.watchLinks[index] = watchLink;
        }
        onEventModified(newEvent);
    };

    const onWatchLinksReordered = (swappedHistory: SwappedHistory) => {
        const newEvent = {
            ...event,
        };
        swappedHistory.forEach(({from, to}: { from: number, to: number }) => {
            [newEvent.watchLinks[from], newEvent.watchLinks[to]] = [newEvent.watchLinks[to], newEvent.watchLinks[from]];
        });
        onEventModified(newEvent);
    };

    const createLink = () => {
        setDisplayNewLinkForm(true);
    };

    const onUpdateNewWatchLink = (index: number, watchLink: WatchLink) => {
        setNewWatchLink({...watchLink});
    };

    const onSaveNewWatchLink = () => {
        const newEvent = {
            ...event,
            watchLinks: [...event.watchLinks, {...newWatchLink}]
        };
        onEventModified(newEvent);
        setNewWatchLink({
            link: '',
            comment: '',
            channel: currentCountryData?.defaultChannel || '',
            live: 0,
            replayable: 0,
            castable: 0,
            geoblocked: 0,
            accountRequired: 0
        });
        setDisplayNewLinkForm(false);
    }

    const onDiscardNewWatchLink = () => {
        setNewWatchLink({
            link: '',
            comment: '',
            channel: currentCountryData?.defaultChannel || '',
            live: 0,
            replayable: 0,
            castable: 0,
            geoblocked: 0,
            accountRequired: 0
        });
        setDisplayNewLinkForm(false);
    }

    const onSelectTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTemplateSelected(true);
        const data = countryData.filter((c: Country) => c.countryCode == e.target.value)[0];
        const newEvent: Event = {
            ...eventParam,
            country: data.country,
            name: data.eventName,
            watchLinks: [...data.watchLinks]
        };
        onEventModified(newEvent);
        setCurrentCountryData(data);
    }

    const clearEvent = () => {
        onEventModified({...eventParam});
        setTemplateSelected(false);
        setCurrentCountryData(null);
    }

    return (
        <div className="bg-background dark:bg-neutral-900 px-1 py-3 md:p-3 rounded-xl md:overflow-y-auto">
            <div className="flex px-1 flex-row justify-between space-x-2">
                <button
                    onClick={() => router.back()}
                    className="flex flex-row items-center"
                >
                    <ArrowLeftIcon className="w-6"/>
                    <span className="hidden md:block md:ml-1">Back</span>
                </button>
                <div className="hidden w-auto grow"></div>
                <div className="flex">
                    <button className="px-2">
                        <EyeIcon className="w-6"/>
                    </button>
                    {event.deleted
                        ? (<div className="flex items-center px-2"><DocumentDuplicateIcon
                            className="w-6 text-foreground/50 cursor-not-allowed"/></div>)
                        : (
                            <Link
                                href={`/events/new?fromId=${event.id}`}
                                className={clsx('flex items-center px-2',
                                    {
                                        'hidden': !onDelete
                                    }
                                )}
                            >
                                <DocumentDuplicateIcon className="w-6"/>
                            </Link>
                        )
                    }
                    <form action={async () => await toggleDelete()}>
                        <button type="submit" className={clsx('px-2 me-2', {'hidden': isNewEvent})}>
                            {!event.deleted
                                ? (<div className="flex items-center py-1"><TrashIcon className="w-6"/></div>)
                                : (<div className="flex items-center py-1"><ArrowUturnLeftIcon className="w-6"/></div>)
                            }
                        </button>
                    </form>
                    <form action={async () => await saveEvent()}>
                        <button
                            disabled={event.deleted}
                            className={clsx('px-2 rounded-md',
                                {
                                    'bg-none border-1 border-foreground/50 text-foreground/50 cursor-not-allowed': event.deleted,
                                    'bg-sky-500 text-background': !event.deleted
                                }
                            )}
                        >
                            <div className="flex items-center">
                                <ArrowUpOnSquareIcon className="w-5 me-0.5"/>
                                <span className="block py-1">Save</span>
                            </div>
                        </button>
                    </form>
                </div>
            </div>

            <div className={clsx('w-full mt-4',
                {
                    'text-foreground/50': event.deleted
                }
            )}>
                <div className="flex flex-col-reverse md:flex-row justify-center items-center font-bold">
                    <h1 className={clsx('text-2xl text-center', {'line-through': event.deleted})}>
                        {!!event.name ? event.name : 'New event'}
                    </h1>
                    <span className="block md:inline-block">
                                {(event.deleted || event.modified) && (
                                    <div
                                        className={clsx('rounded-md ms-2 px-1 py-1 text-xs uppercase text-white dark:text-black',
                                            {
                                                'bg-red-700 dark:bg-red-300': event.deleted,
                                                'bg-foreground/50': event.modified
                                            }
                                        )}
                                    >
                                        {event.deleted ? 'Deleted' : 'Unsaved changes'}
                                    </div>
                                )}
                            </span>
                </div>
                <h3 className={clsx('text-xl text-center text-foreground/50',
                    {
                        'line-through': event.deleted
                    }
                )}>{event.stage}</h3>
            </div>

            <div className="block lg:flex lg:mt-4">
                <div className={clsx('w-full lg:w-[50%] p-2',
                    {
                        'line-through text-foreground/50': event.deleted
                    }
                )}>
                    <h2 className="text-lg flex items-center mb-2">
                        <ListBulletIcon className="w-6 me-1"/>Details
                        <div className="grow"></div>

                        {/* Template selection (new events only) */}
                        {isNewEvent
                            && !countryDataLoading && !countryDataError && (
                                <>
                                    {!templateSelected && (
                                        <>
                                            <GlobeEuropeAfricaIcon className="w-5"/>
                                            <select
                                                className="px-1 py-2 rounded-lg ms-2 text-sm text-center bg-foreground/10 dark:bg-zinc-800"
                                                onChange={onSelectTemplate}
                                            >
                                                <option value="" disabled selected>...</option>
                                                {
                                                    countryData.map((c: Country) => (
                                                        <option key={c.countryCode}>{c.countryCode}</option>))
                                                }
                                            </select>
                                        </>
                                    )}
                                    {templateSelected && (
                                        <button onClick={clearEvent}
                                                className="flex flex-col rounded-xl items-center p-2 bg-foreground/10">
                                            <XMarkIcon className="w-5"/>
                                            <div className="block text-sm">Clear event</div>
                                        </button>
                                    )}
                                </>
                            )
                        }
                    </h2>

                    <div className="py-3 md:px-3">
                        <div className="flex items-center">
                            <GlobeEuropeAfricaIcon className="w-5 me-2"/>
                            <EventTextInput
                                name="country"
                                placeholder="Country"
                                value={event.country}
                                callback={onEventDataChange}
                                disabled={!!event.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <TagIcon className="w-5 me-2"/>
                            <EventTextInput
                                name="name"
                                placeholder="Event name (e.g. Melodifestivalen)"
                                value={event.name}
                                callback={onEventDataChange}
                                disabled={!!event.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <TrophyIcon className="w-5 me-2"/>
                            <EventTextInput
                                name="stage"
                                placeholder="Stage (e.g. Final)"
                                value={event.stage}
                                callback={onEventDataChange}
                                disabled={!!event.deleted}
                            />
                        </div>
                    </div>

                    <h2 className="text-lg flex items-center my-2">
                        <ClockIcon className="w-6 me-1"/>Time
                        <div className="grow"></div>
                        {!!currentCountryData && !!currentCountryData.scheduleLink && (
                            <>
                                <a
                                    href={currentCountryData.scheduleLink}
                                    target="_blank"
                                    className={clsx('flex ms-1 px-2 rounded-md text-sm bg-sky-500 text-background')}
                                >
                                    <ArrowTopRightOnSquareIcon className="w-5 me-1"/>
                                    <span className="block py-1.5">Schedule</span>
                                </a>
                                {currentCountryData.scheduleDeviceTime == 1 && (
                                    <div
                                        className="flex items-center ms-1 px-1 py-0.5 rounded-md border-1 border-foreground">
                                        <ExclamationTriangleIcon className="w-4 me-0.5"/>
                                        <span className="block text-xs">CET</span>
                                    </div>
                                )}
                            </>
                        )}
                    </h2>

                    <div className="py-3 md:px-3">
                        <div className="flex items-center">
                            <PlayIcon className="w-5 me-2"/>
                            <EventTextInput
                                name="dateTimeCet"
                                placeholder="yyyy-MM-ddTHH:mm:SS"
                                value={event.dateTimeCet}
                                callback={onEventDataChange}
                                disabled={!!event.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <ArrowRightIcon className="w-5 me-2"/>
                            <EventTextInput
                                name="endDateTimeCet"
                                placeholder="End (yyyy-MM-ddTHH:mm:SS)"
                                value={event.endDateTimeCet}
                                callback={onEventDataChange}
                                disabled={!!event.deleted}
                            />
                        </div>
                    </div>

                </div>

                <div className={clsx('w-full lg:w-[50%] p-2',
                    {
                        'line-through text-foreground/50': event.deleted
                    }
                )}>
                    <h2 className="text-lg flex items-center">
                        <TvIcon className="w-6 me-1"/>Watch links ({event.watchLinks.length})
                    </h2>

                    <div className="pt-3 md:px-3 flex flex-col space-y-3">
                        <WatchLinkList
                            key={`${event.watchLinks.length}-${event.watchLinks.map(l => l.link.substring(l.link.length - 5)).join('-')}`}
                            watchLinksParam={event.watchLinks}
                            editable={!event.deleted}
                            onWatchLinkChanged={onWatchLinkChanged}
                            onWatchLinksReordered={onWatchLinksReordered}
                        />
                        {!displayNewLinkForm && <button
                            disabled={!!event.deleted}
                            onClick={() => {
                                createLink();
                            }}
                            className={
                                clsx('h-[60px] rounded-lg border-2 border-dashed flex items-center justify-center text-center',
                                    {
                                        'border-foreground/20 text-foreground/50 cursor-not-allowed': event.deleted,
                                        'border-foreground/30 cursor-pointer': !event.deleted,
                                    }
                                )}
                        >
                            <PlusCircleIcon className="w-8 me-2"/>
                            <p className="">Add link</p>
                        </button>}
                        {displayNewLinkForm && <WatchLinkCard
                            id={-1}
                            watchLinkParam={newWatchLink}
                            changeCallback={onUpdateNewWatchLink}
                            editable={true}
                            isNew={true}
                            saveNew={onSaveNewWatchLink}
                            discardNew={onDiscardNewWatchLink}
                        />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function EventTextInput({
                            name, value, placeholder, disabled, callback
                        }: {
    name: string,
    value
        :
        string,
    placeholder
        :
        string,
    disabled
        :
        boolean,
    callback
        :
        (e: ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <input className="p-1 grow bg-foreground/10 rounded-lg"
               type="text"
               disabled={disabled}
               name={name}
               value={value}
               placeholder={placeholder}
               onChange={callback}
        />
    )
}