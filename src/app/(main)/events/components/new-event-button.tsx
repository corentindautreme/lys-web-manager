import { clsx } from 'clsx';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewEventButton() {
    return (
        <div className="absolute right-2 bottom-18 md:right-auto md:left-[345px] md:bottom-2 rounded-4xl p-4 bg-sky-500 text-background">
            <Link
                href="/events/new"
                className={clsx()}
            >
                <PlusIcon className="w-6"/>
            </Link>
        </div>
    )
}