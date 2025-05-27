'use client';

import {HomeIcon, CalendarDaysIcon, GlobeEuropeAfricaIcon, SparklesIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {clsx} from 'clsx';
import { useEvents } from '@/app/(main)/events/utils';
import { useCountries } from '@/app/(main)/referential/utils';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import { JSX } from 'react';

type LinkName = 'Home' | 'Suggestions' | 'Events' | 'Referential';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links: {name: LinkName, href: string, icon: JSX.Element}[] = [
    {
        name: 'Home',
        href: '/',
        icon: <HomeIcon className="w-6"/>
    },
    {
        name: 'Suggestions',
        href: '/suggestions',
        icon: <SparklesIcon className="w-6"/>,
    },
    {
        name: 'Events',
        href: '/events',
        icon: <CalendarDaysIcon className="w-6"/>,
    },
    {
        name: 'Referential',
        href: '/referential',
        icon: <GlobeEuropeAfricaIcon className="w-6"/>
    }
];

function IconBadge() {
    return (
        <div className="absolute flex items-center justify-center top-[8px] rounded-xl w-[10px] h-[10px] bg-white dark:bg-neutral-900" style={{right: "calc(50% - 5px - 10px)"}}>
            <div className="rounded-xl w-[7px] h-[7px] bg-sky-500"></div>
        </div>
    );
}

export default function NavLinks() {
    const pathName = usePathname();
    // extract the "main" path for subpaths like /events/edit/{id}, etc.
    const significantPath = pathName.substring(0, pathName.slice(1).indexOf('/') + 1);
    const {events, error: eventsError} = useEvents();
    const {countryData, error: countryDataError} = useCountries();
    const {suggestions, error: suggestionsError} = useSuggestions();
    const hasBadge = {
        'Home': false,
        'Suggestions': !suggestionsError && suggestions?.length > 0,
        'Events': !eventsError && events?.some(e => e.modified || e.deleted),
        'Referential': !countryDataError && countryData?.some(e => e.modified || e.deleted)
    }
    return (
        <>
            {links.map((link) => {
                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={clsx(
                            'relative flex h-[36px] grow items-center justify-center gap-2 text-sm font-medium md:flex-none hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-900/50',
                            {
                                'text-foreground': pathName == link.href || significantPath == link.href,
                                'text-gray-400 dark:text-gray-500': pathName != link.href && significantPath != link.href
                            }
                        )}
                    >
                        {link.icon}
                        {hasBadge[link.name] && <IconBadge/>}
                    </Link>
                );
            })}
        </>
    );
}
