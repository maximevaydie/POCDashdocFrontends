import {
    PoolOfUnplannedTransportsColumnNames,
    PoolOfUnplannedTripsColumnNames,
} from "dashdoc-utils";

import {TripSchedulerView} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

import {CompactTrip} from "../trip.types";

export interface TripColumn {
    name: PoolOfUnplannedTransportsColumnNames | PoolOfUnplannedTripsColumnNames;
    getLabel: () => string;
    width: number | string;
    getCellContent?: (
        trip: CompactTrip,
        view: TripSchedulerView,
        timezone: string
    ) => React.ReactNode;
}

export type TripType = "basic" | "prepared";
