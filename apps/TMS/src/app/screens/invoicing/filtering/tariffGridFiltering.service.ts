import {Arrayify} from "@dashdoc/web-common";
import {parseQueryString} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

import {
    TARIFF_GRIDS_FILTERING_SCHEMA,
    TariffGridsFilteringQuery,
    TariffGridsFilteringQueryParams,
} from "app/screens/invoicing/filtering/tariffGridFiltering.types";

function parseQuery(queryString: string): TariffGridsFilteringQuery {
    const parsedParams = parseQueryString(queryString, {arrayFormat: "comma"});
    return {
        ...parsedParams,
        client__in: Arrayify(parsedParams.client__in ?? []),
        owner_type__in: Arrayify(parsedParams.owner_type__in ?? []),
        status__in: Arrayify(parsedParams.status__in ?? []),
        load_category__in: Arrayify(parsedParams.load_category__in ?? []),
        text: Arrayify(parsedParams.text ?? []),
    };
}

function parseQuerySchema(query: TariffGridsFilteringQuery): TariffGridsFilteringQuery {
    const result = TARIFF_GRIDS_FILTERING_SCHEMA.parse(query);
    return result as TariffGridsFilteringQuery; // cast because of the ordering type
}

function isQueryEmpty(query: TariffGridsFilteringQuery): boolean {
    return (
        (query.client__in?.length ?? 0) === 0 &&
        (query.owner_type__in?.length ?? 0) === 0 &&
        (query.status__in?.length ?? 0) === 0 &&
        (query.load_category__in?.length ?? 0) === 0 &&
        (query.text?.length ?? 0) === 0
    );
}

// Update backend TariffGridViewSet, TariffGridFilter and TariffGridOrderingFilter along with this
function getQueryParamsFromFiltersQuery(
    query: TariffGridsFilteringQuery
): TariffGridsFilteringQueryParams {
    const queryParams = cloneDeep(query) as TariffGridsFilteringQueryParams;

    if (queryParams.ordering) {
        const columnName = queryParams.ordering.replace(/^-/, "");

        if (columnName === "origin" || columnName === "destination" || columnName === "clients") {
            queryParams.ordering += "_description";
        }
    }

    return queryParams;
}

export const tariffGridFilteringService = {
    parseQuery,
    parseQuerySchema,
    isQueryEmpty,
    getQueryParamsFromFiltersQuery,
};
