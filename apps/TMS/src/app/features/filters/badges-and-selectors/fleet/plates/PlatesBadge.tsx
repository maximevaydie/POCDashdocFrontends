import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent} from "react";

import {PlatesQuery} from "./platesFilter.types";

type Props = {
    query: PlatesQuery;
    updateQuery: (query: PlatesQuery) => void;
};

export const PlatesBadge: FunctionComponent<Props> = ({query, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={"license_plate__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-fleet-items-plates"
        />
    );
    ``;
    function getLabel(count: number) {
        return `${count} ${t("common.licensePlates", {
            smart_count: count,
        })}`;
    }
};
