import { CountryCardSkeleton } from '@/app/(main)/referential/components/country-card-skeletons';

export default function CountryListSkeleton() {
    return (
        <div className="mt-4">
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
        </div>
    );
}