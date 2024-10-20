import {useCallback} from "react";
import createPersistedState from "use-persisted-state";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";

const PREDEFINED_FILTERS_STORAGE_KEY = "scheduler.predefinedFilters";
const predefinedFiltersState = createPersistedState(PREDEFINED_FILTERS_STORAGE_KEY);

export function usePredefinedFilters() {
    /**
     * useState / useRef / others hooks
     **/
    const [predefinedFilters, setPredefinedFilters] = predefinedFiltersState<SchedulerFilters>({});

    /**
     * useCallback
     **/

    const updatePredefinedData = useCallback(
        (query: SchedulerFilters) => {
            // @ts-ignore
            setPredefinedFilters((prevPredefinedFilters) => ({
                ...prevPredefinedFilters,
                period: query.period,
                start_date: query.period ? null : query.start_date,
                end_date: query.period ? null : query.end_date,
                pool_period: query.pool_period,
                pool_start_date: query.pool_period ? null : query.pool_start_date,
                pool_end_date: query.pool_period ? null : query.pool_end_date,
                trucker__in: query.trucker__in,
                vehicle__in: query.vehicle__in,
                trailer__in: query.trailer__in,
                fleet_tags__in: query.fleet_tags__in,
                tags__in: query.tags__in,
                shipper__in: query.shipper__in,
                carrier__in: query.carrier__in,
                address__in: query.address__in,
                origin_address__in: query.origin_address__in,
                destination_address__in: query.destination_address__in,
                address_text: query.address_text,
                address_postcode__in: query.address_postcode__in,
                address_country__in: query.address_country__in,
                origin_address_text: query.origin_address_text,
                origin_address_postcode__in: query.origin_address_postcode__in,
                origin_address_country__in: query.origin_address_country__in,
                destination_address_text: query.destination_address_text,
                destination_address_postcode__in: query.destination_address_postcode__in,
                destination_address_country__in: query.destination_address_country__in,
                view: query.view,
                ordering_truckers: query.ordering_truckers,
                ordering_vehicles: query.ordering_vehicles,
                ordering_trailers: query.ordering_trailers,
            }));
        },
        [setPredefinedFilters]
    );

    return {
        predefinedFilters,
        updatePredefinedData,
    };
}
