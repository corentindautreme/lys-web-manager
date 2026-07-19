'use client';

import {
    ArrowsRightLeftIcon,
    CalendarIcon,
    CheckCircleIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    PowerIcon,
    ServerIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useStatuses } from '@/app/(main)/logs/utils';
import { useEvents } from '@/app/(main)/events/utils';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import { useEffect, useState } from 'react';
import { getLast7DaysEvents, getNext7DaysEvents, useMetrics } from '@/app/(main)/(dashboard)/utils';
import { ProcessStatus } from '@/app/types/status';

type StatusType = 'ok' | 'info' | 'warn' | 'error' | null;
type Target = 'twitter' | 'bluesky' | 'threads';

export default function StatusTiles() {
    const {statuses, error: statusesError} = useStatuses();
    const {events, error: eventsError} = useEvents();
    const {suggestions, error: suggestionsError} = useSuggestions();
    const {metrics, error: metricsError} = useMetrics();

    const [globalStatus, setGlobalStatus] = useState<StatusType>(null);
    const [lambdaIssues, setLambdaIssues] = useState<{ status: StatusType, issue: string }[]>([]);
    const [otherIssues, setOtherIssues] = useState<{ status: StatusType, issue: string }[]>([]);

    const [upcomingStatus, setUpcomingStatus] = useState<StatusType>(null);
    const [recentStatus, setRecentStatus] = useState<StatusType>(null);
    const [suggestionStatus, setSuggestionStatus] = useState<StatusType>(null);

    useEffect(() => {
        setEventStatuses();
    }, [events]);

    useEffect(() => {
        computeAndSetSuggestionStatus();
    }, [suggestions]);

    useEffect(() => {
        computeAndSetLambdaIssues();
    }, [statuses, statusesError]);

    useEffect(() => {
        computeAndSetMetricIssues();
    }, [metrics, metricsError]);

    const setEventStatuses = () => {
        if (!!events) {
            const upcomingEventsWithoutTimeOrLink = getNext7DaysEvents(events).some(e =>
                e.dateTimeCet.substring(11, 16) === '00:00'
                || !e.watchLinks.some(l => l.live === 1)
            );
            setUpcomingStatus(upcomingEventsWithoutTimeOrLink ? 'warn' : 'ok');

            const recentEventsWithoutLink = getLast7DaysEvents(events).some(e => !e.watchLinks.some(l => l.replayable === 1));
            setRecentStatus(recentEventsWithoutLink ? 'warn' : 'ok');
        }
    };

    const computeAndSetSuggestionStatus = () => {
        if (!!suggestions) {
            setSuggestionStatus(suggestions.length === 0 ? 'ok' : 'info');
        }
    };

    const computeAndSetLambdaIssues = () => {
        if (statusesError) {
            setLambdaIssues([{
                status: 'warn',
                issue: 'Error loading statuses/logs'
            }]);
            if (globalStatus === null || globalStatus === 'ok' || globalStatus === 'info') {
                setGlobalStatus('warn');
            }
        }
        else if (!!statuses) {
            console.log(statuses);
            const lambdaErrors = Object.entries(statuses)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, status]) => !status.success || status.isLate)
                .map(([key, value]) => ({process: key, status: value}))
                .reduce((out, ps) => {
                    const processTarget = ps.process.split('|');
                    const process = processTarget[0];
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const {logs: _, ...partialStatus} = ps.status;

                    let targetStatus: {target: Target | null, status: Omit<ProcessStatus, 'logs'>};
                    // lys process (<mode>|<target>)
                    if (processTarget.length > 1) {
                        targetStatus = {
                            target: processTarget[1] as Target,
                            status: partialStatus
                        }
                    } else {
                        targetStatus = {
                            target: null,
                            status: partialStatus
                        }
                    }

                    if (process in out) {
                        out[process].push(targetStatus);
                    } else {
                        out[process] = [targetStatus];
                    }
                    return out;
                }, {} as { [process: string]: {target: Target | null, status: Omit<ProcessStatus, 'logs'>}[] });

            const lambdaIssues = Object.entries(lambdaErrors).reduce((out, [process, targetStatus]) => {
                const processName = process.charAt(0).toUpperCase() + process.slice(1);
                const targets: string | undefined = targetStatus.some(ts => ts.target != null)
                    ? targetStatus.map(ts => ts.target).join(', ')
                    : undefined;
                const issue = processName + (targets ? ` (${targets})` : "");
                out.push({
                    status: targetStatus.some(ts => !ts.status.success) ? 'error' : 'warn',
                    issue: issue
                });
                return out;
            }, [] as { status: StatusType, issue: string }[]);

            if (lambdaIssues.length > 0) {
                setLambdaIssues([...lambdaIssues]);
                const overallLambdaStatus = lambdaIssues.some(li => li.status === 'error') ? 'error' : 'warn';
                if (globalStatus === null || globalStatus === 'ok' || globalStatus === 'info' || globalStatus === 'warn') {
                    setGlobalStatus(overallLambdaStatus);
                }
            }
        }
    };

    const computeAndSetMetricIssues = () => {
        if (!!metricsError) {
            return;
        } if (!!metrics) {
            const measurements = metrics['current_month_rcu'].measurements;
            const lastMeasurement = measurements[measurements.length - 1].value;
            if (lastMeasurement > 12_500) {
                setOtherIssues([...otherIssues, {
                    status: 'warn',
                    issue: 'RCU usage > 12_500'
                }]);
                if (globalStatus === null || globalStatus === 'ok' || globalStatus === 'info') {
                    setGlobalStatus('warn');
                }
            } else if (lastMeasurement > 18_600) {
                setOtherIssues([...otherIssues, {
                    status: 'warn',
                    issue: `RCU over quota (${new Intl.NumberFormat('en-US').format(lastMeasurement)})`
                }]);
                if (globalStatus === null || globalStatus === 'ok' || globalStatus === 'info') {
                    setGlobalStatus('warn');
                }
            }
        }
    }

    const computeEventStatus: () => StatusType = () => {
        if (!events && !eventsError && !suggestions && !suggestionsError) {
            return null;
        }
        if (upcomingStatus === 'error' || recentStatus === 'error' || suggestionStatus === 'error') {
            return 'error';
        }
        if (upcomingStatus === 'warn' || recentStatus === 'warn' || suggestionStatus === 'warn' || eventsError || suggestionsError) {
            return 'warn';
        }
        return 'ok';
    };

    return (
        <div className="flex items-stretch overflow-x-scroll gap-x-2 mt-2">

            <div className="w-1 shrink-0"></div>

            <Tile status={globalStatus}>
                <div className="absolute bottom-1 right-1 text-foreground/25">
                    <PowerIcon className="w-8"/>
                </div>

                { !globalStatus && 'Loading...' }
                { globalStatus === 'ok' && <div className="flex items-center gap-1"><CheckCircleIcon className="w-4"/>All good!</div> }
                { globalStatus !== 'ok' && <div className="flex flex-col">
                    { lambdaIssues.map((issue, index) => (
                        <div key={`issue-${index}`} className="flex items-center gap-1">
                            { issue.status === 'error' && <XCircleIcon className="w-4"/> }
                            { issue.status === 'warn' && <ExclamationTriangleIcon className="w-4"/> }
                            { issue.issue }
                        </div>
                    )) }
                    { otherIssues.map((issue, index) => (
                        <div key={`issue-${index}`} className="flex items-center gap-1">
                            { issue.status === 'error' && <XCircleIcon className="w-4"/> }
                            { issue.status === 'warn' && <ExclamationTriangleIcon className="w-4"/> }
                            { issue.issue }
                        </div>
                    )) }
                </div>}
            </Tile>

            <Tile status={computeEventStatus()}>
                <div className="absolute bottom-1 right-1 text-foreground/25">
                    <CalendarIcon className="w-8"/>
                </div>

                <div className="flex flex-col">
                    { !events && !suggestions && 'Loading...' }
                    { !!eventsError && <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4"/>
                        Error loading events
                    </div> }
                    { !!suggestionsError && <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-4"/>
                        Error loading suggestions
                    </div> }

                    { !!events && (
                        <>
                            <div className="flex items-center gap-1">
                                { upcomingStatus === 'ok' && <CheckIcon className="w-4"/> }
                                { upcomingStatus === 'error' && <XCircleIcon className="w-4"/> }
                                Upcoming
                            </div>
                            <div className="flex items-center gap-1">
                                { recentStatus === 'ok' && <CheckIcon className="w-4"/> }
                                { recentStatus === 'error' && <XCircleIcon className="w-4"/> }
                                Recent
                            </div>
                        </>
                    )}

                    { !!suggestions && (
                        <div className="flex items-center gap-1">
                            { suggestionStatus === 'ok' && <CheckIcon className="w-4 shrink-0"/> }
                            { suggestionStatus === 'info' && <div className="w-4 shrink-0"><div className="rounded-full size-1.5 mx-auto bg-sky-500"></div></div> }
                            Suggestions
                        </div>
                    )}
                </div>
            </Tile>

            <Tile status={null}>
                <div className="absolute bottom-1 right-1 text-foreground/25">
                    <ArrowsRightLeftIcon className="w-8"/>
                </div>

                <div className="flex size-full md:items-stretch justify-center">
                    <div className="flex flex-col gap-0.5 md:gap-2 flex-1 md:flex-initial pe-1 md:px-5 py-1 items-center md:justify-center text-2xl md:text-3xl">
                        <div className={clsx('rounded-lg', {
                            'bg-amber-300 dark:bg-amber-700': false
                        })}>{!events ? "  " : events.length}</div>
                        <ServerIcon className="w-5 md:w-6"/>
                    </div>

                    <div className="flex flex-col gap-0.5 md:gap-2 flex-1 md:flex-initial h-fit md:h-auto ps-1 md:px-5 py-1 items-center md:justify-center border-l-1 border-foreground/25 text-2xl md:text-3xl">
                        -
                        <GlobeAltIcon className="w-5 md:w-6"/>
                    </div>
                </div>
            </Tile>

            <div className="w-1 shrink-0"></div>
        </div>
    )
}

function Tile({status, children}: { status: StatusType, children: React.ReactNode }) {
    return (
        <div className={clsx(
            'shrink-0 relative min-h-[100px] rounded-lg text-xs p-2 border-1',
            {
                'w-[100px] md:w-[200px]': !status || status === 'ok',
                'w-[200px]': !!status && status !== 'ok',
                'bg-background dark:bg-foreground/10 border-gray-300 dark:border-foreground/10': !status || status === 'ok',
                'bg-amber-300 dark:bg-amber-700/50 border-amber-500/25': status === 'warn',
                'bg-red-300 dark:bg-red-700/50 border-red-500/25': status === 'error',
            }
        )}>
            {children}
        </div>
    );
}