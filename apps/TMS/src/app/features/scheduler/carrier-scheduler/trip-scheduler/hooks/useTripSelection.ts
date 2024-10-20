import isEqual from "lodash.isequal";
import {useCallback, useState} from "react";

import {CompactTrip, SimilarActivity, Trip, TripActivity} from "app/features/trip/trip.types";
import {useSelector} from "app/redux/hooks";
import {getTripByUid} from "app/redux/selectors";

export function useTripSelection() {
    /**
     * useState / useRef / others hooks
     **/

    // selected trip + editing element (transport or extended transport)

    const [selectedTripUid, setSelectedTripUid] = useState<string | null>(null);
    const selectedTransportUid = useSelector((state) => {
        const selectedTrip: Trip | null = getTripByUid(state, selectedTripUid);
        return getRelatedTripTransport(selectedTrip);
    }, isEqual);

    const unselectTrip = useCallback(() => {
        setSelectedTripUid(null);
    }, []);

    const selectTrip = useCallback((tripUid: string) => {
        setSelectedTripUid(tripUid);
    }, []);

    return {
        selectedTripUid,
        selectedTransportUid,
        selectTrip,
        unselectTrip,
    };
}

export const getRelatedTripTransport = (trip: Trip | CompactTrip | null): string | null => {
    if (!trip || trip.is_prepared) {
        return null;
    }

    let relatedTransportUid = null;
    for (const activity of trip.activities) {
        const a = activity as TripActivity;
        if (a.transport) {
            relatedTransportUid = a.transport.uid;
            break;
        } else if ((activity as SimilarActivity).transports?.length > 0) {
            relatedTransportUid = (activity as SimilarActivity).transports[0].uid;
            break;
        }
    }

    return relatedTransportUid;
};
