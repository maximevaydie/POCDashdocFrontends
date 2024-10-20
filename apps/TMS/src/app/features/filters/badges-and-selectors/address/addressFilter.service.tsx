import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {AddressByCriteriaBadge} from "app/features/filters/badges-and-selectors/address-by-criteria/AddressByCriteriaBadges";
import {AddressesCriteriaQuery} from "app/features/filters/badges-and-selectors/address-by-criteria/addressByCriteriaFilter.types";

import {AddressBadge} from "./AddressBadges";
import {AddressesQuery} from "./addressFilter.types";
import {AddressSelector} from "./AddressSelector";

export function getAddressFilter(
    hasFilteringImprovementsEnabled: boolean
): FilterData<AddressesQuery & AddressesCriteriaQuery> {
    return {
        key: "addresses",
        testId: "addresses",
        selector: {
            label: t("filter.siteByAddress"),
            icon: "address",
            getFilterSelector: (query, updateQuery, dataType) => (
                <AddressSelector
                    query={query}
                    updateQuery={updateQuery}
                    initialDataType={dataType}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["address__in"]?.length ?? 0,
                badge: (
                    <AddressBadge
                        key="address"
                        query={query}
                        updateQuery={updateQuery}
                        type="all"
                    />
                ),
                selectorDataType: "address",
            },
            {
                count: query["origin_address__in"]?.length ?? 0,
                badge: (
                    <AddressBadge
                        key="origin_address"
                        query={query}
                        updateQuery={updateQuery}
                        type="origin"
                    />
                ),
                selectorDataType: "origin_address",
            },
            {
                count: query["destination_address__in"]?.length ?? 0,
                badge: (
                    <AddressBadge
                        key="destination_address"
                        query={query}
                        updateQuery={updateQuery}
                        type="destination"
                    />
                ),
                selectorDataType: "destination_address",
            },
            ...(hasFilteringImprovementsEnabled
                ? []
                : [
                      {
                          count:
                              query["address_postcode__in"] ||
                              query["address_country__in"] ||
                              query["address_text"]
                                  ? 1
                                  : 0,
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
                  ]),
        ],
    };
}
