const shimmerCss =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] ' +
    'before:bg-gradient-to-r before:from-transparent before:via-white/60 dark:before:via-gray-700/60 before:to-transparent';

export function SuggestedDateSkeleton({shimmer}: { shimmer: boolean }) {
    return (<></>
        // <div
        //     className={`${shimmer && shimmerCss} relative overflow-hidden flex items-center h-fit p-3 md:px-5 rounded-xl bg-foreground/10`}
        // >
        //     <div className="grow">
        //         <button className="flex w-full items-center text-sm"
        //                 onClick={() => unfold(!unfolded)}>
        //             <div className={clsx({'font-bold': !!suggestedDate.selected})}>
        //                 {date.toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
        //             </div>
        //             {unfolded
        //                 ? (<ChevronUpIcon className="ml-1.5 w-5"/>)
        //                 : (<ChevronDownIcon className="ml-1.5 w-5"/>)
        //             }
        //         </button>
        //         {unfolded && (
        //             <div className="p-3">
        //                 <div className={clsx('border-l-4 p-1 ps-3', {
        //                     'border-sky-500': !suggestedDate.selected,
        //                     'border-white': !!suggestedDate.selected
        //                 })}>
        //                     <span>{contextualizedSentence}</span>
        //                 </div>
        //                 <div className="flex items-center text-sm mt-2">
        //                     <ClockIcon className="w-4 me-1"/>
        //                     <span>{date.toLocaleString('en-US', {
        //                         weekday: 'long',
        //                         month: 'short',
        //                         day: 'numeric',
        //                         year: 'numeric'
        //                     })}</span>
        //                 </div>
        //             </div>
        //         )}
        //     </div>
        //     <input
        //         type="checkbox"
        //         className={clsx('relative peer ms-1 appearance-none shrink-0 rounded-lg w-6 h-6 after:content-[\'\'] after:hidden checked:after:inline-block after:w-2.5 after:h-4 after:ms-1.5 after:rotate-[40deg] after:border-b-4 after:border-r-4',
        //             {
        //                 'bg-foreground/10 checked:bg-transparent checked:border-1 border-white after:border-white': !disabled,
        //                 'bg-black/10': disabled
        //             }
        //         )}
        //         id="scheduleDeviceTime"
        //         name="scheduleDeviceTime"
        //         checked={selected}
        //         onChange={onChange}
        //         disabled={disabled}
        //     />
        // </div>
    );
}