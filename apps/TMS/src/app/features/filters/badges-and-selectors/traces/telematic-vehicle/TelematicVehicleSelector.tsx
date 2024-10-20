import {usePaginatedFetch} from "@dashdoc/web-common";
import {SearchableItemsSelector} from "@dashdoc/web-ui";
import {TelematicVehicleData} from "dashdoc-utils";
import React, {useMemo, useState} from "react";

import {useExtendedView} from "app/hooks/useExtendedView";

import {TelematicVehiclesQuery} from "./telematicVehicleFilter.types";

type Props = {
    query: TelematicVehiclesQuery;
    updateQuery: (query: TelematicVehiclesQuery) => void;
};

type TelematicVehiclePlates = {
    license_plate: string;
    telematic_vehicles: TelematicVehicleData[];
};

function groupByLicensePlate(telematicVehicles: TelematicVehicleData[]): TelematicVehiclePlates[] {
    const plates: Map<string, TelematicVehiclePlates> = new Map();

    for (const telematicVehicle of telematicVehicles) {
        const plate = telematicVehicle.vehicle.license_plate;
        if (!plates.has(plate)) {
            plates.set(plate, {license_plate: plate, telematic_vehicles: []});
        }
        plates.get(plate)?.telematic_vehicles.push(telematicVehicle);
    }

    return Array.from(plates.values());
}

export function TelematicVehicleSelector({query, updateQuery}: Props) {
    const {extendedView} = useExtendedView();

    const [searchText, setSearchText] = useState("");

    const {items, hasNext, loadNext, loadAll, isLoading} = usePaginatedFetch<TelematicVehicleData>(
        "telematics/telematic-vehicles/",
        {
            has_license_plate: "true",
            ordering: "license_plate",
            extended_view: extendedView,
            ["vehicle__license_plate__icontains"]: searchText,
        },
        {apiVersion: "v4"}
    );

    const telematicVehicles = useMemo(() => groupByLicensePlate(items), [items]);

    return (
        <SearchableItemsSelector<TelematicVehiclePlates>
            items={telematicVehicles}
            getItemId={({license_plate}: TelematicVehiclePlates) => license_plate}
            getItemLabel={({license_plate}: TelematicVehiclePlates) => license_plate}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            values={query.telematic_vehicle_plate__in ?? []}
            onChange={(value) => {
                updateQuery({telematic_vehicle_plate__in: value});
            }}
            enableSelectAll={true}
            hasMore={hasNext}
            loadAll={loadAll}
            loadNext={loadNext}
            isLoading={isLoading}
            listContainerStyle={{maxHeight: "300px"}}
        />
    );
}
