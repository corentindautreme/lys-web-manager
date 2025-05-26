"use client";

import {SunIcon} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

export default function ThemeToggle() {
    useEffect(() => {
        const theme = localStorage.getItem('theme');
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    }, []);

    function toggleTheme() {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex h-[36px] grow items-center justify-center gap-2 text-sm font-medium md:flex-none text-gray-500 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-900/50">
            <SunIcon className="w-6"/>
        </button>
    );
}
