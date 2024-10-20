import {FilterData, FilteringBadge} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import React from "react";

import {TransportTypesQuery} from "app/features/filters/badges-and-selectors/transport-custom/transportFilter.types";

export function getTransportTypesFilterBadges(): FilterData<TransportTypesQuery> {
    return {
        key: "transport-custom",
        testId: "transport-custom",
        selector: null,
        getBadges: (query, updateQuery) => [
            {
                count: query.is_order !== null && query.is_order !== undefined ? 1 : 0,
                badge: (
                    <FilteringBadge
                        icon="cart"
                        label={
                            query.is_order == true
                                ? t("filters.onlyOrders").toLowerCase()
                                : t("filters.onlyTransports").toLowerCase()
                        }
                        onDelete={() =>
                            updateQuery({
                                is_order: null,
                            })
                        }
                    />
                ),
            },
            {
                count: query.is_child !== null && query.is_child !== undefined ? 1 : 0,
                badge: (
                    <FilteringBadge
                        label={
                            query.is_child
                                ? "components.subcontractedOrders"
                                : "components.clientOrders"
                        }
                        onDelete={() =>
                            updateQuery({
                                is_child: null,
                            })
                        }
                        data-testid="filters-badges-transport-type"
                    />
                ),
            },
        ],
    };
}
