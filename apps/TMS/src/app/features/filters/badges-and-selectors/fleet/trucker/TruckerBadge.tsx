import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent} from "react";

import {TruckersQuery} from "./truckerFilter.types";

type TruckerBadgeProps = {
    query: TruckersQuery;
    updateQuery: (query: TruckersQuery) => void;
};

export const TruckerBadge: FunctionComponent<TruckerBadgeProps> = ({query, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={"trucker__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-trucker"
        />
    );

    function getLabel(count: number) {
        return `${count} ${t("common.truckers", {
            smart_count: count,
        })}`;
    }
};
