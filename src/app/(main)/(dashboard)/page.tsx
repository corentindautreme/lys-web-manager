import { Metadata } from 'next';
import { BoltIcon } from '@heroicons/react/24/outline';
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
        <div className="relative h-full flex flex-col">
            {/*/!* Header *!/*/}
            {/*<div className="">*/}
            {/*    /!* header background *!/*/}
            {/*    <div*/}
            {/*        className="absolute h-100 w-full top-0"*/}
            {/*    ></div>*/}
            {/*    /!* overlay gradient (fade to background) *!/*/}
            {/*    <div className="absolute h-100 w-full top-0 bg-linear-to-b from-transparent to-gray-100 dark:to-background to-75%"></div>*/}
            {/*</div>*/}
            {/*<h1 className="py-10 shrink-0 z-1 text-5xl text-center">Lys</h1>*/}
            <div className="flex flex-col w-full md:mt-3 py-3 px-3 md:px-6">
                <Breadcrumbs breadcrumbs={[
                    {
                        label: 'Dashboard',
                        href: '/',
                        active: true
                    }
                ]}/>
            </div>

            <div className="z-1 grow px-3 md:px-6">
                <div className="flex flex-col h-full p-3 rounded-xl grow bg-background dark:bg-neutral-900">
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
                                <h2 className="flex items-center text-lg my-4">
                                    <BoltIcon className="w-5 me-2"/>
                                    <div className="">Status</div>
                                </h2>

                                <StatusCards/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}