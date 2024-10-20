import {FilterData} from "@dashdoc/web-common/src/features/filters/filtering-bar/filtering.types";
import {t} from "@dashdoc/web-core";
import React from "react";

import {PlatesBadge} from "./PlatesBadge";
import {PlatesQuery} from "./platesFilter.types";
import {PlatesSelector} from "./PlatesSelector";

export function getFleetPlatesFilter(): FilterData<PlatesQuery> {
    return {
        key: "fleet-items-plates",
        testId: "fleet-items-plates",
        selector: {
            label: t("common.licensePlates"),
            icon: "truck",
            getFilterSelector: (query, updateQuery) => (
                <PlatesSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["license_plate__in"]?.length ?? 0,
                badge: <PlatesBadge key="license_plate" query={query} updateQuery={updateQuery} />,
            },
        ],
    };
}
