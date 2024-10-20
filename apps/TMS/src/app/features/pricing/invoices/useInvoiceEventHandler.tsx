import {useInterval} from "@dashdoc/web-common";
import {useEffectExceptOnMount} from "dashdoc-utils";
import {createContext, useCallback, useRef} from "react";

import {useSelector} from "app/redux/hooks";
import {getLastAddOrDeleteInvoiceEvent} from "app/redux/selectors/realtime";

export const CancelInvoicesReloadContext = createContext({cancelInvoicesReload: () => {}});

/**
 * A hook to handle invoices list realtime updates
 * When some invoices are added or deleted, some realtime events are received
 * Then it reloads the invoices list
 */
export const useInvoiceEventHandler = (reloadInvoices: () => void, canReload: boolean) => {
    // Invoice live updates
    const lastRealtimeAddOrDeleteInvoiceEvent = useSelector(getLastAddOrDeleteInvoiceEvent);
    const needReload = useRef<boolean>(false);

    useEffectExceptOnMount(() => {
        if (lastRealtimeAddOrDeleteInvoiceEvent) {
            needReload.current = true;
        }
    }, [lastRealtimeAddOrDeleteInvoiceEvent]);

    useInterval(() => {
        if (needReload.current && canReload) {
            cancelInvoicesReload();
            reloadInvoices();
        }
    }, 5000);

    const cancelInvoicesReload = useCallback(() => {
        needReload.current = false;
    }, []);

    return {cancelInvoicesReload};
};
