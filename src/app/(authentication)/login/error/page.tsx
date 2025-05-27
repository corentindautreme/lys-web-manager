'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function Error() {
    const search = useSearchParams();
    const error = search.get('error')
    return (
        <>
            <h5>
                An error occurred while trying to authenticate
            </h5>
            <div className="font-normal">
                Error message: {error}
            </div>
            <div className="mt-5">
                <Link
                    href="/login"
                    className=""
                >
                    Return to the login page
                </Link>
            </div>
        </>
    );
}

export default function LoginPage() {
    return (
        <main>
            <Suspense>
                <Error/>
            </Suspense>
        </main>
    );
}