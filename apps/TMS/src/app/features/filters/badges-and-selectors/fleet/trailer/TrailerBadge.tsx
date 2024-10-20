import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {TrailersQuery} from "./trailerFilter.types";

type TrailerBadgeProps = {
    query: TrailersQuery;
    updateQuery: (query: TrailersQuery) => void;
};

export const TrailerBadge: FunctionComponent<TrailerBadgeProps> = ({query, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={"trailer__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-trailer"
        />
    );
    ``;
    function getLabel(count: number) {
        let label: ReactNode = `1 ${t("common.trailer").toLowerCase()}`;

        if (count > 1) {
            label = `${count} ${t("common.trailers").toLowerCase()}`;
        }
        return label;
    }
};
