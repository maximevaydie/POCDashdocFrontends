import {queryService} from "@dashdoc/web-core";
import isNil from "lodash.isnil";
import deepMerge from "lodash.merge";
import omit from "lodash.omit";
import union from "lodash.union";
interface SearchAction {
    query: any;
    queryName: string;
    items: any[];
    page: number;
    hasNextPage: boolean;
    count: number;
}

export function searchReducer(state: any, action: SearchAction) {
    return {
        ...state,
        query: {
            ...state.query,
            [action.queryName]: action.query,
        },
    };
}

export function searchSuccessReducer(state: any, action: SearchAction, lookupField = "pk") {
    const queryString = queryService.toQueryString(action.query),
        resultsState = state.results;
    let newItemsKeys = action.items.map((item) => {
        return item[lookupField];
    });
    if (action.page !== 1 && !isNil(resultsState[queryString])) {
        newItemsKeys = union(resultsState[queryString].items, newItemsKeys);
    }

    // convert array -> object to merge with items in state
    let newItemsObj = (action.items ?? []).reduce((obj: any, item) => {
        obj[item[lookupField]] = item;
        return obj;
    }, {});

    // don't indicate that items that were already there are partial
    const mergedItems = deepMerge({}, state.items, newItemsObj);

    Object.values(state.items).forEach(({pk}: any) => {
        if (!state.items[pk].__partial) {
            mergedItems[pk].__partial = false;
        }
    });

    return {
        ...state,
        results: {
            ...resultsState,
            [queryString]: {
                page: action.page,
                hasNextPage: action.hasNextPage,
                items: newItemsKeys,
                count: action.count,
            },
        },
        items: mergedItems,
    };
}

export function searchSelector(state: any, queryName: string) {
    const query = state.query[queryName] || state.query.initial,
        queryResults = state.results ? state.results[queryService.toQueryString(query)] : null;

    if (state.items === null || !queryResults) {
        return [];
    } else {
        return queryResults.items.map((pk: number) => state.items[pk]);
    }
}

export function getSearchQuery(state: any, queryName: string) {
    return state.query[queryName] || state.query.initial;
}

export function clearSearchResults(state: any, action: SearchAction) {
    const queryString = queryService.toQueryString(action.query);
    return {...state, results: omit(state.results, queryString)};
}
