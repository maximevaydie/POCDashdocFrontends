import {t} from "@dashdoc/web-core";
import {APIVersion} from "dashdoc-utils";
import React from "react";

import {FilterData} from "../../filtering-bar/filtering.types";

import {CarrierBadge} from "./CarrierBadge";
import {CarriersQuery} from "./carrierFilter.types";
import {CarrierSelector} from "./CarrierSelector";

type CarrierFilterParams = {
    fetchParams?: {
        url?: string;
        searchQueryKey?: string;
        apiVersion?: APIVersion;
    };
    isOrderTab?: boolean;
};

export function getCarrierFilter({
    fetchParams = undefined,
    isOrderTab = false,
}: CarrierFilterParams = {}): FilterData<CarriersQuery> {
    return {
        key: "carrier",
        testId: "carrier",
        selector: {
            label: isOrderTab ? t("charteredCarrier.title") : t("common.carrier"),
            icon: "carrier",
            getFilterSelector: (query, updateQuery) => (
                <CarrierSelector
                    isOrderTab={isOrderTab}
                    query={query}
                    updateQuery={updateQuery}
                    fetchParams={fetchParams}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["carrier__in"]?.length ?? 0,
                badge: (
                    <CarrierBadge
                        key="carrier"
                        isOrderTab={isOrderTab}
                        query={query}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}
