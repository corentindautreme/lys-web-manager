import { CountryCardSkeleton } from '@/app/(main)/referential/components/country-card-skeletons';

export default function CountryListSkeleton() {
    return (
        <>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
            <CountryCardSkeleton/>
        </>
    );
}