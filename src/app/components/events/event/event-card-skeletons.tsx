const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function EventCardSkeleton() {
    return (
        <div
            className={`${shimmer} relative overflow-hidden w-full md:w-[300px] h-auto p-3 flex shadow-sm rounded-md bg-background dark:bg-gray-500/10`}
        >
            <div className="flex flex-col justify-center items-center">
                <div className="h-12 w-10 rounded-sm bg-gray-300 dark:bg-gray-400/5"/>
            </div>
            <div className="h-fill border-e-3 mx-3 border-gray-300 dark:border-gray-400/20"></div>
            <div className="flex flex-col space-y-1 py-2">
                <div className="h-3 w-12 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>
                <div className="h-6 w-36 rounded-md bg-gray-300 dark:bg-gray-400/20"/>
                <div className="h-5 w-16 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>
            </div>
        </div>
    );
}

export function EventCardLiteSkeleton() {
    return (<div
        className={`${shimmer} relative overflow-hidden p-3 flex rounded bg-foreground/10`}
    >
        <div className="h-fill border-e-3 me-3 border-gray-300 dark:border-gray-400/20"></div>
        <div className="flex flex-col space-y-1">
            <div className="h-6 w-16 rounded bg-gray-300 dark:bg-gray-400/20"/>
            <div className="h-5 w-24 rounded bg-gray-300 dark:bg-gray-400/20"/>
            <div className="flex gap-x-0.5">
                <div className="h-4 w-13 bg-gray-300 dark:bg-gray-400/20"/>
                <div className="h-4 w-13 bg-gray-300 dark:bg-gray-400/20"/>
            </div>
        </div>
    </div>);
}
