"use client";

import {SunIcon} from '@heroicons/react/24/outline';

export default function ThemeToggle() {
    function toggleTheme() {
        /*const isDarkModeOn = */document.documentElement.classList.toggle('dark');
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex h-[36px] grow items-center justify-center gap-2 text-sm font-medium md:flex-none text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-900/50">
            <SunIcon className="w-6"/>
            {/*<div className="hidden md:block">Toggle theme</div>*/}
        </button>
    );
}
