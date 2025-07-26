import { Metadata } from 'next';
import NextEventsByDay from '@/app/(main)/(dashboard)/components/next-events-by-day';
import PastEventsByDay from '@/app/(main)/(dashboard)/components/past-events-by-day';
import { StatusCards } from '@/app/(main)/(dashboard)/components/status-cards';
import ActionCards from '@/app/(main)/(dashboard)/components/action-cards';
import Breadcrumbs from '@/app/components/breadcrumbs';

export const metadata: Metadata = {
    title: 'Dashboard'
};

export default async function Page() {
    return (
        <div className="flex flex-col">
            <div className="w-full md:mt-3 py-3 px-3 md:px-6">
                <Breadcrumbs breadcrumbs={[
                    {
                        label: 'Dashboard',
                        href: '/',
                        active: true
                    }
                ]}/>
            </div>

            <div className="px-3 md:pb-3 md:px-6">
                <div className="flex flex-col">
                    <ActionCards/>

                    <div className="lg:flex md:gap-x-5">

                        <div className="w-full lg:w-[50%]">
                            <div className="w-full">
                                <NextEventsByDay/>
                            </div>

                            <div className="w-full">
                                <PastEventsByDay/>
                            </div>

                        </div>

                        <div className="w-full lg:w-[50%]">
                            <div className="w-full">
                                <StatusCards/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}