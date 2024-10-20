import {arrayToObject} from "@dashdoc/web-common/src/features/filters/filters.service";
import React, {useState} from "react";

import {
    FiltersTruckers,
    FiltersTruckersValue,
} from "app/features/filters/badges-and-selectors/fleet/trucker/FiltersTruckers";

type TruckersSelectProps = {
    resourcesUids: string[];
    setResourcesUids: (resourcesUids: string[]) => void;
    sortAndFilters?: {ordering?: string; tags__in?: string[]; extended_view?: boolean};
};

export function TruckersSelect({
    resourcesUids,
    setResourcesUids,
    sortAndFilters,
}: TruckersSelectProps) {
    const [truckers, setTruckers] = useState({});
    const setLoadedTruckers = (values: FiltersTruckersValue) => {
        setTruckers((prev) => ({...prev, ...arrayToObject(values)}));
    };
    return (
        <FiltersTruckers
            currentQuery={{trucker__in: resourcesUids}}
            updateQuery={(query: {trucker__in: string[]}) => {
                setResourcesUids(query.trucker__in ?? []);
            }}
            truckers={truckers}
            setLoadedTruckers={setLoadedTruckers}
            selectionOnly
            sortAndFilters={sortAndFilters}
            key={JSON.stringify(sortAndFilters)}
        />
    );
}
