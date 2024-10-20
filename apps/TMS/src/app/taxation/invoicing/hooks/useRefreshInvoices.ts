import {useTimezone} from "@dashdoc/web-common";
import {useContext} from "react";
import {useSelector} from "react-redux";
import {useLocation} from "react-router";

import {
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    parseInvoicingQueryString,
} from "app/features/filters/deprecated/utils";
import {CancelInvoicesReloadContext} from "app/features/pricing/invoices/useInvoiceEventHandler";
import {fetchSearchInvoices} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {getInvoicesForCurrentQuery} from "app/redux/selectors/searches";

/** Provide a function to refresh the current list of invoices in any subcomponents of the invoices screen.   */
export const useRefreshInvoices = () => {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const location = useLocation();
    const {cancelInvoicesReload} = useContext(CancelInvoicesReloadContext);
    const {page: invoicesPage = 1} = useSelector(getInvoicesForCurrentQuery);
    const invoicesQuery = parseInvoicingQueryString(location.search);
    const invoicesQueryParams = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
        invoicesQuery,
        timezone
    );
    const refreshInvoices = () => {
        dispatch(
            fetchSearchInvoices("invoices", invoicesQueryParams, {
                fromPage: 1,
                toPage: invoicesPage,
            })
        );
        cancelInvoicesReload();
    };
    return refreshInvoices;
};
