import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {ShipperBadge} from "./ShipperBadge";
import {ShippersQuery} from "./shipperFilter.types";
import {ShipperSelector} from "./ShipperSelector";

export function getShipperFilter(): FilterData<ShippersQuery> {
    return {
        key: "shipper",
        testId: "shipper",
        selector: {
            label: t("common.shipper"),
            icon: "shipper",
            getFilterSelector: (query, updateQuery) => (
                <ShipperSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["shipper__in"]?.length ?? 0,
                badge: <ShipperBadge key="shipper" query={query} updateQuery={updateQuery} />,
            },
        ],
    };
}
