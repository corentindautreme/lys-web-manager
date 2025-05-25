import Breadcrumbs from '@/app/components/breadcrumbs';

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <main className="h-full md:flex md:flex-col">
            <div className="flex flex-col w-full px-3 md:px-0 mb-2">
                <Breadcrumbs breadcrumbs={[
                    {
                        label: 'Dashboard',
                        href: '/'
                    },
                    {
                        label: 'Logs',
                        href: '/logs',
                        active: true
                    }
                ]}/>
            </div>
            <div className="h-full md:flex md:flex-row md:overflow-y-auto">
                <div className="w-full flex-col flex md:flex-grow md:overflow-y-auto">
                    {children}
                </div>
            </div>
        </main>
    );
}