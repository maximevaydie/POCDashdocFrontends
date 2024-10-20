import {arrayToObject} from "@dashdoc/web-common/src/features/filters/filters.service";
import React, {useState} from "react";

import {
    FiltersTrailers,
    FiltersTrailersValue,
} from "app/features/filters/badges-and-selectors/fleet/trailer/FiltersTrailers";

type TrailersSelectProps = {
    resourcesUids: string[];
    setResourcesUids: (resourcesUids: string[]) => void;
    sortAndFilters?: {ordering?: string; tags__in?: string[]; extended_view?: boolean};
};

export function TrailersSelect({
    resourcesUids,
    setResourcesUids,
    sortAndFilters,
}: TrailersSelectProps) {
    const [trailers, setTrailers] = useState({});
    const setLoadedTrailers = (values: FiltersTrailersValue) => {
        setTrailers((prev) => ({...prev, ...arrayToObject(values)}));
    };
    return (
        <FiltersTrailers
            currentQuery={{trailer__in: resourcesUids}}
            updateQuery={(query: {trailer__in: string[]}) => {
                setResourcesUids(query.trailer__in ?? []);
            }}
            trailers={trailers}
            setLoadedTrailers={setLoadedTrailers}
            selectionOnly
            sortAndFilters={sortAndFilters}
            key={JSON.stringify(sortAndFilters)}
        />
    );
}
