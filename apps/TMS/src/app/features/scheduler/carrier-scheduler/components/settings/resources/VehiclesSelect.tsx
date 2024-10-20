import {arrayToObject} from "@dashdoc/web-common/src/features/filters/filters.service";
import React, {useState} from "react";

import {
    FiltersVehicles,
    FiltersVehiclesValue,
} from "app/features/filters/badges-and-selectors/fleet/vehicle/FiltersVehicles";

type VehiclesSelectProps = {
    resourcesUids: string[];
    setResourcesUids: (resourcesUids: string[]) => void;
    sortAndFilters?: {ordering?: string; tags__in?: string[]; extended_view?: boolean};
};

export function VehiclesSelect({
    resourcesUids,
    setResourcesUids,
    sortAndFilters,
}: VehiclesSelectProps) {
    const [vehicles, setVehicles] = useState({});
    const setLoadedVehicles = (values: FiltersVehiclesValue) => {
        setVehicles((prev) => ({...prev, ...arrayToObject(values)}));
    };
    return (
        <FiltersVehicles
            currentQuery={{vehicle__in: resourcesUids}}
            updateQuery={(query: {vehicle__in: string[]}) => {
                setResourcesUids(query.vehicle__in ?? []);
            }}
            vehicles={vehicles}
            setLoadedVehicles={setLoadedVehicles}
            selectionOnly
            sortAndFilters={sortAndFilters}
            key={JSON.stringify(sortAndFilters)}
        />
    );
}
