'use client';

import Link from 'next/link';
import {
    ArrowLeftIcon, ArrowPathRoundedSquareIcon,
    ArrowTopRightOnSquareIcon,
    ArrowUpOnSquareIcon,
    ArrowUturnLeftIcon,
    CalendarDaysIcon, ChevronDownIcon, ChevronUpIcon,
    ClockIcon,
    GlobeEuropeAfricaIcon,
    HashtagIcon,
    ListBulletIcon,
    MapIcon,
    PlusCircleIcon,
    SignalIcon,
    SwatchIcon,
    TagIcon,
    TrashIcon,
    TrophyIcon,
    TvIcon
} from '@heroicons/react/24/outline';
import { ChangeEvent, useState } from 'react';
import { clsx } from 'clsx';
import { Country } from '@/app/types/country';
import { WatchLink } from '@/app/types/watch-link';
import WatchLinkCard from '@/app/components/watch-links/watch-link-card';
import WatchLinkList, { SwappedHistory } from '@/app/components/watch-links/watch-link-list';

type CountryDataKey = ('country' | 'countryCode' | 'eventName' | 'altEventNames' | 'stages' | 'defaultChannel' | 'scheduleLink' | 'scheduleDeviceTime');

export default function CountryDetails({countryDataParam, onSave, onDelete}: {
    countryDataParam: Country,
    onSave: (countryData: Country) => Promise<never>,
    onDelete?: ((countryData: Country) => Promise<never>)
}) {
    const [countryData, setCountryData] = useState(countryDataParam);
    const [hasRepeatedStage, setHasRepeatedStage] = useState(countryDataParam.stages.some(s => s.endsWith('...')));

    const [displayNewLinkForm, setDisplayNewLinkForm] = useState(false);
    const [newWatchLink, setNewWatchLink] = useState({
        link: '',
        comment: '',
        channel: countryDataParam.defaultChannel || '',
        live: 0,
        replayable: 0,
        castable: 0,
        geoblocked: 0,
        accountRequired: 0
    } as WatchLink);

    const saveCountryData = async () => {
        await onSave(countryData);
    }

    const toggleDelete = async () => {
        if (!!onDelete) {
            await onDelete(countryData);
        }
    }

    /**
     * To be triggered upon any modification of the countryData (field, new watch link, etc.) for the changes to be reflected
     * in the app
     * @param countryData the modified countryData
     */
    const onCountryDataModified = (countryData: Country) => {
        countryData.modified = true;
        setCountryData(countryData);
    }

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
            // @ts-ignore: TS2322
            newCountryData[e.target.name as CountryDataKey] = e.target.value;
        }
        onCountryDataModified(newCountryData);
    }

    const onStageNameUpdate = (index: number, value: string) => {
        const newCountryData: Country = {
            ...countryData,
        };
        newCountryData.stages[index] = value;
        onCountryDataModified(newCountryData);
    }

    const addStage = () => {
        const newCountryData: Country = {
            ...countryData,
        };
        newCountryData.stages.push('');
        onCountryDataModified(newCountryData);
    }

    const removeStage = (index: number) => {
        if (countryData.stages[index].endsWith('...')) {
            setHasRepeatedStage(false);
        }
        const newCountryData: Country = {
            ...countryData,
        };
        newCountryData.stages.splice(index, 1);
        onCountryDataModified(newCountryData);
    }

    const toggleRepeatedStage = (index: number) => {
        const stage = countryData.stages[index];
        if (hasRepeatedStage && !stage.endsWith('...')) {
            return;
        }
        const newCountryData: Country = {
            ...countryData,
        };
        if(stage.endsWith('...')) {
            newCountryData.stages[index] = stage.replace('...', '');
        } else {
            newCountryData.stages[index] = stage + '...';
        }
        setHasRepeatedStage(newCountryData.stages[index].endsWith('...'));
        onCountryDataModified(newCountryData);
    }

    const moveStageUp = (index: number) => {
        const newCountryData: Country = {
            ...countryData,
        };
        [newCountryData.stages[index], newCountryData.stages[index-1]] = [newCountryData.stages[index-1], newCountryData.stages[index]];
        onCountryDataModified(newCountryData);
    }

    const moveStageDown = (index: number) => {
        const newCountryData: Country = {
            ...countryData,
        };
        [newCountryData.stages[index], newCountryData.stages[index+1]] = [newCountryData.stages[index+1], newCountryData.stages[index]];
        onCountryDataModified(newCountryData);
    }

    const onWatchLinkChanged = (index: number, watchLink: WatchLink, deleted?: boolean) => {
        const newCountryData = {
            ...countryData,
        };
        if (!!deleted) {
            newCountryData.watchLinks.splice(index, 1);
        } else {
            newCountryData.watchLinks[index] = watchLink;
        }
        onCountryDataModified(newCountryData);
    };

    const onWatchLinksReordered = (swappedHistory: SwappedHistory) => {
        const newCountryData: Country = {
            ...countryData,
        };
        swappedHistory.forEach(({from, to}: { from: number, to: number }) => {
            [newCountryData.watchLinks[from], newCountryData.watchLinks[to]] = [newCountryData.watchLinks[to], newCountryData.watchLinks[from]];
        });
        newCountryData.modified = true;
        setCountryData(newCountryData);
    };

    const createLink = () => {
        setDisplayNewLinkForm(true);
    };

    const onUpdateNewWatchLink = (index: number, watchLink: WatchLink) => {
        setNewWatchLink({...watchLink});
    };

    const onSaveNewWatchLink = () => {
        const newCountryData: Country = {
            ...countryData,
            watchLinks: [...countryData.watchLinks, {...newWatchLink}]
        };
        onCountryDataModified(newCountryData);
        setNewWatchLink({
            link: '',
            comment: '',
            channel: countryData.defaultChannel || '',
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
            channel: countryData.defaultChannel || '',
            live: 0,
            replayable: 0,
            castable: 0,
            geoblocked: 0,
            accountRequired: 0
        });
        setDisplayNewLinkForm(false);
    }

    const isLikelyDate = (date: string): boolean => {
        return countryData.likelyDates.includes(date);
    }

    const toggleLikelyDate = (date: string): void => {
        const newCountryData: Country = {
            ...countryData,
        };
        if (isLikelyDate(date)) {
            newCountryData.likelyDates.splice(newCountryData.likelyDates.indexOf(date), 1)
        } else {
            newCountryData.likelyDates.push(date);
        }
        onCountryDataModified(newCountryData);
    }

    return (
        <div className="bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900 md:overflow-y-auto">
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
                        <button type="submit" className={clsx('px-2 me-2', {
                            'hidden': !onDelete
                        })}>
                            {!countryData.deleted
                                ? (<div className="flex items-center py-1"><TrashIcon className="w-6"/></div>)
                                : (<div className="flex items-center py-1"><ArrowUturnLeftIcon className="w-6"/></div>)
                            }
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
                    </div>

                    <h2 className="text-lg flex items-center my-2">
                        <CalendarDaysIcon className="w-6 me-1"/>Likely dates
                    </h2>

                    <div className="flex flex-col gap-2 py-3 md:px-3">
                        {
                            [
                                [
                                    {month: 'September', monthShort: 'Sep', id: '09'},
                                    {month: 'October', monthShort: 'Oct', id: '10'},
                                    {month: 'November', monthShort: 'Nov', id: '11'},
                                    {month: 'December', monthShort: 'Dec', id: '12'}
                                ],
                                [
                                    {month: 'January', monthShort: 'Jan', id: '01'},
                                    {month: 'February', monthShort: 'Feb', id: '02'},
                                    {month: 'March', monthShort: 'Mar', id: '03'}
                                ]
                            ].map(
                                (monthList, index) => {
                                    return (
                                        <div
                                            key={`months-${index}`}
                                            className="grid grid-flow-col grid-cols-4 grid-rows-[30px_minmax(0,_1fr)_minmax(0,_1fr)] gap-2 md:gap-x-3 md:gap-y-2">
                                            {monthList.map(({month, monthShort, id}) => (
                                                <>
                                                    <div className="hidden md:block">{month}</div>
                                                    <div className="block md:hidden">{monthShort}</div>

                                                    <CountryCalendarWindow
                                                        id={`${id}A`}
                                                        selected={isLikelyDate(`${id}A`)}
                                                        onToggle={toggleLikelyDate.bind(null, `${id}A`)}
                                                        disabled={countryData.deleted || false}
                                                    />

                                                    {month != 'March' && (<CountryCalendarWindow
                                                        id={`${id}B`}
                                                        selected={isLikelyDate(`${id}B`)}
                                                        onToggle={toggleLikelyDate.bind(null, `${id}B`)}
                                                        disabled={countryData.deleted || false}
                                                    />)}
                                                </>
                                            ))}
                                        </div>
                                    )
                                }
                            )
                        }
                    </div>
                </div>

                <div className={clsx('w-full lg:w-[50%] p-2',
                    {
                        'line-through text-foreground/50': countryData.deleted
                    }
                )}>
                    {/*<h2 className="text-lg flex items-center mb-2">*/}
                    {/*    <TrophyIcon className="w-6 me-1"/>Stages*/}
                    {/*</h2>*/}

                    {/*<div className="py-3 md:px-3 flex flex-col">*/}
                    {/*    <div className="flex items-center">*/}
                    {/*        <TrophyIcon className="w-5 me-2"/>*/}
                    {/*        <CountryTextInput*/}
                    {/*            name="stages"*/}
                    {/*            placeholder="Stages (e.g. Heat...,Final)"*/}
                    {/*            value={countryData.stages.join(',')}*/}
                    {/*            callback={onCountryDataChange}*/}
                    {/*            disabled={!!countryData.deleted}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <h2 className="text-lg flex items-center mb-2">
                        <TrophyIcon className="w-6 me-1"/>Stages
                    </h2>

                    <div className="py-3 px-2 md:px-3 flex flex-col">
                        {countryData.stages.map((stage, index) =>
                            <>
                                <div className={clsx('flex items-center',
                                    {
                                        'mb-1': index == 0,
                                        'my-0.5': index > 0
                                    })}>
                                    <button
                                        className={clsx('me-0.5 p-1',
                                            {
                                                'text-foreground/50 cursor-not-allowed': countryData.deleted  || countryData.stages.length == 1,
                                                'cursor-pointer': !countryData.deleted && countryData.stages.length > 1
                                            })
                                        }
                                        disabled={countryData.deleted || countryData.stages.length == 1}
                                        onClick={() => removeStage(index)}
                                    >
                                        <div className="flex items-center"><TrashIcon className="w-4"/></div>
                                    </button>
                                    {index == 0 ? <>
                                        <div
                                            className="flex items-center justify-center me-1 w-6 h-6 rounded-xl border-1 border-foreground/50">
                                            <div className="w-3.5 h-3.5 rounded-xl bg-foreground/50"></div>
                                        </div>
                                        <input className="p-1 grow bg-foreground/10 rounded-lg"
                                               size={1}
                                               type="text"
                                               disabled={!!countryData.deleted}
                                               value={countryData.stages[index].replace('...', '')}
                                               placeholder="Stage name (e.g. Heat)"
                                               onChange={(e) => onStageNameUpdate(index, e.target.value)}
                                        />
                                    </> : <>
                                        <div className="flex items-center justify-center me-1 w-6 h-6 rounded-xl">
                                            <div className="w-4 h-4 rounded-xl bg-foreground/50"></div>
                                        </div>
                                        <input className="p-1 grow bg-foreground/10 rounded-lg"
                                               size={1}
                                               type="text"
                                               disabled={!!countryData.deleted}
                                               value={countryData.stages[index].replace('...', '')}
                                               placeholder="Stage name (e.g. Heat)"
                                               onChange={(e) => onStageNameUpdate(index, e.target.value)}
                                        />
                                    </>}
                                    <button
                                        className={clsx('ms-1 px-1 rounded-xl', {
                                            'border-1 bg-foreground/10 border-foreground/10': stage.endsWith('...') && countryData.deleted,
                                            'text-foreground/50 cursor-not-allowed': (hasRepeatedStage && !stage.endsWith('...')) || countryData.deleted,
                                            'border-1 bg-sky-500 border-sky-500 text-background': stage.endsWith('...') && !countryData.deleted,
                                            'border-1 border-foreground/30': !stage.endsWith('...'),
                                            'text-foreground': !stage.endsWith('...') && !countryData.deleted,
                                            'cursor-pointer': !countryData.deleted && !hasRepeatedStage
                                        })}
                                        disabled={(hasRepeatedStage && !stage.endsWith('...')) || countryData.deleted}
                                        onClick={() => toggleRepeatedStage(index)}
                                    >
                                        <div className="flex items-center py-1"><ArrowPathRoundedSquareIcon
                                            className="w-5"/></div>
                                    </button>
                                    <button
                                        className="ms-1 px-1"
                                        disabled={index == 0 || countryData.deleted}
                                        onClick={() => moveStageUp(index)}
                                    >
                                        <div className="flex items-center py-1">
                                            <ChevronUpIcon className={clsx('w-5',
                                                {
                                                    'text-foreground/50 cursor-not-allowed': index == 0 || countryData.deleted,
                                                    'cursor-pointer': index > 0 && !countryData.deleted
                                                })}/>
                                        </div>
                                    </button>
                                    <button
                                        className="ms-1 px-1"
                                        disabled={index == countryData.stages.length - 1 || countryData.deleted}
                                        onClick={() => moveStageDown(index)}
                                    >
                                        <div className="flex items-center py-1">
                                            <ChevronDownIcon className={clsx('w-5',
                                                {
                                                    'text-foreground/50 cursor-not-allowed': index == countryData.stages.length - 1 || countryData.deleted,
                                                    'cursor-pointer': index < countryData.stages.length - 1 && !countryData.deleted
                                                })}/>
                                        </div>
                                    </button>
                                </div>
                                <div>
                                    <div className="h-5 ml-10 border-l-1 w-0 border-foreground/50"></div>
                                </div>
                            </>
                        )}
                        <button
                            className={clsx('ml-7 mt-1 w-fit',
                                {
                                    'text-foreground/50 cursor-not-allowed': countryData.deleted,
                                    'cursor-pointer': !countryData.deleted
                                }
                            )}
                            disabled={countryData.deleted}
                            onClick={() => addStage()}
                        >
                            <div className="flex items-center">
                                <div className="flex items-center justify-center me-1 w-6 h-6 rounded-xl">
                                    <PlusCircleIcon className="w-5"/>
                                </div>
                                <span className="block">Add</span>
                            </div>
                        </button>
                    </div>

                    <h2 className="text-lg flex items-center my-2">
                        <SignalIcon className="w-6 me-1"/>Broadcast
                    </h2>

                    <div className="py-3 md:px-3 flex flex-col">
                        <div className="flex items-center">
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
                                className={clsx('relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 bg-foreground/10 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2.5 after:h-4 after:ms-1.5 after:rotate-[40deg] after:border-b-4 after:border-r-4',
                                    {
                                        'checked:bg-sky-500 after:border-white dark:after:border-black': !countryData.deleted,
                                        'checked:border-foreground/30 after:border-foreground/50': countryData.deleted
                                    }
                                )}
                                id="scheduleDeviceTime"
                                name="scheduleDeviceTime"
                                checked={countryData.scheduleDeviceTime == 1}
                                onChange={onCountryDataChange}
                                disabled={!!countryData.deleted}
                            />
                        </div>
                    </div>

                    <h2 className="text-lg flex items-center my-2">
                        <TvIcon className="w-6 me-1"/>Watch links ({countryData.watchLinks.length})
                    </h2>

                    <div className="py-3 md:px-3 flex flex-col space-y-3">
                        <WatchLinkList
                            key={`${countryData.watchLinks.length}-${countryData.watchLinks.map(l => l.link.substring(l.link.length - 5)).join('-')}`}
                            watchLinksParam={countryData.watchLinks}
                            editable={!countryData.deleted}
                            onWatchLinkChanged={onWatchLinkChanged}
                            onWatchLinksReordered={onWatchLinksReordered}
                        />
                        {!displayNewLinkForm && <button
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

function CountryCalendarWindow({id, selected, onToggle, disabled}: {
    id: string,
    selected: boolean,
    onToggle: () => void,
    disabled: boolean
}) {
    return (
        <button
            id={id}
            disabled={disabled}
            onClick={onToggle}
            className={clsx('rounded-lg h-12',
                {
                    'bg-foreground/10': !selected,
                    'bg-sky-500': selected && !disabled,
                    'bg-foreground/30': selected && disabled
                }
            )}>

        </button>
    );
}