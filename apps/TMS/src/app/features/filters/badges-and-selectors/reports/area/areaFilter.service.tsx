import {FilteringBadge, FilterData} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex} from "@dashdoc/web-ui";
import {Area} from "dashdoc-utils";
import React from "react";

import {AreaSelector} from "./AreaSelector";

type AreaQuery = {
    origin_area?: Area | null;
    destination_area?: Area | null;
};

export function getAreaFilter(type: "origin" | "destination"): FilterData<AreaQuery> {
    const label = type === "origin" ? t("common.origin") : t("common.destination");

    return {
        key: `${type}_area`,
        testId: `${type}_area`,
        selector: {
            label,
            icon: "area",
            getFilterSelector: (query, updateQuery) => (
                <AreaSelector
                    onChange={(area) => updateQuery({[`${type}_area`]: area})}
                    defaultArea={query[`${type}_area`]}
                    title={label}
                />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: hasAreaSelected(type, query) ? 1 : 0,
                badge: (
                    <FilteringBadge
                        onDelete={() => updateQuery({[`${type}_area`]: null})}
                        label={
                            <Flex minHeight="22px" alignItems="center">
                                {`${label} : ${query[`${type}_area`]?.name}`}
                            </Flex>
                        }
                        data-testid={`${type}-area-badge`}
                    />
                ),
            },
        ],
    };
}

function hasAreaSelected(type: "origin" | "destination", query: AreaQuery) {
    return query[`${type}_area`]?.places && (query[`${type}_area`] as Area).places.length > 0;
}
