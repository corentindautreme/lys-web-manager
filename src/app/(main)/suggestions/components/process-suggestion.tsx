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
            initSuggestion(suggestion, currentCountryData); // TODO yeah do this server side lol (post AWS fetch?)
            setSuggestion(suggestion);
        }
    }, [suggestions, countryData]);

    const updateSuggestionCache = async (suggestion: Suggestion) => {
        console.log(suggestion); // TODO why isn't the checked date reflected here?
        const newSuggestions = [...suggestions].filter((s: Suggestion) => s.id != suggestionId);
        newSuggestions.push({...suggestion, dateTimesCet: suggestion.dateTimesCet});
        newSuggestions.sort((s1, s2) => s2.id - s1.id);
        await mutate(newSuggestions);
        console.log(JSON.stringify(newSuggestions, null, 2));
        console.log(JSON.stringify(suggestions, null, 2)); // TODO why are these only updated when opening another suggestion?
    }

    const onSubmit = async (suggestion: Suggestion) => {
        await updateSuggestionCache(suggestion);
        redirect('/suggestions');
    }

    const initSuggestion = (suggestion: Suggestion, countryData: Country): void => {
        // suggestion.accepted = false;
        // suggestion.processed = false;
        // suggestion.dateTimesCet.forEach((d, index) => {
        //     for (const likelyDate of countryData.likelyDates) {
        //         if (likelyDate.substring(0, 2) == d.dateTimeCet.substring(5, 7)) {
        //             const suggestedDateDay = d.dateTimeCet.substring(8, 10);
        //             d.selected = likelyDate.endsWith('A') ? suggestedDateDay <= "15" : suggestedDateDay > "15";
        //             break;
        //         } else {
        //             d.selected = false;
        //         }
        //     }
        // });
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