import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Trailer} from "dashdoc-utils";
import React, {useCallback} from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";
import {useExtendedView} from "app/hooks/useExtendedView";

import {VehiclesQuery} from "./vehicleFilter.types";

type Props = {
    query: VehiclesQuery;
    updateQuery: (query: VehiclesQuery) => void;
    sortAndFilters?: {
        id__in?: string[];
    };
};

export function VehicleSelector({query, updateQuery, sortAndFilters}: Props) {
    const {extendedView} = useExtendedView();
    const formatItemLabel = useCallback(
        ({license_plate, fleet_number}: Trailer) => (
            <Box display="inline-block" maxWidth="100%">
                <VehicleLabel vehicle={{license_plate, fleet_number}} flexWrap="wrap" />
            </Box>
        ),
        []
    );

    return (
        <>
            <FilteringHeader dataTypeLabel={t("common.vehicle")} conditionLabel={t("filter.in")} />
            <FilteringPaginatedListSelector<Trailer>
                fetchItemsUrl="vehicles/"
                searchQueryKey="text"
                additionalQueryParams={{
                    has_license_plate: "true",
                    ordering: "license_plate",
                    extended_view: extendedView,
                    ...sortAndFilters,
                }}
                getItemId={(item) => `${item.pk}`}
                getItemLabel={formatItemLabel}
                values={query.vehicle__in ?? []}
                onChange={(value) => updateQuery({vehicle__in: value})}
            />
        </>
    );
}
