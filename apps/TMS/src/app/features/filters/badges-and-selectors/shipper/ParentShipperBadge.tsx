import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent} from "react";

import {ParentShippersQuery} from "app/features/filters/badges-and-selectors/shipper/ParentShipperFilter.types";

type ParentShipperBadgeProps = {
    query: ParentShippersQuery;
    updateQuery: (query: ParentShippersQuery) => void;
};

export const ParentShipperBadge: FunctionComponent<ParentShipperBadgeProps> = ({
    query,
    updateQuery,
}) => {
    return (
        <FilteringListBadge
            queryKey={"parent_shipper__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={(count) => t("common.xParentShippers", {smart_count: count})}
            data-testid="badge-parent_shipper"
        />
    );
};
