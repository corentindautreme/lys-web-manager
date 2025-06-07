import { CountryCardSkeleton } from '@/app/(main)/referential/components/country-card-skeleton';

export default function CountryListSkeleton() {
    return (
        <div className="flex flex-col gap-y-1">
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
        </div>
    );
}