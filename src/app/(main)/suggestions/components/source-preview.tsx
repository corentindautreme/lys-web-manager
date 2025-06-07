import { useEffect, useState } from 'react';
import { SourceDetailsResponse } from '@/app/types/suggestion';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

export function SourcePreview({sourceLink, source, date}: {
    sourceLink: string,
    source: string,
    date?: string
}) {
    const [sourceDetails, setSourceDetails] = useState<SourceDetailsResponse>();

    useEffect(() => {
        const fetchSourceDetails = async () => {
            const res = await fetch(`/api/suggestions/source?articleUrl=${sourceLink}`);
            const sourceDetails: SourceDetailsResponse = await res.json();
            setSourceDetails(sourceDetails);
        };
        fetchSourceDetails();
    }, []);

    return (
        <>
            {!sourceDetails && <SourcePreviewSkeleton/>}
            {!!sourceDetails?.data &&
                <a href={sourceLink} target="_blank">
                    <div
                        className="flex flex-col xl:flex-row xl:items-stretch rounded-xl border-1 border-foreground/50">
                        <div
                            className="rounded-t-xl xl:rounded-tr-none xl:rounded-s-xl shrink-0 w-full xl:w-[30%] h-[150px] xl:h-auto"
                            style={{
                                backgroundImage: `url(${sourceDetails.data.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center center'
                            }}
                        ></div>
                        <div className="grow flex flex-col xl:flex-row items-center p-3">
                            <div className="grow flex flex-col gap-y-2">
                                <div className="flex items-center gap-x-1 text-sm">
                                    <div className="text-foreground rounded-xl bg-foreground/10 px-2 py-1">{source}</div>
                                    {!!date && <div className="text-foreground/75">{new Date(date).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</div>}
                                </div>
                                <h1 className="text-foreground">{sourceDetails.data.title}</h1>
                                <div className="text-sm text-foreground/50 italic">
                                    {sourceDetails.data.description}
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            }
            {!!sourceDetails?.error && <SourcePreviewFallback sourceLink={sourceLink}/>}
        </>
    )
}

function SourcePreviewFallback({sourceLink}: { sourceLink: string }) {
    return (
        <a href={sourceLink} target="_blank">
            <div className="flex flex-col xl:flex-row xl:items-stretch rounded-xl border-1 border-foreground/50">
                <div
                    className="w-full xl:w-[30%] h-[100px] xl:h-auto bg-foreground/10 text-foreground/75 flex items-center justify-center rounded-t-xl xl:rounded-tr-none xl:rounded-s-xl shrink-0"
                >
                    <GlobeAltIcon className="w-8"/>
                </div>
                <div className="grow flex flex-col xl:flex-row items-center p-3">
                    <div className="grow">
                        <h1>{sourceLink}</h1>
                    </div>
                </div>
            </div>
        </a>
    )
}

function SourcePreviewSkeleton() {
    const shimmer =
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
        'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

    return (
        <div>
            <div
                className={`${shimmer} relative overflow-hidden flex flex-col xl:flex-row xl:items-stretch rounded-xl border-1 border-foreground/50`}>
                <div
                    className="w-full xl:w-[30%] h-[150px] xl:h-auto bg-foreground/10 text-foreground/75 flex items-center justify-center rounded-t-xl xl:rounded-l-xl xl:rounded-tr-none shrink-0"
                >
                </div>
                <div className="grow flex flex-col xl:flex-row xlitems-center px-3 py-3">
                    <div className="grow">
                        <div className="h-6 w-18 rounded-xl bg-foreground/10"/>
                        <div className="h-5 mt-2 w-[70%] rounded-md bg-gray-300 dark:bg-gray-400/20"/>
                        <div className="h-3 mt-2 rounded-t-sm bg-gray-200 dark:bg-gray-400/10"/>
                        <div className="h-3 rounded-ee-sm bg-gray-200 dark:bg-gray-400/10"/>
                        <div className="h-3 w-[60%] rounded-b-sm bg-gray-200 dark:bg-gray-400/10"/>
                        <div className="h-3 w-[60%] rounded-b-sm bg-gray-200 dark:bg-gray-400/10"/>
                    </div>
                </div>
            </div>
        </div>
    )
}