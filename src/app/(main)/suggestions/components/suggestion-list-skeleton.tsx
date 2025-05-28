import { SuggestionCardSkeleton } from '@/app/(main)/suggestions/components/suggestion-card-skeleton';

export default function SuggestionListSkeleton() {
    return (
        <div className="mt-2">
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
            <SuggestionCardSkeleton/>
        </div>
    );
}