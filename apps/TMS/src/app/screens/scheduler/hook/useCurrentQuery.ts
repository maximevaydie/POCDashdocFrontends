import {Arrayify, usePreselectedFilters} from "@dashdoc/web-common";
import {retrieveSettingsViewIfNeeded} from "@dashdoc/web-common/src/redux/reducers/settingsViewsReducer";
import {Logger} from "@dashdoc/web-core";
import {parseQueryString} from "dashdoc-utils";
import {useCallback, useEffect, useState} from "react";
import {useLocation} from "react-router";

import {SchedulerFilters} from "app/features/scheduler/carrier-scheduler/components/filters/filters.types";
import {getDefaultSchedulerResourceSettings} from "app/features/scheduler/carrier-scheduler/hooks/useSchedulerViews";
import {
    PoolOfUnplannedSettingsSchema,
    SchedulerSettingsSchema,
} from "app/features/scheduler/carrier-scheduler/schedulerSettingsView.types";
import {DEFAULT_POOL_SETTINGS} from "app/features/scheduler/carrier-scheduler/trip-scheduler/unplanned-trips/constant";
import {preselectedPoolSortState} from "app/features/trip/pool-of-unplanned-trips/hook/usePreselectedPoolSort";
import useIsCarrier from "app/hooks/useIsCarrier";
import {useDispatch} from "app/redux/hooks";
import {SidebarTabNames} from "app/types/constants";

const parseQuery = (queryString: string): SchedulerFilters => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        arrayFormat: "comma",
    });
    return {
        ...parsedParams,
        trucker__in: Arrayify(parsedParams.trucker__in || []),
        vehicle__in: Arrayify(parsedParams.vehicle__in || []),
        trailer__in: Arrayify(parsedParams.trailer__in || []),
        fleet_tags__in: Arrayify(parsedParams.fleet_tags__in || []),
        tags__in: Arrayify(parsedParams.tags__in || []),
        shipper__in: Arrayify(parsedParams.shipper__in || []),
        carrier__in: Arrayify(parsedParams.carrier__in || []),
        address__in: Arrayify(parsedParams.address__in || []),
        origin_address__in: Arrayify(parsedParams.origin_address__in || []),
        destination_address__in: Arrayify(parsedParams.destination_address__in || []),
        tab: SidebarTabNames.CARRIER_SCHEDULER,
    };
};

export const getDefaultSchedulerQuery = (isCarrier: boolean): SchedulerFilters => {
    const view = isCarrier ? "trucker" : "chartering";
    return {
        // @ts-ignore
        period: null,
        // @ts-ignore
        start_date: null,
        // @ts-ignore
        end_date: null,
        // @ts-ignore
        pool_period: null,
        // @ts-ignore
        pool_start_date: null,
        // @ts-ignore
        pool_end_date: null,
        pool_loading_period: null,
        pool_loading_start_date: null,
        pool_loading_end_date: null,
        pool_unloading_period: null,
        pool_unloading_start_date: null,
        pool_unloading_end_date: null,
        trucker__in: [],
        vehicle__in: [],
        trailer__in: [],
        carrier__in: [],
        fleet_tags__in: [],
        tags__in: [],
        shipper__in: [],
        address__in: [],
        origin_address__in: [],
        destination_address__in: [],
        address_text: "",
        address_postcode__in: "",
        address_country__in: "",
        origin_address_text: "",
        origin_address_postcode__in: "",
        origin_address_country__in: "",
        destination_address_text: "",
        destination_address_postcode__in: "",
        destination_address_country__in: "",
        view,
        ordering_truckers: "user",
        ordering_vehicles: "license_plate",
    };
};

