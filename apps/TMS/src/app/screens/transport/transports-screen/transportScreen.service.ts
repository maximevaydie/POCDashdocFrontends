// eslint-disable-next-line check-file/folder-naming-convention
import {Arrayify} from "@dashdoc/web-common";
import {
    TransportsBusinessStatus,
    OrdersBusinessStatus,
} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {parseQueryString} from "dashdoc-utils";

import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";
import {SidebarTabNames} from "app/types/constants";
import {BaseFilterParams} from "app/types/filters";

export class TransportsUrlWithoutParametersError extends Error {}

export const baseParseQuery = (
    queryString: string,
    hasFilteringImprovementsEnabled: boolean
): BaseFilterParams => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        arrayFormat: "comma",
    });

    const {type_of_dates = "real"} = parsedParams;
    if (!hasFilteringImprovementsEnabled) {
        if (parsedParams.start_date || parsedParams.end_date || parsedParams.period) {
            parsedParams.type_of_dates = type_of_dates;
        }
    }

    return {
        ...parsedParams,
        // when arrays contain only one value they will be returned as a string
        // so we have to "arrayify" them in that case
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
        address__in: Arrayify(parsedParams.address__in || []),
        origin_address__in: Arrayify(parsedParams.origin_address__in || []),
        destination_address__in: Arrayify(parsedParams.destination_address__in || []),
        shipper__in: Arrayify(parsedParams.shipper__in || []),
        parent_shipper__in: Arrayify(parsedParams.parent_shipper__in || []),
        debtor__in: Arrayify(parsedParams.debtor__in || []),
        carrier__in: Arrayify(parsedParams.carrier__in || []),
        subcontracted_carrier__in: Arrayify(parsedParams.subcontracted_carrier__in || []),
        creator__in: Arrayify(parsedParams.creator__in || []),
        trucker__in: Arrayify(parsedParams.trucker__in || []),
        fleet_tags__in: Arrayify(parsedParams.fleet_tags__in || []),
        tags__in: Arrayify(parsedParams.tags__in || []),
        invoicing_status__in: Arrayify(parsedParams.invoicing_status__in || []) as (
            | "verified"
            | "draft"
            | "final"
            | "paid"
        )[],
        transport_status__in: Arrayify(
            parsedParams.transport_status__in || []
        ) as TransportsBusinessStatus[],
        order_status__in: Arrayify(parsedParams.order_status__in || []) as OrdersBusinessStatus[],
    };
};

const parseQuery = (
    queryString: string,
    defaultTab: TransportsScreenQuery["tab"]
): TransportsScreenQuery => {
    const parsedParams = baseParseQuery(queryString, true) as TransportsScreenQuery;

    // This output will be used as a lookup key for the cache
    // which is fed by fetchTransports... utils. Thus if this
    // result and the query used in fetchTransports mismatch
    // cache will be missed and results will be empty!
    return {
        // @ts-ignore
        tab: defaultTab,
        ...parsedParams,
    };
};

function getCurrentQueryFromUrl(locationSearch: string): TransportsScreenQuery {
    let newQuery = parseQuery(locationSearch, SidebarTabNames.DASHBOARD);
    (
        [
            "address_country__in",
            "address_postcode__in",
            "origin_address_country__in",
            "origin_address_postcode__in",
            "destination_address_country__in",
            "destination_address_postcode__in",
        ] as Array<
            keyof Pick<
                TransportsScreenQuery,
                | "address_country__in"
                | "address_postcode__in"
                | "origin_address_country__in"
                | "origin_address_postcode__in"
                | "destination_address_country__in"
                | "destination_address_postcode__in"
            >
        >
    ).map((queryKey) => {
        const value = newQuery[queryKey];
        if (Array.isArray(value)) {
            newQuery[queryKey] = value.join(",");
        }
    });

    if (!newQuery.isExtendedSearch && !newQuery.business_status) {
        throw new TransportsUrlWithoutParametersError();
    }

    return newQuery;
}

export const transportScreenService = {
    getCurrentQueryFromUrl,
    baseParseQuery,
};
