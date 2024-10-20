import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {ParentShipperBadge} from "app/features/filters/badges-and-selectors/shipper/ParentShipperBadge";
import {ParentShippersQuery} from "app/features/filters/badges-and-selectors/shipper/ParentShipperFilter.types";
import {ParentShipperSelector} from "app/features/filters/badges-and-selectors/shipper/ParentShipperSelector";

export function getParentShipperFilter(): FilterData<ParentShippersQuery> {
    return {
        key: "parent_shipper",
        testId: "parent_shipper",
        selector: {
            label: t("common.parent_shipper"),
            icon: "shipper",
            getFilterSelector: (query, updateQuery) => (
                <ParentShipperSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["parent_shipper__in"]?.length ?? 0,
                badge: (
                    <ParentShipperBadge
                        key="parent_shipper"
                        query={query}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}