export function useCurrentQuery(predefinedFilters: SchedulerFilters, ignoreUrl = false) {
    /**
     * useState / useRef / others hooks
     **/

    const location = useLocation();
    const isCarrier = useIsCarrier();
    // force typescript.react.best-practice.react-props-in-state.react-props-in-state
    const predefinedQuery = predefinedFilters;

    const [currentQuery, setCurrentQuery] = useState<SchedulerFilters>(() => {
        const urlQueryString = location.search;
        let query = getDefaultSchedulerQuery(isCarrier);
        if (urlQueryString && !ignoreUrl) {
            query = {
                ...query,
                ...parseQuery(urlQueryString),
            };
            // if no date in url get it from local storage
            if (!(query.start_date && query.end_date) && !query.period) {
                if (predefinedQuery?.period) {
                    query.period = predefinedQuery?.period;
                } else if (predefinedQuery?.start_date && predefinedQuery?.end_date) {
                    query.start_date = predefinedQuery.start_date;
                    query.end_date = predefinedQuery.end_date;
                }
            }
            if (!(query.pool_start_date && query.pool_end_date) && !query.pool_period) {
                if (predefinedQuery?.pool_period) {
                    query.pool_period = predefinedQuery?.pool_period;
                } else if (predefinedQuery?.pool_start_date && predefinedQuery?.pool_end_date) {
                    query.pool_start_date = predefinedQuery.pool_start_date;
                    query.pool_end_date = predefinedQuery.pool_end_date;
                }
            }
        } else {
            query = {
                ...query,
                ...predefinedQuery,
            };
        }
        if (!query.period && !query.start_date) {
            query.period = "short_week";
        }
        return query;
    });

    /**
     * useCallback
     **/

    const updateQuery = useCallback((query: SchedulerFilters) => {
        setCurrentQuery((prevQuery) => {
            return {...prevQuery, ...query};
        });
    }, []);

    return {
        currentQuery,
        updateQuery,
    };
}

export function useCurrentQueryWithView(
    dateQuery: Pick<SchedulerFilters, "period" | "start_date" | "end_date">,
    poolViewPk: number | undefined,
    schedulerViewPk: number | undefined
) {
    const dispatch = useDispatch();

    const isCarrier = useIsCarrier();
    const [preselectedSort] = preselectedPoolSortState<string | null>();

    const {
        updateSelectedFilters,
        selectedFilters: {pool: lastSchedulerQuery},
    } = usePreselectedFilters<{
        pool?: Partial<SchedulerFilters>;
    }>();

    const [currentQuery, setCurrentQuery] = useState<SchedulerFilters>(() => {
        let query = {...getDefaultSchedulerQuery(isCarrier), ...dateQuery};
        if (!query.period && !query.start_date) {
            query.period = "short_week";
        }
        return query;
    });

    const updateQuery = useCallback(
        (query: SchedulerFilters) => {
            setCurrentQuery((prevQuery) => {
                return {...prevQuery, ...query};
            });
            updateSelectedFilters("pool", query);
        },
        [updateSelectedFilters]
    );

    useEffect(() => {
        const initQueryWithPreselectedViewsOrLastQuery = async () => {
            let poolQuery = {};
            let schedulerQuery: SchedulerFilters = {};
            if (poolViewPk) {
                try {
                    const response = await dispatch(retrieveSettingsViewIfNeeded(poolViewPk));
                    poolQuery = {
                        ...DEFAULT_POOL_SETTINGS,
                        ...PoolOfUnplannedSettingsSchema.parse(response.payload.settings),
                    };
                } catch (err) {
                    Logger.error(err);
                }
            } else if (lastSchedulerQuery) {
                poolQuery = {
                    ...DEFAULT_POOL_SETTINGS,
                    ...PoolOfUnplannedSettingsSchema.parse(lastSchedulerQuery),
                };
            }
            if (schedulerViewPk) {
                try {
                    const response = await dispatch(retrieveSettingsViewIfNeeded(schedulerViewPk));
                    schedulerQuery = {
                        ...getDefaultSchedulerResourceSettings(isCarrier),
                        ...SchedulerSettingsSchema.parse(response.payload?.settings)
                            ?.resource_settings,
                    };
                } catch (err) {
                    Logger.error(err);
                }
            }

            updateQuery({
                ...poolQuery,
                ...schedulerQuery,
                ordering: preselectedSort ?? undefined,
            });
        };
        initQueryWithPreselectedViewsOrLastQuery();
        // only run to initialize query with views params
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        currentQuery,
        updateQuery,
    };
}
