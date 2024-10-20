import {createSelector} from "@dashdoc/web-common";

import {getPartnersQueryParamsFromFilterQuery} from "app/features/filters/deprecated/utils";
import {fetchSearchCompanies} from "app/redux/actions";
import {
    getCompaniesCurrentQueryLoadingStatus,
    getCompaniesForCurrentQuery,
    getCompaniesSelectionForCurrentQuery,
} from "app/redux/selectors";
import {PARTNER_QUERY_NAME} from "app/types/constants";

import type {DataBehavior, EntityItem} from "app/features/core/entity-list/types";

const fetchAction = (query: any, timezone: string, page: number) => {
    return fetchSearchCompanies(
        PARTNER_QUERY_NAME,
        {
            ...getPartnersQueryParamsFromFilterQuery(query, timezone),
            company__isnull: false,
            ordering: "name",
        },
        page,
        false,
        "web"
    );
};

const modelSelector = createSelector(getCompaniesForCurrentQuery, (result) => {
    return {
        ...result,
        items: result.companies as EntityItem[],
    };
});

const selectionSelector = getCompaniesSelectionForCurrentQuery;
const loadingSelector = getCompaniesCurrentQueryLoadingStatus;

export const dataBehavior = {
    model: "companies",
    modelSelector,
    selectionSelector,
    loadingSelector,
    fetchAction,
} as DataBehavior;
