import Sidebar from '@/app/components/sidebar';

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <div className="flex h-[100dvh] pb-15 md:pb-0 flex-col md:flex-row md:overflow-hidden bg-gray-100 dark:bg-gray-700/5 dark:bg-background">
            <div className="hidden flex-none md:block md:w-12">
                <Sidebar />
            </div>
            <div className="flex-grow overflow-y-auto">{children}</div>
            <div className="fixed w-full bottom-0 py-3 flex-none md:hidden bg-white dark:bg-gray-950 dark:bg-neutral-900 border-t border-gray-300 dark:border-gray-800">
                <Sidebar />
            </div>
        </div>
    );
}