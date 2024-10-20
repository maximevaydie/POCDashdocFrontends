import {FilteringListBadge} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

type SubcontractedCarrierQuery = {
    subcontracted_carrier__in?: Array<string>;
};
type CarrierBadgeProps = {
    query: SubcontractedCarrierQuery;
    updateQuery: (query: SubcontractedCarrierQuery) => void;
};

export function SubcontractedCarrierBadge({query, updateQuery}: CarrierBadgeProps) {
    return (
        <FilteringListBadge
            queryKey={"subcontracted_carrier__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={(count) => t("common.charteredCarriers", {smart_count: count})}
            data-testid="badge-subcontracted_carrier"
        />
    );
}
