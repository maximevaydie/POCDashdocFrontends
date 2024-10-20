import {apiService, useTimezone} from "@dashdoc/web-common";
import {zoneDateToISO} from "dashdoc-utils";
import {useCallback, useEffect, useMemo, useState} from "react";

import {TripWithTransportData} from "app/features/trip/trip.types";

export const useActivityDatesConflictWithUnavailability = ({
    tripUid,
    activityUid,
    truckerPk,
    vehiclePk,
    trailerPk,
    startDate,
    endDate,
    dateType,
}: {
    tripUid: string;
    activityUid: string;
    truckerPk: number | undefined;
    vehiclePk: number | undefined;
    trailerPk: number | undefined;
    startDate: Date;
    endDate: Date;
    dateType: "scheduled" | "requested" | undefined;
}) => {
    const timezone = useTimezone();

    const computeNewDates = useCallback(() => {
        return {
            start: zoneDateToISO(startDate, timezone),
            end: zoneDateToISO(endDate, timezone),
        };
    }, [timezone, startDate, endDate]);

    const unavailabilityPayload = useMemo(() => {
        const dates = computeNewDates();
        return dates
            ? {
                  trip_uid: tripUid,
                  activity_uid: activityUid,
                  activity_start_date: dates.start,
                  activity_end_date: dates.end,
                  dates_type: dateType,
              }
            : null;
    }, [activityUid, computeNewDates, dateType, tripUid]);

    return useConflictWithUnavailability(
        tripUid,
        truckerPk,
        vehiclePk,
        trailerPk,
        unavailabilityPayload
    );
};

export const useTripConflictWithUnavailability = (trip: TripWithTransportData) => {
    const tripUid = trip.uid;
    const truckerPk = trip.trucker?.pk;
    const vehiclePk = trip.vehicle?.original ?? trip.vehicle?.pk;
    const trailerPk = trip.trailer?.original ?? trip.trailer?.pk;

    const unavailabilityPayload = useMemo(
        () => ({
            trip_uid: tripUid,
        }),
        // need to check again conflict when trip scheduler_datetime_range is updated
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [tripUid, trip.scheduler_datetime_range.start, trip.scheduler_datetime_range.end]
    );

    return useConflictWithUnavailability(
        tripUid,
        truckerPk,
        vehiclePk,
        trailerPk,
        unavailabilityPayload
    );
};

type UnavailabilityPayload = {
    trip_uid: string;
    activity_uid?: string;
    activity_start_date?: string | null;
    activity_end_date?: string | null;
    dates_type?: "scheduled" | "requested";
};
const useConflictWithUnavailability = (
    tripUid: string,
    truckerPk: number | undefined,
    vehiclePk: number | undefined,
    trailerPk: number | undefined,
    unavailabilityPayload: UnavailabilityPayload | null
) => {
    const [hasTruckerAvailabilityConflict, setTruckerAvailabilityConflict] = useState(false);
    const [hasVehicleAvailabilityConflict, setVehicleAvailabilityConflict] = useState(false);
    const [hasTrailerAvailabilityConflict, setTrailerAvailabilityConflict] = useState(false);

    const checkTruckerAvailabilityConflict = useCallback(() => {
        if (tripUid && truckerPk) {
            if (unavailabilityPayload) {
                apiService
                    .post(
                        `/manager-truckers/${truckerPk}/has-unavailability-during-trip/`,
                        unavailabilityPayload,
                        {apiVersion: "web"}
                    )
                    .then((res) => {
                        setTruckerAvailabilityConflict(res.conflict);
                    })
                    .catch(() => {
                        setTruckerAvailabilityConflict(false);
                    });
            }
        }
    }, [tripUid, truckerPk, unavailabilityPayload]);

    const checkVehicleAvailabilityConflict = useCallback(() => {
        if (tripUid && vehiclePk) {
            if (unavailabilityPayload) {
                apiService
                    .post(
                        `/vehicles/${vehiclePk}/has-unavailability-during-trip/`,
                        unavailabilityPayload
                    )
                    .then((res) => {
                        setVehicleAvailabilityConflict(res.conflict);
                    })
                    .catch(() => {
                        setVehicleAvailabilityConflict(false);
                    });
            }
        }
    }, [tripUid, vehiclePk, unavailabilityPayload]);

    const checkTrailerAvailabilityConflict = useCallback(() => {
        if (tripUid && trailerPk) {
            if (unavailabilityPayload) {
                apiService
                    .post(
                        `/trailers/${trailerPk}/has-unavailability-during-trip/`,
                        unavailabilityPayload
                    )
                    .then((res) => {
                        setTrailerAvailabilityConflict(res.conflict);
                    })
                    .catch(() => {
                        setTrailerAvailabilityConflict(false);
                    });
            }
        }
    }, [tripUid, trailerPk, unavailabilityPayload]);

    useEffect(() => {
        checkTruckerAvailabilityConflict();
        checkVehicleAvailabilityConflict();
        checkTrailerAvailabilityConflict();
    }, [
        checkTrailerAvailabilityConflict,
        checkTruckerAvailabilityConflict,
        checkVehicleAvailabilityConflict,
    ]);

    return {
        hasTruckerAvailabilityConflict,
        hasVehicleAvailabilityConflict,
        hasTrailerAvailabilityConflict,
    };
};
