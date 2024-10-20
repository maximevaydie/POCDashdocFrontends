import {
    FilteringHeader,
    FilteringListBadge,
    FilteringPaginatedListSelector,
    FilterData,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {RequestedVehicle} from "dashdoc-utils";
import React from "react";

type RequestedVehicleTypeQuery = {
    requested_vehicle__in?: string[];
};

export function getRequestedVehicleTypeFilter(): FilterData<RequestedVehicleTypeQuery> {
    return {
        key: "requested-vehicle",
        testId: "requested-vehicle",
        selector: {
            label: t("common.vehicleType"),
            icon: "truck",
            getFilterSelector: (query, updateQuery) => (
                <RequestedVehicleTypeSelector query={query} updateQuery={updateQuery} />
            ),
        },
        getBadges: (query, updateQuery) => [
            {
                count: query["requested_vehicle__in"]?.length ?? 0,
                badge: (
                    <RequestedVehicleTypeBadge
                        key="requested-requested_vehicle"
                        query={query}
                        updateQuery={updateQuery}
                    />
                ),
            },
        ],
    };
}

type RequestedVehicleTypeSelectorProps = {
    query: RequestedVehicleTypeQuery;
    updateQuery: (query: RequestedVehicleTypeQuery) => void;
};
function RequestedVehicleTypeSelector({query, updateQuery}: RequestedVehicleTypeSelectorProps) {
    return (
        <>
            <FilteringHeader
                dataTypeLabel={t("common.vehicleType")}
                conditionLabel={t("filter.in")}
            />
            <FilteringPaginatedListSelector<RequestedVehicle>
                fetchItemsUrl="requested-vehicles/"
                apiVersion="web"
                searchQueryKey="text"
                getItemId={(requestedVehicle) => `${requestedVehicle.label}`}
                getItemLabel={formatItemLabel}
                values={query.requested_vehicle__in ?? []}
                onChange={(value) => updateQuery({requested_vehicle__in: value})}
            />
        </>
    );

    function formatItemLabel(requestedVehicle: RequestedVehicle) {
        return requestedVehicle.complementary_information
            ? `${requestedVehicle.label}, ${requestedVehicle.complementary_information}`
            : requestedVehicle.label;
    }
}

function RequestedVehicleTypeBadge({query, updateQuery}: RequestedVehicleTypeSelectorProps) {
    return (
        <FilteringListBadge
            queryKey={"requested_vehicle__in"}
            query={query}
            updateQuery={updateQuery}
            getLabel={getLabel}
            data-testid="badge-requested-vehicle-type"
        />
    );
    function getLabel(count: number) {
        return `${count} ${t("common.vehicleType").toLowerCase()}`;
    }
}
