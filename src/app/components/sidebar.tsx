import ThemeToggle from '@/app/components/theme-toggle';
import NavLinks from '@/app/components/nav-links';

export default function Sidebar() {
    return (
        <div className="flex h-full grow flex-row space-x-2 md:py-3 md:flex-col md:space-x-0 md:space-y-4 md:border-e border-gray-300 dark:border-gray-800 bg-white dark:bg-neutral-900">
            <NavLinks/>
            <div className="hidden w-[70%] mx-auto md:block border-b border-gray-400 dark:border-gray-600"></div>
            <ThemeToggle/>
        </div>
    );
}