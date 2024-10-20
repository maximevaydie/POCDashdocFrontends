import {FilteringListBadge} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringBadge";
import {t} from "@dashdoc/web-core";
import React, {FunctionComponent, ReactNode} from "react";

import {ShippersQuery} from "./shipperFilter.types";

type ShipperBadgeProps = {
    query: ShippersQuery;
    updateQuery: (query: ShippersQuery) => void;
};

export const ShipperBadge: FunctionComponent<ShipperBadgeProps> = ({query, updateQuery}) => {
    return (
        <FilteringListBadge
            queryKey={"shipper__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-shipper"
        />
    );
    function getLabel(count: number) {
        let label: ReactNode = `1 ${t("common.shipper").toLowerCase()}`;

        // if (count === 1 && shippers) {
        //     label = <CompanyName company={shippers[queryValue[0]] as Partial<Company>} />;
        // }
        if (count > 1) {
            label = `${count} ${t("common.shippers").toLowerCase()}`;
        }
        return label;
    }
};
