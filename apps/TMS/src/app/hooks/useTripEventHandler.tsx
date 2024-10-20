import {useInterval} from "@dashdoc/web-common";
import {useEffect, useRef} from "react";

import {usePageVisibility} from "app/hooks/usePageVisibility";
import {useSelector} from "app/redux/hooks";
import {getLastTripEvent} from "app/redux/selectors/realtime";

export const useTripEventHandler = (
    fetchTripsByUids: (tripUids: Array<string>) => void,
    lockedTripsUids: Set<string>
) => {
    // Trips live updates
    const lastTripRealtimeEvent = useSelector(getLastTripEvent);
    const tripsUidsToUpdate = useRef<Set<string>>(new Set());
    const isVisible = usePageVisibility();

    useEffect(
        () => {
            const uid = lastTripRealtimeEvent?.data?.uid;
            if (!uid) {
                return;
            }
            tripsUidsToUpdate.current.add(uid);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lastTripRealtimeEvent]
    );

    useInterval(
        () => {
            const tripsUids = Array.from(tripsUidsToUpdate.current).filter(
                (uid) => !lockedTripsUids.has(uid)
            );
            tripsUidsToUpdate.current = new Set(
                Array.from(tripsUidsToUpdate.current).filter((uid) => lockedTripsUids.has(uid))
            );
            if (tripsUids.length > 0) {
                fetchTripsByUids(tripsUids);
            }
        },
        isVisible ? 1000 : 5000
    );

    return null;
};

export const usePoolTripEventHandler = (fetchTrips: () => void, lockedTripsUids: Set<string>) => {
    // Trips live updates
    const lastTripRealtimeEvent = useSelector(getLastTripEvent);
    const tripsUidsToUpdate = useRef<Set<string>>(new Set());
    const isVisible = usePageVisibility();

    useEffect(
        () => {
            const uid = lastTripRealtimeEvent?.data?.uid;
            if (!uid) {
                return;
            }
            tripsUidsToUpdate.current.add(uid);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lastTripRealtimeEvent]
    );

    useInterval(
        () => {
            if (lockedTripsUids.size > 0) {
                return;
            }
            if (tripsUidsToUpdate.current.size > 0) {
                fetchTrips();
                tripsUidsToUpdate.current = new Set();
            }
        },
        isVisible ? 1000 : 5000
    );

    return null;
};
