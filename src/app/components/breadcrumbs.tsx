import { clsx } from 'clsx';
import Link from 'next/link';
import {ChevronRightIcon} from '@heroicons/react/24/outline';

interface Breadcrumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Breadcrumb[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="block mb-2">
      <ol className="flex text-sm md:text-base">
        {breadcrumbs.map((breadcrumb, index) => (
          <li
            key={breadcrumb.href}
            aria-current={breadcrumb.active}
            className={clsx(
                "flex items-center hover:text-foreground",
              breadcrumb.active ? 'text-foreground' : 'text-gray-400 dark:text-gray-500',
            )}
          >
            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
            {index < breadcrumbs.length - 1 ? (
              <span className="mx-3"><ChevronRightIcon className="w-3 text-foreground/50"/></span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
