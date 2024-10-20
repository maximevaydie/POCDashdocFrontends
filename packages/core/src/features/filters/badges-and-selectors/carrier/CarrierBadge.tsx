import {t} from "@dashdoc/web-core";
import React, {ReactNode} from "react";

import {FilteringListBadge} from "../generic/FilteringBadge";

import {CarriersQuery} from "./carrierFilter.types";

type CarrierBadgeProps = {
    isOrderTab: boolean;
    query: CarriersQuery;
    updateQuery: (query: CarriersQuery) => void;
};

export function CarrierBadge({query, updateQuery, isOrderTab = false}: CarrierBadgeProps) {
    return (
        <FilteringListBadge
            queryKey={"carrier__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-carrier"
        />
    );
    function getLabel(count: number) {
        if (isOrderTab) {
            return t("common.charteredCarriers", {smart_count: count});
        }
        let label: ReactNode = `1 ${t("common.carrier").toLowerCase()}`;

        if (count > 1) {
            label = `${count} ${t("common.carriers").toLowerCase()}`;
        }
        return label;
    }
}
