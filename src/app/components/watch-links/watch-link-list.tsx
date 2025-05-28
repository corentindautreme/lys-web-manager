import { WatchLink } from '@/app/types/watch-link';
import { useEffect, useRef, useState } from 'react';
import { createSwapy, Swapy } from 'swapy';
import WatchLinkCard from '@/app/components/watch-links/watch-link-card';

export type SwappedHistory = { from: number, to: number }[];

export default function WatchLinkList({watchLinksParam, onWatchLinkChanged, onWatchLinksReordered, editable}: {
    watchLinksParam: WatchLink[],
    onWatchLinkChanged: (index: number, watchLink: WatchLink, deleted?: boolean) => void,
    onWatchLinksReordered: (swappedHistory: SwappedHistory) => void,
    editable: boolean
}) {
    const swapy = useRef<Swapy>(null);
    const swapyContainer = useRef(null);

    const [watchLinks] = useState(watchLinksParam);
    let swappedHistory: SwappedHistory = [];

    useEffect(() => {
        if (swapyContainer.current) {
            swapy.current = createSwapy(swapyContainer.current, {
                dragAxis: 'y',
                enabled: editable,
                autoScrollOnDrag: false
            });

            // Your event listeners
            swapy.current.onSwap((event: { fromSlot: string, toSlot: string }) => {
                swappedHistory.push({from: Number(event.fromSlot), to: Number(event.toSlot)});
            });

            swapy.current.onSwapEnd(async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                onWatchLinksReordered(swappedHistory);
                swappedHistory = [];
            })
        }

        return () => {
            // Destroy the swapy instance on component destroy
            swapy.current?.destroy()
        }
    }, [editable]);

    return (
        <div ref={swapyContainer} id="watch-links" className="space-y-3">
            {watchLinks.map((watchLink, index) => (
                <WatchLinkCard
                    key={`link-${index}`}
                    id={index}
                    watchLinkParam={watchLink}
                    changeCallback={onWatchLinkChanged}
                    editable={editable}
                />
            ))}
        </div>
    );
}