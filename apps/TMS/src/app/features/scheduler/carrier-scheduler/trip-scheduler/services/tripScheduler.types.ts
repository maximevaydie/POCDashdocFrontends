import {MeansCombination, Unavailability} from "dashdoc-utils";

import {CompactTrip} from "app/features/trip/trip.types";

export type TripResource = TruckerForScheduler | VehicleOrTrailerForScheduler;

export type TruckerForScheduler = {
    pk: number;
    user: {
        first_name: string;
        last_name: string;
    };
    unavailability?: Unavailability[];
    owned_by_company: boolean;
    means_combination: MeansCombination | null;
};
export type VehicleOrTrailerForScheduler = {
    license_plate: string;
    fleet_number?: string;
    pk: number;
    used_for_qualimat_transports: boolean;
    unavailability?: Unavailability[];
    owned_by_company: boolean;
    means_combination: MeansCombination | null;
};

export type FormattedDropResult = {
    trip: CompactTrip;
    newResource: string;
    oldResource: string;
    newDay: string | null;
    oldDay: string | null;
    oldIndex: number | undefined;
    newIndex: number;
};

export type TripSchedulerView = "trucker" | "vehicle" | "trailer";
