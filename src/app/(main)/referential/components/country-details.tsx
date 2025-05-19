'use client';

import Link from 'next/link';
import {
    ArrowLeftIcon,
    ArrowTopRightOnSquareIcon,
    ArrowUturnLeftIcon, CalendarDaysIcon,
    ClockIcon,
    GlobeEuropeAfricaIcon,
    HashtagIcon,
    ListBulletIcon,
    MapIcon,
    PlusCircleIcon,
    SwatchIcon,
    TagIcon,
    TrashIcon,
    TrophyIcon,
    TvIcon
} from '@heroicons/react/24/outline';
import { createSwapy } from 'swapy';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { Country } from '@/app/types/country';
import { WatchLink } from '@/app/types/watch-link';
import WatchLinkCard from '@/app/components/watch-link-card';

type CountryDataKey = ('country' | 'countryCode' | 'eventName' | 'altEventNames' | 'stages' | 'defaultChannel' | 'scheduleLink' | 'scheduleDeviceTime');

function addLink(countryData: Country, callback: (c: Country) => void) {
    const newCountryData = {
        ...countryData,
    };
    newCountryData.watchLinks.push({
        link: '',
        comment: '',
        channel: '',
        live: 0,
        replayable: 0,
        castable: 0,
        geoblocked: 0,
        accountRequired: 0
    });
    callback(newCountryData);
}

