import {useEffect, useState} from "react";

import {FiltersState, FilterState} from "moderation/network-map/types";

type UseSavedFiltersReturnType = [
    filters: FiltersState,
    updateFilter: (name: string, newFilter: FilterState[]) => void,
    removeFilter: (name: string) => void,
];

export const useSavedFilters = (initialFilters: FiltersState): UseSavedFiltersReturnType => {
    const [filters, setFilters] = useState<FiltersState>(() => {
        const savedFilters = localStorage.getItem("mapFilters");
        if (savedFilters) {
            return JSON.parse(savedFilters);
        } else {
            return initialFilters;
        }
    });

    useEffect(() => {
        localStorage.setItem("mapFilters", JSON.stringify(filters));
    }, [filters]);

    const updateFilter = (name: string, newFilter: FilterState[]) => {
        setFilters((prevFilters) => {
            return {...prevFilters, [name]: newFilter};
        });
    };

    const removeFilter = (name: string) => {
        setFilters((prevFilters) => {
            const {[name]: removedFilter, ...rest} = prevFilters;
            return rest;
        });
    };

    return [filters, updateFilter, removeFilter];
};
