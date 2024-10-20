import {useInterval} from "@dashdoc/web-common";
import chunk from "lodash.chunk";
import {useEffect, useRef} from "react";

import {removeTransportFromState, fetchSearchTransports} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastTransportEvent} from "app/redux/selectors/realtime";

import type {TransportListWeb} from "app/types/transport_list_web";
export const useTransportEventHandler = (transports: TransportListWeb[] | undefined) => {
    const dispatch = useDispatch();
    const updatedTransports = useRef(new Set());
    // Transports live updates : refetch transport on realtime events from pusher
    const lastRealtimeEvent = useSelector(getLastTransportEvent);
    const isTransportInCurrentTransports = (transportUid: string) => {
        if (transports) {
            return transports.some(({uid}) => uid === transportUid);
        }

        return false;
    };

    useEffect(() => {
        if (lastRealtimeEvent) {
            const {
                data: {uid, type},
            } = lastRealtimeEvent;

            if (!uid) {
                return;
            }

            if (type === "updated" && isTransportInCurrentTransports(uid)) {
                updatedTransports.current.add(uid);
            } else if (type === "deleted" && isTransportInCurrentTransports(uid)) {
                dispatch(removeTransportFromState(uid));
            }
        }
    }, [lastRealtimeEvent]);

    useInterval(() => {
        if (updatedTransports.current.size > 0) {
            chunk([...updatedTransports.current], 20).forEach((uids) =>
                dispatch(fetchSearchTransports("", {uid__in: uids.join(",")}, 1))
            );
            updatedTransports.current.clear();
        }
    }, 30000);
};
