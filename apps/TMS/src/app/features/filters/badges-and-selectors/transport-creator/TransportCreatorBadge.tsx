import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {ReactNode} from "react";

import {TransportCreatorsQuery} from "./transportCreatorFilter.types";

type TransportCreatorsBadgeProps = {
    query: TransportCreatorsQuery;
    updateQuery: (query: TransportCreatorsQuery) => void;
};

export function TransportCreatorBadge({query, updateQuery}: TransportCreatorsBadgeProps) {
    return (
        <FilteringListBadge
            queryKey={"creator__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-creator"
        />
    );
    function getLabel(count: number) {
        let label: ReactNode = `${t("transportsColumns.createdBy")} (1)`;

        if (count > 1) {
            label = `${t("transportsColumns.createdBy")} (${count})`;
        }
        return label;
    }
}
