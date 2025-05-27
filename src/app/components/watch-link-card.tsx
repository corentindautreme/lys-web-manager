import {
    ArrowTopRightOnSquareIcon,
    BackwardIcon,
    ChatBubbleBottomCenterIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    NoSymbolIcon,
    RssIcon,
    SignalIcon,
    StarIcon,
    TrashIcon,
    TvIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { ChangeEvent, JSX, useState } from 'react';
import { WatchLink } from '@/app/types/watch-link';

type FeatureKey = ('live' | 'replayable' | 'castable' | 'geoblocked' | 'accountRequired');
type WatchLinkKey = ('link' | 'comment' | 'channel');

function extractShortLink(url: string): string {
    if (url == '') {
        return 'New link'
    }
    const match = /(?:https*:\/\/)?(?:www.)?([a-zA-Z0-9-.]+(?:\/[a-zA-Z0-9-.]+)?)/.exec(url);
    return match ? match[1] : url;
}

function toggleFeature(watchLink: WatchLink, featureKey: FeatureKey, callback: (w: WatchLink) => void): WatchLink {
    const newWatchLink = {
        ...watchLink,
        [featureKey]: watchLink[featureKey] == 0 ? 1 : 0
    };
    callback(newWatchLink);
    return newWatchLink;
}

export default function WatchLinkCard({id, watchLinkParam, changeCallback, editable}: {
    id: number,
    watchLinkParam: WatchLink,
    changeCallback: (index: number, watchLink: WatchLink, deleted?: boolean) => void,
    editable: boolean
}) {
    const [unfolded, unfold] = useState(watchLinkParam.link == '');
    const [watchLink, setWatchLink] = useState(watchLinkParam);

    const onWatchLinkSet = () => {
        setWatchLink(watchLink);
        changeCallback(id, watchLink);
    }

    const onWatchLinkDataChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        watchLink[e.target.name as WatchLinkKey] = e.target.value;
        onWatchLinkSet();
    }

    const onFeatureToggle = (name: FeatureKey) => {
        const newWatchLink = toggleFeature(watchLink, name, setWatchLink);
        changeCallback(id, newWatchLink);
    }

    const toggleRecommendedLinkComment = () => {
        watchLink.comment = watchLink.comment == 'Recommended link' ? '' : 'Recommended link';
        onWatchLinkSet();
    }

    const deleteWatchLink = changeCallback.bind(null, id, watchLink, true);

    return (
        <div data-swapy-slot={id}>
            <div
                className={clsx('gap-2 p-3 rounded-lg bg-background dark:bg-neutral-900 border-1 border-foreground/20 data-swapy-highlighted:bg-foreground')}
                data-swapy-item={id}
            >
                <div className={clsx('flex flex-row items-center',
                    {
                        'text-foreground/50': !editable
                    }
                )}>
                    <div data-swapy-handle
                         className={clsx('shrink-0 min-w-[24px] h-[36px] bg-[radial-gradient(var(--color-neutral-600)_3px,transparent_1px)] [background-size:12px_12px]',
                             {
                                 'cursor-not-allowed': !editable,
                                 'cursor-pointer': editable
                             }
                         )}
                    ></div>
                    <button className="flex flex-[50%] ml-2 overflow-hidden text-sm font-bold"
                            onClick={() => unfold(!unfolded)}>
                        <div className="text-nowrap overflow-hidden overflow-ellipsis">
                            {extractShortLink(watchLink.link)}
                        </div>
                        {unfolded
                            ? (<ChevronUpIcon className="ml-1.5 w-5"/>)
                            : (<ChevronDownIcon className="ml-1.5 w-5"/>)
                        }
                    </button>
                    <div className="flex flex-[20%] justify-end">
                        {!unfolded && (
                            <>
                                {watchLink.comment == 'Recommended link' &&
                                    <div className={clsx('p-0.5 rounded-xl text-background',
                                        {
                                            'bg-sky-500': editable,
                                            'bg-foreground/30': !editable
                                        }
                                    )}><StarIcon className="w-4"/></div>
                                }
                                {watchLink.live == 1 && <SignalIcon className="ml-1 w-5"/>}
                                {watchLink.replayable == 1 && <BackwardIcon className="ml-1 w-5"/>}
                                {watchLink.geoblocked == 1 && <NoSymbolIcon className="ml-1 w-5"/>}
                                {watchLink.accountRequired == 1 && <UserCircleIcon className="ml-1 w-5"/>}
                            </>
                        )}
                        {unfolded && (
                            <>
                                <div className="grow"></div>
                                <button
                                    className={clsx({
                                        'cursor-not-allowed': !editable,
                                        'cursor-pointer': editable
                                    })}
                                    disabled={!editable}
                                    onClick={deleteWatchLink}
                                >
                                    <TrashIcon className="w-5"/>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Watch link content */}
                <div className={clsx('flex-none', {
                    'block': unfolded,
                    'hidden': !unfolded
                })}>
                    <div className="flex items-center mt-3">
                        <a href={watchLink.link} target="_blank">
                            <ArrowTopRightOnSquareIcon className="w-5 me-2"/>
                        </a>
                        <WatchLinkCardInput
                            type={'textarea'}
                            name={'link'}
                            value={watchLink.link}
                            disabled={!editable}
                            callback={onWatchLinkDataChange}
                        />
                    </div>

                    <div className="flex items-center mt-1">
                        <ChatBubbleBottomCenterIcon className="w-5 me-2 shrink-0"/>
                        <WatchLinkCardInput
                            type={'text'}
                            name={'comment'}
                            value={watchLink.comment || ''}
                            disabled={!editable}
                            callback={onWatchLinkDataChange}
                        />
                        <button
                            onClick={toggleRecommendedLinkComment}
                            disabled={!editable}
                            className={clsx('flex items-center px-3 py-1 ms-1 rounded-2xl',
                                {
                                    'border-1 bg-foreground/10 border-foreground/10': watchLink.comment == 'Recommended link' && !editable,
                                    'cursor-not-allowed': !editable,
                                    'border-1 bg-sky-500 border-sky-500 text-background': watchLink.comment == 'Recommended link' && editable,
                                    'border-1 border-foreground/30': watchLink.comment != 'Recommended link',
                                    'cursor-pointer': editable
                                })}
                        >
                            <StarIcon className="w-5 shrink-0"/>
                        </button>
                    </div>

                    <div className="flex items-center mt-1">
                        <TvIcon className="w-5 me-2"/>
                        <WatchLinkCardInput
                            type={'text'}
                            name={'channel'}
                            value={watchLink.channel}
                            disabled={!editable}
                            callback={onWatchLinkDataChange}
                        />
                    </div>

                    <div className="flex mt-3">
                        <div className="w-5 me-3"></div>
                        <div className="flex flex-wrap gap-2">
                            <WatchLinkFeature
                                displayName={'Live'}
                                icon={<SignalIcon className="w-5 md:me-1"/>}
                                value={watchLink.live}
                                disabled={!editable}
                                callback={onFeatureToggle.bind(null, 'live')}
                            />
                            <WatchLinkFeature
                                displayName={'Replay'}
                                icon={<BackwardIcon className="w-5 md:me-1"/>}
                                value={watchLink.replayable}
                                disabled={!editable}
                                callback={onFeatureToggle.bind(null, 'replayable')}
                            />
                            <WatchLinkFeature
                                displayName={'Geoblocked'}
                                icon={<NoSymbolIcon className="w-5 md:me-1"/>}
                                value={watchLink.geoblocked}
                                disabled={!editable}
                                callback={onFeatureToggle.bind(null, 'geoblocked')}
                            />
                            <WatchLinkFeature
                                displayName={'Castable'}
                                icon={<RssIcon className="w-5 md:me-1"/>}
                                value={watchLink.castable}
                                disabled={!editable}
                                callback={onFeatureToggle.bind(null, 'castable')}
                            />
                            <WatchLinkFeature
                                displayName={'Account required'}
                                icon={<UserCircleIcon className="w-5 md:me-1"/>}
                                value={watchLink.accountRequired}
                                disabled={!editable}
                                callback={onFeatureToggle.bind(null, 'accountRequired')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WatchLinkCardInput({type, name, value, disabled, callback}: {
    type: 'text' | 'textarea'
    name: string,
    value: string | undefined,
    disabled: boolean,
    callback: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}) {
    const InputTag = type == 'text' ? 'input' : 'textarea';
    return (
        <InputTag
            size={1}
            className={clsx('p-1 grow bg-foreground/10 rounded-lg',
                {
                    'text-foreground/50': disabled
                }
            )}
            type={type == 'text' ? type : ''}
            name={name}
            value={value}
            disabled={disabled}
            onChange={callback}
        />
    )
}

function WatchLinkFeature({displayName, icon, value, disabled, callback}: {
    displayName: string,
    icon: JSX.Element,
    value: 0 | 1,
    disabled: boolean,
    callback: () => void
}) {
    return (
        <button
            onClick={callback}
            disabled={disabled}
            className={clsx('flex text-sm rounded-2xl px-3 py-2 md:py-0.5',
                {
                    'border-1 bg-foreground/10 border-foreground/10': value == 1 && disabled,
                    'cursor-not-allowed': disabled,
                    'border-1 bg-sky-500 border-sky-500 text-background': value == 1 && !disabled,
                    'border-1 border-foreground/30': value == 0,
                    'text-foreground': value == 0 && !disabled,
                    'cursor-pointer': !disabled
                }
            )}>
            {icon}
            <span className="hidden md:block">{displayName}</span>
        </button>
    )
}