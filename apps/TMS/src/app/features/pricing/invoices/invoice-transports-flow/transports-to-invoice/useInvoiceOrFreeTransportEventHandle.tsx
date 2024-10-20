import {useInterval} from "@dashdoc/web-common";
import {useEffectExceptOnMount} from "dashdoc-utils";
import {useCallback, useRef} from "react";

import {useSelector} from "app/redux/hooks";
import {getLastInvoiceOrFreeTransportsEvent} from "app/redux/selectors";

/**
 * A hook to handle transports to invoice list realtime updates
 * When some transports are invoiced or freed by a credit note,
 * some realtime events are received
 * Then it reloads the transports to invoice list
 */
export const useInvoiceOrFreeTransportEventHandle = (
    reloadTransportToInvoice: () => void,
    canReload: boolean
) => {
    // Invoice live updates
    const lastRealtimeInvoiceOrFreeTransportsEvent = useSelector(
        getLastInvoiceOrFreeTransportsEvent
    );
    const needReload = useRef<boolean>(false);

    useEffectExceptOnMount(() => {
        if (lastRealtimeInvoiceOrFreeTransportsEvent) {
            needReload.current = true;
        }
    }, [lastRealtimeInvoiceOrFreeTransportsEvent]);

    useInterval(() => {
        if (needReload.current && canReload) {
            cancelTransportsToInvoiceReload();
            reloadTransportToInvoice();
        }
    }, 5000);

    const cancelTransportsToInvoiceReload = useCallback(() => {
        needReload.current = false;
    }, []);

    return {cancelTransportsToInvoiceReload};
};
