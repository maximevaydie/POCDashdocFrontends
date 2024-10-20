import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {AddressByCriteriaBadge} from "./AddressByCriteriaBadges";
import {AddressesCriteriaQuery} from "./addressByCriteriaFilter.types";
import {AddressByCriteriaSelector} from "./AddressByCriteriaSelector";

export function getAddressByCriteriaFilter(): FilterData<AddressesCriteriaQuery> {
    return {
        key: "postcodes",
        testId: "postcodes",
        selector: {
            label: t("filter.siteByCriteria"),
            icon: "address",
            getFilterSelector: (query, updateQuery, dataType) => (
                <AddressByCriteriaSelector
                    query={query}
                    updateQuery={updateQuery}
                    initialDataType={dataType}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["address_postcode__in"] || query["address_country__in"] ? 1 : 0,
                badge: (
                    <AddressByCriteriaBadge
                        key="addressByCriteria"
                        query={query}
                        updateQuery={updateQuery}
                        type="all"
                    />
                ),
                selectorDataType: "address",
            },
            {
                count:
                    query["origin_address_postcode__in"] || query["origin_address_country__in"]
                        ? 1
                        : 0,
                badge: (
                    <AddressByCriteriaBadge
                        key="originAddressByCriteria"
                        query={query}
                        updateQuery={updateQuery}
                        type="origin"
                    />
                ),
                selectorDataType: "origin_address",
            },
            {
                count:
                    query["destination_address_postcode__in"] ||
                    query["destination_address_country__in"]
                        ? 1
                        : 0,
                badge: (
                    <AddressByCriteriaBadge
                        key="destinationAddressByCriteria"
                        query={query}
                        updateQuery={updateQuery}
                        type="destination"
                    />
                ),
                selectorDataType: "destination_address",
            },
        ],
    };
}
