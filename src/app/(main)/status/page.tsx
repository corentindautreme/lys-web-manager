import LogCard from '@/app/(main)/status/components/log-card';
import { BellIcon, CheckIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import LogScreen from '@/app/(main)/status/components/log-screen';
import { fetchLysPublisherLogs } from '@/app/services/logs-service';

export default async function Page() {
    const logsByPublisher = await fetchLysPublisherLogs();

    return (
        <div className="h-full flex flex-col bg-background px-1 py-3 md:p-3 rounded-xl dark:bg-neutral-900">
            {logsByPublisher && <LogScreen logsByPublisher={logsByPublisher}/>}
            {/*<div className="grid grid-flow-row grid-cols-1 xl:grid-cols-2 gap-2">*/}
            {/*    <LogCard title="Daily > Bluesky" key="daily-bsky" logs={[*/}
            {/*        'daily|bluesky',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="Daily > Threads" key="daily-threads" logs={[*/}
            {/*        'daily|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4 but oh look! An eRRoR',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="Daily > Twitter" key="daily-x" logs={[*/}
            {/*        'daily|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*</div>*/}

            {/*<div className="w-full my-4 border-t-1 border-foreground/30"></div>*/}

            {/*<div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-2">*/}
            {/*    <LogCard title="5min > Bluesky" key="5min-bsky" logs={[*/}
            {/*        '5min|bluesky',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="5min > Threads" key="5min-threads" logs={[*/}
            {/*        '5min|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="5min > Twitter" key="5min-x" logs={[*/}
            {/*        '5min|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*</div>*/}

            {/*<div className="w-full my-4 border-t-1 border-foreground/30"></div>*/}

            {/*<div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 gap-2">*/}
            {/*    <LogCard title="Weekly > Bluesky" key="weekly-bsky" logs={[*/}
            {/*        'weekly|bluesky',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="Weekly > Threads" key="weekly-threads" logs={[*/}
            {/*        'weekly|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*    <LogCard title="Weekly > Twitter" key="weekly-x" logs={[*/}
            {/*        'weekly|threads',*/}
            {/*        'line2',*/}
            {/*        'line3 but very, very, veeeeery long to see if this triggers the x axis scrolling',*/}
            {/*        'line4',*/}
            {/*        'line5',*/}
            {/*        'line6'*/}
            {/*    ]}/>*/}
            {/*</div>*/}
        </div>
    );
}