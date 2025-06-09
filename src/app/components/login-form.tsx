'use client';

import { useActionState } from 'react';
import { authenticateWithGithub } from '@/app/(authentication)/login/actions';
import { useSearchParams } from 'next/navigation';
import { ArrowRightEndOnRectangleIcon, ExclamationCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import ThemeToggle from '@/app/components/theme-toggle';
import { XCircleIcon } from '@heroicons/react/16/solid';

export default function LoginForm() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const callbackUrl = error || !searchParams.get('callbackUrl') ? '/' : searchParams.get('callbackUrl')!;
    const [githubErrorMessage, githubFormAction, isGithubPending] = useActionState(authenticateWithGithub, undefined);

    return (
        <main className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-neutral-900">
            {error && <div className="w-72 flex items-center rounded-xl bg-red-500 p-3 mb-2 text-background">
                { error == "AccessDenied" && <>
                    <XCircleIcon className="shrink-0 h-5 w-5 me-2"/>
                    You don&apos;t have the required permission to access this website
                </>}
                { error != "AccessDenied" && <div className="flex items-center break-all">
                    <XCircleIcon className="shrink-0 h-5 w-5 me-2"/>
                    <div>
                        <div>Unable to sign you in</div>
                        <div className="text-sm">(error message: {error})</div>
                    </div>
                </div>}
            </div>}
            <div className="flex flex-col w-72 items-center rounded-xl py-12 px-6 bg-background">
                <div className="w-fit bg-foreground/10 p-4 rounded-4xl">
                    <LockClosedIcon className="w-8"/>
                </div>
                <h1 className="font-bold my-1 text-lg">Unauthenticated</h1>
                <div className="text-center my-5">
                    Please log in with your Github account to access this page.
                </div>
                <form action={githubFormAction}>
                    <input type="hidden" name="redirectTo" value={callbackUrl}/>
                    <button
                        className={clsx('flex items-center rounded-lg text-background px-3 py-2',
                            {
                                'bg-none border-1 border-foreground/50 text-foreground/50 cursor-not-allowed': isGithubPending,
                                'bg-sky-500 cursor-pointer': !isGithubPending
                            }
                        )}
                        type="submit"
                        disabled={isGithubPending}
                    >
                        <ArrowRightEndOnRectangleIcon className="w-6 me-1"/>
                        { !isGithubPending ? "Sign in with Github" : "Redirecting to Github..." }
                    </button>
                    <div className="">
                        {githubErrorMessage && (
                            <>
                                <ExclamationCircleIcon className="h-5 w-5"/>
                                <p className="text-sm">{githubErrorMessage}</p>
                            </>
                        )}
                    </div>
                </form>
            </div>

            <div className="absolute right-0 bottom-0 p-4">
                <ThemeToggle/>
            </div>
        </main>
    );
}