import {FilterData} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {SubcontractedCarrierBadge} from "app/features/filters/badges-and-selectors/subcontracting/SubcontractedCarrierBadge";
import {SubcontractedCarrierSelector} from "app/features/filters/badges-and-selectors/subcontracting/SubcontractedCarrierSelector";

export type SubcontractedCarrierQuery = {
    subcontracted_carrier__in?: Array<string>;
};

export function getSubcontractedCarrierFilter(): FilterData<SubcontractedCarrierQuery> {
    return {
        key: "subcontracted_carrier",
        testId: "subcontracted_carrier",
        selector: {
            label: t("charteredCarrier.title"),
            icon: "charter",
            getFilterSelector: (query, updateQuery) => (
                <SubcontractedCarrierSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["subcontracted_carrier__in"]?.length ?? 0,
                badge: (
                    <SubcontractedCarrierBadge
                        key="subcontracted_carrier"
                        query={query}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}
