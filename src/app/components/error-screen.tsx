import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorScreen({title, message, details}: {title: string, message: string, details?: string}) {
    return (
        <div className="flex flex-col justify-center items-center p-5 md:h-full md:py-0 md:px-3 rounded-xl bg-background dark:bg-neutral-900">
            <ExclamationTriangleIcon className="w-12"/>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-center">{message}</p>
            <p className="text-center">{JSON.stringify(details)}</p>
        </div>
    )
}