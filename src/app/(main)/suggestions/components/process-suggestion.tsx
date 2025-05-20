'use client';

import { Suggestion } from '@/app/types/suggestion';
import { useEffect, useState } from 'react';
import { useCountries } from '@/app/(main)/referential/utils';
import { Country } from '@/app/types/country';
import { useSuggestions } from '@/app/(main)/suggestions/utils';
import { redirect } from 'next/navigation';
import SuggestionDetails from '@/app/(main)/suggestions/components/suggestion-details';

export default function ProcessSuggestion({suggestionId}: { suggestionId: number }) {
    const {suggestions, mutate, isLoading: isLoadingSuggestions} = useSuggestions();
    const {countryData, isLoading: isLoadingCountryData, error: countryDataError} = useCountries();
    const [suggestion, setSuggestion] = useState<Suggestion>();
    const [currentCountryData, setCurrentCountryData] = useState<Country>();

    // once SWR has loaded the data, set the suggestion, so we can start processing it (and hide the loading screen)
    useEffect(() => {
        if (!!suggestions && !!countryData) {
            const suggestion = {...suggestions.filter((s: Suggestion) => s.id == suggestionId)[0]};
            const currentCountryData = countryData.filter(c => c.country == suggestion.country)[0];
            setCurrentCountryData(currentCountryData);
            if (!suggestion.processed) {
                initSuggestion(suggestion, currentCountryData);
            }
            setSuggestion(suggestion);
        }
    }, [suggestions, countryData]);

    const updateCache = async (suggestion: Suggestion) => {
        const newSuggestions = [...suggestions].filter((s: Suggestion) => s.id != suggestionId);
        newSuggestions.push(suggestion);
        newSuggestions.sort((s1, s2) => s2.id - s1.id);
        await mutate(newSuggestions);
    }

    const onSubmit = async (suggestion: Suggestion) => {
        await updateCache(suggestion);
        redirect('/suggestions');
    }

    const initSuggestion = (suggestion: Suggestion, countryData: Country): void => {
        suggestion.accepted = false;
        suggestion.events = [];
        suggestion.dateTimesCet.forEach(d => {
            for (const likelyDate of countryData.likelyDates) {
                if (likelyDate.substring(0, 2) == d.dateTimeCet.substring(5, 7)) {
                    const suggestedDateDay = d.dateTimeCet.substring(8, 10);
                    d.selected = likelyDate.endsWith('A') ? suggestedDateDay <= "15" : suggestedDateDay > "15";
                    if (d.selected) {
                        break;
                    }
                } else {
                    d.selected = false;
                }
            }
        });
    }

    return (
        <>
            {!isLoadingSuggestions && !isLoadingCountryData && !!suggestion && !!currentCountryData ? (
                <SuggestionDetails suggestionParam={suggestion} countryData={currentCountryData} onSubmit={onSubmit}/>
            ) : (
                'Loading...'
            )}
        </>
    );
}