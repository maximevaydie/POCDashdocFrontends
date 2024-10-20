import {stringifyQueryObject} from "dashdoc-utils";
import {useCallback, useEffect, useMemo} from "react";
import {useHistory, useLocation} from "react-router";

import {usePreselectedFilters} from "./usePreselectedFilters";
import {useSelectedViews} from "./useSelectedViews";
import {useDispatch} from "../../../../hooks/useDispatch";
import {retrieveSettingsViewIfNeeded} from "../../../../../../../react/Redux/reducers/settingsViewsReducer";

/**
 * Handle query according url
 *
 * Return
 * currentQuery: query based url
 * updateQuery:  function that handle url update
 */
export function useQueryFromUrl<TQuery extends Record<string, any>>(
    parseQueryString: (queryString: string) => TQuery, // function to parse url into query
    queryValidation?: (query: TQuery) => TQuery, // validation schema on the query
    onQueryUpdated?: (query: TQuery) => void
) {
    const history = useHistory();
    const location = useLocation();

    const getValidatedQuery = useCallback(
        (query: TQuery): TQuery => {
            return queryValidation ? queryValidation(query) : query;
        },
        [queryValidation]
    );

    const currentQuery = useMemo(
        () => getValidatedQuery(parseQueryString(location.search)),
        [location.search, parseQueryString, getValidatedQuery]
    );

    const updateQuery = useCallback(
        (newQuery: Partial<TQuery>, method: "push" | "replace" = "replace") => {
            const query = getValidatedQuery({...currentQuery, ...newQuery});
            history[method]({
                ...location,
                search: stringifyQueryObject(query, {
                    skipEmptyString: true,
                    skipNull: true,
                    arrayFormat: "comma",
                }),
            });
            onQueryUpdated?.(query);
        },
        [currentQuery, history, location, getValidatedQuery, onQueryUpdated]
    );

    return {currentQuery, updateQuery};
}

/**
 * Handle query according url, selected view, and persisted view and query
 *
 * Return
 * currentQuery: query based url
 * updateQuery:  function that handle url update
 * selectedViewPk: the pk of filter view selected
 * updateSelectedViewPk: update selected view
 *
 */
export function useCurrentQueryAndView<TQuery extends Record<string, any>>({
    parseQueryString,
    queryValidation,
    defaultQuery,
    viewCategory, // the category should be an option of SettingsViewCategory account model in backend

    // advanced optional parameters
    preventInitWithPersistedData,
    resetInitKey,
    initialOrderingQuery,
    persistedQueryValidation,
    onInitDone,
}: {
    parseQueryString: (queryString: string) => TQuery; // function to parse url into query
    queryValidation?: (query: TQuery) => TQuery; // validation parse schema on the query
    defaultQuery: TQuery;
    viewCategory: string;

    // advanced optional parameters
    preventInitWithPersistedData?: (query: TQuery) => boolean;
    resetInitKey?: string; // update value when want to trigger again query initialization
    initialOrderingQuery?: Partial<TQuery>; // ordering to add to query during initialization
    persistedQueryValidation?: (query: Partial<TQuery>) => Partial<TQuery>; // specific validation and formating on persisted data only while initializing
    onInitDone?: () => void;
}) {
    const {persistedQuery, updatePersistedQuery} = usePersistedQuery<TQuery>(viewCategory);
    const {currentQuery, updateQuery} = useQueryFromUrl<TQuery>(
        parseQueryString,
        queryValidation,
        updatePersistedQuery
    );
    const {selectedViewPk, updateSelectedViewPk} = useSelectedView(viewCategory);

    useInitViewAndQuery<TQuery>(
        selectedViewPk,
        updateSelectedViewPk,
        updateQuery,
        defaultQuery,
        persistedQuery,
        preventInitWithPersistedData?.(currentQuery),
        resetInitKey,
        initialOrderingQuery,
        () => updatePersistedQuery(currentQuery),
        persistedQueryValidation,
        onInitDone
    );

    return {
        currentQuery,
        updateQuery,
        selectedViewPk,
        updateSelectedViewPk,
    };
}

/**
 * Handle persisted query storage
 */
function usePersistedQuery<TQuery extends Record<string, any>>(category: string) {
    const {updateSelectedFilters, selectedFilters} =
        usePreselectedFilters<Partial<Record<typeof category, Partial<TQuery>>>>();

    const updatePersistedQuery = useCallback(
        (query: TQuery) => {
            updateSelectedFilters(category, query);
        },
        [updateSelectedFilters, category]
    );

    return {persistedQuery: selectedFilters[category], updatePersistedQuery};
}

/**
 * Handle persisted view storage
 */
function useSelectedView(viewCategory: string) {
    const {updateSelectedViews, ...selectedViews} = useSelectedViews<typeof viewCategory>();
    const updateSelectedViewPk = useCallback(
        (viewPk: number | undefined) => updateSelectedViews({[viewCategory]: viewPk ?? undefined}),
        [updateSelectedViews, viewCategory]
    );
    const selectedViewPk = selectedViews[viewCategory];

    return {selectedViewPk, updateSelectedViewPk};
}

/**
 * Handle query initialization according  url, persisted view and persisted query
 */
function useInitViewAndQuery<TQuery extends Record<string, any>>(
    selectedViewPk: number | undefined,
    updateSelectedViewPk: (viewPk: number | undefined) => void,
    updateQuery: (query: Partial<TQuery>) => void,
    defaultQuery: TQuery,
    persistedQuery: Partial<TQuery> | undefined,
    preventInitWithPersistedData?: boolean, // ignore persisted view and query while initializing
    resetInitKey?: string, // value to update to re-trigger query and view initialization
    initialOrderingQuery?: Partial<TQuery>, // ordering to add to query during initialization
    updatePersistedWithCurrentQuery?: () => void,
    persistedQueryValidation?: (query: Partial<TQuery>) => Partial<TQuery>, // specific validation and formating on persisted data only while initializing
    onInitDone?: () => void
) {
    const dispatch = useDispatch();

    useEffect(
        () => {
            async function initWithViewOrPersistedQuery() {
                if (preventInitWithPersistedData) {
                    updateSelectedViewPk(undefined);
                    updatePersistedWithCurrentQuery?.();
                } else {
                    if (selectedViewPk) {
                        const response = await dispatch(
                            retrieveSettingsViewIfNeeded(selectedViewPk)
                        );
                        updateWithPersistedQueryToFormat(response.payload?.settings);
                    } else if (persistedQuery) {
                        updateWithPersistedQueryToFormat(persistedQuery);
                    } else if (initialOrderingQuery) {
                        updateQuery(initialOrderingQuery);
                    }
                }
                onInitDone?.();
            }
            initWithViewOrPersistedQuery();
        },
        // Only the initial effect is needed
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [resetInitKey]
    );

    function updateWithPersistedQueryToFormat(queryToFormat: Partial<TQuery>) {
        let query;
        try {
            query = {
                ...defaultQuery,
                ...formatPersistedQuery(queryToFormat),
                ...(initialOrderingQuery ?? {}),
            };
        } catch (e) {
            query = {
                ...defaultQuery,
                ...(initialOrderingQuery ?? {}),
            };
            updateSelectedViewPk(undefined);
        }
        updateQuery(query);
    }

    function formatPersistedQuery(query: Partial<TQuery>) {
        if (persistedQueryValidation) {
            return persistedQueryValidation(query);
        }
        return query;
    }
}
