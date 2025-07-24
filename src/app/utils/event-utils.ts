import {EventFilterQuery} from '@/app/types/events/event-filter-query';

export function filterQueryToSearchParams(filterQuery: EventFilterQuery): string {
    const params = Object.entries(filterQuery)
        .filter((entry) => entry[1] !== undefined)
        .map((entry) => `${entry[0]}=${entry[1]}`)
        .join('&');
    return params != "" ? "?" + params : "";
}

export function getQueryParamString(params: URLSearchParams) {
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    return queryString != "" ? `?${queryString}` : "";
}