import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TransportCreatorBadge} from "./TransportCreatorBadge";
import {TransportCreatorsQuery} from "./transportCreatorFilter.types";
import {TransportCreatorSelector} from "./TransportCreatorSelector";

export function getTransportCreatorFilter(): FilterData<TransportCreatorsQuery> {
    return {
        key: "creator",
        testId: "creator",
        selector: {
            label: t("transportsColumns.createdBy"),
            icon: "creator",
            getFilterSelector: (query, updateQuery) => (
                <TransportCreatorSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["creator__in"]?.length ?? 0,
                badge: (
                    <TransportCreatorBadge key="creator" query={query} updateQuery={updateQuery} />
                ),
            },
        ],
    };
}
