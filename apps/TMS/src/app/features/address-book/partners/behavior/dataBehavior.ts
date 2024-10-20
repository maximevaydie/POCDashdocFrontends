import {createSelector, fetchSearchPartners} from "@dashdoc/web-common";

import {getPartnersQueryParamsFromFilterQuery} from "app/features/filters/deprecated/utils";
import {
    getPartnersCurrentQueryLoadingStatus,
    getPartnersForCurrentQuery,
    getPartnersSelectionForCurrentQuery,
} from "app/redux/selectors";
import {PARTNER_QUERY_NAME} from "app/types/constants";

import type {DataBehavior, EntityItem} from "app/features/core/entity-list/types";

const fetchAction = (query: any, timezone: string, page: number) => {
    return fetchSearchPartners(
        PARTNER_QUERY_NAME,
        {
            ...getPartnersQueryParamsFromFilterQuery(query, timezone),
        },
        page
    );
};

const modelSelector = createSelector(getPartnersForCurrentQuery, (result) => {
    return {
        ...result,
        items: result.partners as EntityItem[],
    };
});

const selectionSelector = getPartnersSelectionForCurrentQuery;
const loadingSelector = getPartnersCurrentQueryLoadingStatus;

export const dataBehavior = {
    model: "partnersList",
    modelSelector,
    selectionSelector,
    loadingSelector,
    fetchAction,
} as DataBehavior;
