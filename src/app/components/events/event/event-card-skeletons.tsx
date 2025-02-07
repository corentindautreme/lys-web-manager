const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function EventCardSkeleton() {
    return (
        <div
            className={`${shimmer} relative overflow-hidden w-full md:w-[300px] h-auto mb-1 p-3 flex shadow-sm rounded-md bg-background dark:bg-gray-500/10`}
        >
            <div className="flex flex-col justify-center items-center">
                {/*<div className="h-8 w-8 rounded-md bg-gray-300 dark:bg-gray-400/10"/>*/}
                {/*<div className="h-4 w-6 rounded-md bg-gray-300 dark:bg-gray-400/10"/>*/}
                {/*<div className="h-3 w-8 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>*/}
                <div className="h-12 w-10 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>
            </div>
            <div className="h-fill border-e-3 mx-3 border-sky-500"></div>
            <div className="flex flex-col space-y-1">
                <div className="h-3 w-12 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>
                <div className="h-6 w-36 rounded-md bg-gray-300 dark:bg-gray-400/10"/>
                <div className="h-4 w-16 rounded-sm bg-gray-300 dark:bg-gray-400/10"/>
                <div className="mt-1 flex">
                    <div className="me-1 h-4 w-16 rounded-sm bg-gray-400/30 dark:bg-gray-400/10"/>
                    <div className="h-4 w-16 rounded-sm bg-gray-400/30 dark:bg-gray-400/10"/>
                </div>
            </div>
        </div>
    );
}
