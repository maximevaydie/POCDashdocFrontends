import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";

import {RootState} from "app/redux/reducers/index";
import {fetchInvoicingStatus} from "app/redux/reducers/invoicing-status";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

export const useInvoicingStatus = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchInvoicingStatus());
    }, [dispatch]);

    const invoicingStatus = useSelector((state: RootState) => state.invoicingStatus.data);
    const loading = useSelector((state: RootState) => state.invoicingStatus.loading);
    const error = useSelector((state: RootState) => state.invoicingStatus.error);

    return {invoicingStatus, loading, error};
};

// The hook below is more optimized for the case "dashdoc invoicing"
// It will not fetch the invoicing status if:
// - dashdoc invoicing is not enabled
// - the invoicing status is already ready for invoicing
export const useInvoicingStatusForDashdocInvoicing = () => {
    const dispatch = useDispatch();

    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicingStatus = useSelector((state: RootState) => state.invoicingStatus.data);
    const noPreviousFetch = invoicingStatus === null;
    const dashdocInvoicingNotReady =
        invoicingStatus?.invoicing_method === "dashdoc-invoicing" &&
        !invoicingStatus.is_ready_for_invoicing;

    useEffect(() => {
        if (hasDashdocInvoicingEnabled && (noPreviousFetch || dashdocInvoicingNotReady)) {
            dispatch(fetchInvoicingStatus());
        }
    }, [dispatch, hasDashdocInvoicingEnabled]);

    const loading = useSelector((state: RootState) => state.invoicingStatus.loading);
    const error = useSelector((state: RootState) => state.invoicingStatus.error);

    return {invoicingStatus, loading, error};
};
