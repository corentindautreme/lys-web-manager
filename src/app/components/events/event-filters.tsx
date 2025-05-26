'use client';

import { ReadonlyURLSearchParams, useParams, usePathname, useSearchParams } from 'next/navigation';
import { ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { EventFilterQuery } from '@/app/types/events/event-filter-query';
import Link from 'next/link';

export default function EventFilters() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const params = useParams<{ id: string }>();

    const currentFilters = extractFilters(searchParams);

    function extractFilters(searchParams: ReadonlyURLSearchParams): EventFilterQuery {
        const query: EventFilterQuery = {};
        query.showPast = searchParams.get('showPast') ?? "false";
        query.final = searchParams.get('final') ?? "false";
        if (searchParams.get('countries') !== null) {
            query.countries = searchParams.get('countries')?.split(',');
        }
        if (searchParams.get('dateFrom') !== null) {
            query.dateFrom = searchParams.get('dateFrom')?.toString();
        }
        if (searchParams.get('dateTo') !== null) {
            query.dateTo = searchParams.get('dateTo')?.toString();
        }
        return query;
    }

    function toggleShowPast() {
        const params = new URLSearchParams(searchParams);
        params.set('showPast', currentFilters.showPast == 'true' ? 'false' : 'true');
        return renderPath(params);
    }

    function toggleFinals() {
        const params = new URLSearchParams(searchParams);
        if (currentFilters.final !== undefined) {
            params.delete('final');
        } else {
            params.set('final', 'true');
        }
        return renderPath(params);
    }

    function toggleSweden() {
        const params = new URLSearchParams(searchParams);
        if (currentFilters.countries !== undefined) {
            params.delete('countries');
        } else {
            params.set('countries', 'Sweden');
        }
        return renderPath(params);
    }

    function renderPath(urlParams: URLSearchParams) {
        const anchor = params.id !== undefined ? `#${params.id}` : "";
        return `${pathname}?${urlParams.toString()}${anchor}`;
    }

    return (
        <div className="w-full flex space-x-1 overflow-x-auto my-2">
            <Link href={toggleShowPast()} className={clsx(
                'flex text-nowrap px-3 py-0.5 border-1 rounded-2xl text-sm cursor-pointer',
                {
                    'line-through text-foreground/50 border-1 border-gray-400 dark:border-neutral-600': currentFilters.showPast == "false",
                    'border-1 bg-sky-300 border-sky-300 dark:bg-sky-700 dark:border-sky-700': currentFilters.showPast == "true"
                }
            )}>
                <ClockIcon className="w-4 me-1"/>
                Show past
            </Link>
            <Link href={toggleFinals()} className={clsx(
                'flex text-nowrap px-3 py-0.5 border-1 rounded-2xl text-sm cursor-pointer',
                {
                    'text-foreground/50 border-gray-400 dark:border-neutral-600': currentFilters.final == undefined || currentFilters.final == "false",
                    'border-1 bg-sky-300 border-sky-300 dark:bg-sky-700 dark:border-sky-700': currentFilters.final == "true"
                }
            )}>
                <TrophyIcon className="w-4 me-1"/>
                Finals
            </Link>
            <Link href={toggleSweden()} className={clsx(
                'flex text-nowrap px-3 py-0.5 border-1 rounded-2xl text-sm cursor-pointer',
                {
                    'text-foreground/50 border-gray-400 dark:border-neutral-600': currentFilters.countries == undefined,
                    'border-1 bg-sky-300 border-sky-300 dark:bg-sky-700 dark:border-sky-700': currentFilters.countries != undefined
                }
            )}>
                <TrophyIcon className="w-4 me-1"/>
                Sweden
            </Link>
            <Link href={toggleSweden()} className={clsx(
                'flex px-3 py-0.5 border-1 rounded-2xl text-sm cursor-pointer',
                {
                    'text-foreground/50 border-gray-400 dark:border-neutral-600': currentFilters.countries == undefined,
                    'border-1 bg-sky-300 border-sky-300 dark:bg-sky-700 dark:border-sky-700': currentFilters.countries != undefined
                }
            )}>
                <TrophyIcon className="w-4 me-1"/>
                Sweden
            </Link>
            <select className={clsx(
                'flex text-nowrap px-3 py-0.5 border-1 rounded-2xl text-sm cursor-pointer',
                {
                    'text-foreground/50 border-gray-400 dark:border-neutral-600': currentFilters.countries == undefined,
                    'border-1 bg-sky-300 border-sky-300 dark:bg-sky-700 dark:border-sky-700': currentFilters.countries != undefined
                }
            )}>
                <option value="">Select...</option>
                <option value="Norway">Norway</option>
                <option value="Sweden">Sweden</option>
            </select>
        </div>
    );
}