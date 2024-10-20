import {useInterval} from "@dashdoc/web-common";
import {useEffect, useRef} from "react";

import {useSelector} from "app/redux/hooks";
import {getLastTransportEvent} from "app/redux/selectors";

export const useTransportsEventHandler = (
    fetchTransportsByUids: (transportsUids: Array<string>) => void
) => {
    // Trips live updates
    const lastTransportRealtimeEvent = useSelector(getLastTransportEvent);
    const transportsUidsToUpdate = useRef<Set<string>>(new Set());

    useEffect(
        () => {
            const uid = lastTransportRealtimeEvent?.data?.uid;
            if (!uid) {
                return;
            }
            transportsUidsToUpdate.current.add(uid);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lastTransportRealtimeEvent]
    );

    useInterval(() => {
        const transportsUids = Array.from(transportsUidsToUpdate.current);

        transportsUidsToUpdate.current = new Set();
        if (transportsUids.length > 0) {
            fetchTransportsByUids(transportsUids);
        }
    }, 5000);

    return null;
};
