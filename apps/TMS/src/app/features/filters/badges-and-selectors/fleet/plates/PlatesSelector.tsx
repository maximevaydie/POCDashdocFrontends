import {FilteringPaginatedListSelector} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringPaginatedListSelector";
import {FilteringHeader} from "@dashdoc/web-common/src/features/filters/badges-and-selectors/generic/FilteringSelectorHeader";
import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Trailer} from "dashdoc-utils";
import React, {useCallback} from "react";

import {VehicleLabel} from "app/features/fleet/vehicle/VehicleLabel";

import {PlatesQuery} from "./platesFilter.types";

type Props = {
    query: PlatesQuery;
    updateQuery: (query: PlatesQuery) => void;
};

export function PlatesSelector({query, updateQuery}: Props) {
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
            <FilteringHeader
                dataTypeLabel={t("common.licensePlates")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<Trailer>
                fetchItemsUrl="unified-fleet/"
                searchQueryKey="text"
                getItemId={(item) => `${item.license_plate}`}
                getItemLabel={formatItemLabel}
                values={query.license_plate__in ?? []}
                onChange={(value) => updateQuery({license_plate__in: value})}
            />
        </>
    );
}
