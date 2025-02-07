'use client';

import {HomeIcon, CalendarDaysIcon, GlobeEuropeAfricaIcon, SparklesIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {clsx} from 'clsx';
import { useEvents } from '@/app/(main)/events/utils';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
    {
        name: 'Home',
        href: '/',
        icon: HomeIcon
    },
    {
        name: 'Suggestions',
        href: '/suggestions',
        icon: SparklesIcon,
    },
    {
        name: 'Events',
        href: '/events',
        icon: CalendarDaysIcon,
    },
    {
        name: 'Referential',
        href: '/referential',
        icon: GlobeEuropeAfricaIcon
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
    const {events} = useEvents();
    const hasBadge = {
        'Home': false,
        'Suggestions': false, // TODO
        'Events': events?.some(e => e.modified || e.deleted),
        'Referential': false
    }
    return (
        <>
            {links.map((link) => {
                const LinkIcon = link.icon;
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
                        <LinkIcon className="w-6"/>
                        {hasBadge[link.name] && <IconBadge/>}
                        {/*<p className="hidden md:block">{link.name}</p>*/}
                    </Link>
                );
            })}
        </>
    );
}