export default function CountryDetails({countryDataParam, onSave, onDelete}: {
    countryDataParam: Country,
    onSave: (countryData: Country) => Promise<never>,
    onDelete?: ((countryData: Country) => Promise<never>)
}) {
    const swapy = useRef(null)
    const watchLinks = useRef(null)
    const [countryData, setCountryData] = useState(countryDataParam);

    const saveCountryData = async () => {
        await onSave(countryData);
    }

    const toggleDelete = async () => {
        !!onDelete && await onDelete(countryData);
    }

    /**
     * To be triggered upon any modification of the countryData (field, new watch link, etc.) for the changes to be reflected
     * in the app
     * @param countryData the modified countryData
     */
    const onCountryDataModified = (countryData: Country) => {
        countryData.modified = true;
        setCountryData(countryData);
        swapy.current.update();
    }

    const createLink = addLink.bind(null, countryData, onCountryDataModified);

    /**
     * To be triggered upon modification of an input field of the countryData (country name, event name, stages, etc.)
     * @param e the HTML input element describing the update of the input field
     */
    const onCountryDataChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newCountryData: Country = {
            ...countryData,
        };
        if (e.target.name == 'altEventNames' || e.target.name == 'stages') {
            newCountryData[e.target.name] = e.target.value.split(',');
        } else if (e.target.name == 'scheduleDeviceTime') {
            newCountryData.scheduleDeviceTime = e.target.checked ? 1 : 0;
        } else {
            newCountryData[e.target.name as CountryDataKey] = e.target.value;
        }
        onCountryDataModified(newCountryData);
    }

    const onWatchLinkChanged = (index: number, watchLink: WatchLink) => {
        const newCountryData = {
            ...countryData,
        };
        if (watchLink === null) {
            newCountryData.watchLinks.splice(index, 1);
        } else {
            newCountryData.watchLinks[index] = watchLink;
        }
        onCountryDataModified(newCountryData);
    };

    const onWatchLinksReordered = (from: number, to: number) => {
        const newCountryData: Country = {
            ...countryData,
        };
        [newCountryData.watchLinks[from], newCountryData.watchLinks[to]] = [newCountryData.watchLinks[to], newCountryData.watchLinks[from]];
        newCountryData.modified = true;
        setCountryData(newCountryData);
    };

    const isLikelyDate = (date: string): boolean => {
        return countryData.likelyDates.includes(date);
    }

    const toggleLikelyDate = (date: string): void => {
        const newCountryData: Country = {
            ...countryData,
        };
        isLikelyDate(date)
            ? newCountryData.likelyDates.splice(newCountryData.likelyDates.indexOf(date), 1)
            : newCountryData.likelyDates.push(date);
        setCountryData(newCountryData);
    }

    useEffect(() => {
        if (watchLinks.current) {
            swapy.current = createSwapy(watchLinks.current, {
                dragAxis: 'y',
                enabled: !countryData.deleted
            });

            // Your event listeners
            swapy.current.onSwap((countryData: { fromSlot: string, toSlot: string }) => {
                onWatchLinksReordered(Number(countryData.fromSlot), Number(countryData.toSlot));
            });
        }

        return () => {
            // Destroy the swapy instance on component destroy
            swapy.current?.destroy()
        }
    }, []);

    return (
        <div className="bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900">
            <div className="flex px-1 flex-row justify-between space-x-2">
                <Link
                    href={`/referential`}
                    className="flex flex-row items-center"
                >
                    <ArrowLeftIcon className="w-6"/>
                    <span className="hidden md:block md:ml-1">Back</span>
                </Link>
                <div className="hidden w-auto grow"></div>
                <div className="flex">
                    <form action={async () => await toggleDelete()}>
                        <button type="submit" className={clsx('px-2 pe-4', {
                            'hidden': !onDelete
                        })}>
                            {!countryData.deleted ? (<TrashIcon className="w-6"/>) : (
                                <ArrowUturnLeftIcon className="w-6"/>)}
                        </button>
                    </form>
                    <form action={async () => await saveCountryData()}>
                        <button
                            disabled={countryData.deleted}
                            className={clsx('px-2 rounded-md',
                                {
                                    'bg-none border-1 border-foreground/50 text-foreground/50 cursor-not-allowed': countryData.deleted,
                                    'bg-sky-500 text-background': !countryData.deleted
                                }
                            )}
                        >
                            Save
                        </button>
                    </form>
                </div>
            </div>

            <div className={clsx('w-full mt-4',
                {
                    'text-foreground/50': countryData.deleted
                }
            )}>
                <div className="flex flex-col-reverse md:flex-row justify-center items-center font-bold">
                    <h1 className={clsx('text-2xl text-center', {'line-through': countryData.deleted})}>
                        {!!countryData.country ? countryData.country : 'New country'}
                    </h1>
                    <span className="block md:inline-block">
                        {(countryData.deleted || countryData.modified) && (
                            <div
                                className={clsx('rounded-md ms-2 px-1 py-1 text-xs uppercase text-white dark:text-black',
                                    {
                                        'bg-red-700 dark:bg-red-300': countryData.deleted,
                                        'bg-foreground/50': countryData.modified
                                    }
                                )}
                            >
                                {countryData.deleted ? 'Deleted' : 'Unsaved changes'}
                            </div>
                        )}
                    </span>
                </div>
                <h3 className={clsx('text-xl text-center text-foreground/50',
                    {
                        'line-through': countryData.deleted
                    }
                )}>{countryData.eventName}</h3>
            </div>

            <div className="block lg:flex lg:mt-4">
                <div className={clsx('w-full lg:w-[50%] p-2',
                    {
                        'line-through text-foreground/50': countryData.deleted
                    }
                )}>
                    <h2 className="text-lg flex items-center mb-2">
                        <ListBulletIcon className="w-6 me-1"/>Details
                    </h2>

                    <div className="py-3 md:px-3">
                        <div className="flex items-center">
                            <GlobeEuropeAfricaIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="country"
                                placeholder="Country name"
                                value={countryData.country}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <HashtagIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="countryCode"
                                placeholder="ISO 3166-1 code (e.g. SE)"
                                value={countryData.countryCode}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <TagIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="eventName"
                                placeholder="Event name (e.g. Melodifestivalen)"
                                value={countryData.eventName}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <SwatchIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="altEventNames"
                                placeholder="Event alt name(s) (e.g. Mello,Melfest)"
                                value={countryData.altEventNames.join(',')}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <TrophyIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="stages"
                                placeholder="Stages (e.g. Heat...,Final)"
                                value={countryData.stages.join(',')}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <TvIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="defaultChannel"
                                placeholder="Default channel (e.g. SVT1)"
                                value={countryData.defaultChannel || ''}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>

                        <div className="flex items-center mt-2">
                            <MapIcon className="w-5 me-2"/>
                            <CountryTextInput
                                name="scheduleLink"
                                placeholder="URL to broadcaster's schedule"
                                value={countryData.scheduleLink || ''}
                                callback={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                            {!!countryData.scheduleLink && (<a
                                href={countryData.scheduleLink}
                                target="_blank"
                                className={clsx('flex px-2 py-1.5 ms-1 rounded-md text-sm',
                                    {
                                        'bg-none border-1 border-foreground/50 text-foreground/50': countryData.deleted,
                                        'bg-sky-500 text-background': !countryData.deleted
                                    }
                                )}
                            >
                                <ArrowTopRightOnSquareIcon className="w-5 me-1"/>
                                <span className="block">Open</span>
                            </a>)}
                        </div>

                        <div className="flex items-center mt-2">
                            <ClockIcon className="w-5 me-2 shrink-0"/>
                            <label className="flex items-center" htmlFor="scheduleDeviceTime">Schedule displayed in
                                device time?</label>
                            <div className="grow"></div>
                            <input
                                type="checkbox"
                                className="relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 bg-foreground/10 after:content-['']
                                        checked:after:absolute
                                        after:bg-sky-500 after:top-1 after:start-1 after:rounded-md after:h-4
                                        after:w-4"
                                id="scheduleDeviceTime"
                                name="scheduleDeviceTime"
                                checked={countryData.scheduleDeviceTime == 1}
                                onChange={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>
                    </div>

                    <h2 className="text-lg flex items-center my-2">
                        <CalendarDaysIcon className="w-6 me-1"/>Likely dates
                    </h2>

                    <div className="flex flex-col gap-2 py-3 md:px-3">
                        {/*<div className="grid grid-flow-col grid-cols-4 grid-rows-3 gap-x-2 gap-y-1">*/}
                        <div className="grid grid-flow-col grid-cols-4 grid-rows-[30px_minmax(0,_1fr)_minmax(0,_1fr)] gap-x-3 gap-y-2">
                            {
                                [
                                    {month: 'September', id: '09'},
                                    {month: 'October', id: '10'}
                                ].map(({month, id}) => (
                                    <>
                                        <div>{month}</div>

                                        <CountryCalendarWindow
                                            id={`${id}A`}
                                            selected={isLikelyDate(`${id}A`)}
                                            onToggle={toggleLikelyDate.bind(null, `${id}A`)}
                                        />

                                        <CountryCalendarWindow
                                            id={`${id}B`}
                                            selected={isLikelyDate(`${id}B`)}
                                            onToggle={toggleLikelyDate.bind(null, `${id}B`)}
                                        />
                                    </>
                                ))}

                            {/*<div>September</div>*/}

                            {/*<CountryCalendarWindow*/}
                            {/*    id="09A"*/}
                            {/*    selected={isLikelyDate("09A")}*/}
                            {/*    onToggle={toggleLikelyDate.bind(null, "09A")}*/}
                            {/*/>*/}

                            {/*<CountryCalendarWindow*/}
                            {/*    id="09B"*/}
                            {/*    selected={countryData.likelyDates.includes("09B")}*/}
                            {/*    onToggle={toggleLikelyDate.bind(null, "09B")}*/}
                            {/*/>*/}

                            {/*<div>October</div>*/}

                            {/*<CountryCalendarWindow*/}
                            {/*    id="10A"*/}
                            {/*    selected={countryData.likelyDates.includes("10A")}*/}
                            {/*    onToggle={toggleLikelyDate.bind(null, "10A")}*/}
                            {/*/>*/}

                            {/*<CountryCalendarWindow*/}
                            {/*    id="10B"*/}
                            {/*    selected={countryData.likelyDates.includes("10B")}*/}
                            {/*    onToggle={toggleLikelyDate.bind(null, "10B")}*/}
                            {/*/>*/}

                        </div>
                    </div>
                </div>

                <div className={clsx('w-full lg:w-[50%] p-2',
                    {
                        'line-through text-foreground/50': countryData.deleted
                    }
                )}>
                    <h2 className="text-lg flex items-center">
                        <TvIcon className="w-6 me-1"/>Watch links ({countryData.watchLinks.length})
                    </h2>

                    <div className="pt-3 md:px-3 flex flex-col space-y-3">
                        <div ref={watchLinks} id="watch-links" className="space-y-3">
                            {countryData.watchLinks.map((watchLink: WatchLink, index: number) => (
                                <WatchLinkCard
                                    id={index}
                                    watchLinkParam={watchLink}
                                    changeCallback={onWatchLinkChanged}
                                    editable={!countryData.deleted}
                                />
                            ))}
                        </div>
                        <button
                            disabled={!!countryData.deleted}
                            onClick={() => {
                                createLink();
                            }}
                            className={
                                clsx('h-[60px] rounded-lg border-2 border-dashed flex items-center justify-center text-center',
                                    {
                                        'border-foreground/20 text-foreground/50 cursor-not-allowed': countryData.deleted,
                                        'border-foreground/30 cursor-pointer': !countryData.deleted,
                                    }
                                )}
                        >
                            <PlusCircleIcon className="w-8 me-2"/>
                            <p className="">Add link</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CountryTextInput({name, value, placeholder, disabled, callback}: {
    name: CountryDataKey,
    value: string,
    placeholder: string,
    disabled: boolean,
    callback: (e: ChangeEvent<HTMLInputElement>) => void
}) {
    return (
        <input className="p-1 grow bg-foreground/10 rounded-lg"
               size={1}
               type="text"
               disabled={disabled}
               name={name}
               value={value}
               placeholder={placeholder}
               onChange={callback}
        />
    );
}

function CountryCalendarWindow({id, selected, onToggle}: { id: string, selected: boolean, onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={clsx('rounded-lg h-12',
                {
                    'bg-foreground/10': !selected,
                    'bg-sky-500': selected
                }
            )}>

        </button>
    );
}