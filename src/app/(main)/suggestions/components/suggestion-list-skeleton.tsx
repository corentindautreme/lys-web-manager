import { SuggestionCardSkeleton } from '@/app/(main)/suggestions/components/suggestion-card-skeleton';

export default function SuggestionListSkeleton() {
    return (
        <div className="flex flex-col gap-y-1">
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
        </div>
    );
}