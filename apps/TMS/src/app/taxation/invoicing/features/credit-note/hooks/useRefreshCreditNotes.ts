import {useTimezone} from "@dashdoc/web-common";
import {useContext} from "react";
import {useSelector} from "react-redux";
import {useLocation} from "react-router";

import {
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    parseInvoicingQueryString,
} from "app/features/filters/deprecated/utils";
import {fetchSearchCreditNotes} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {getCreditNotesForCurrentQuery} from "app/redux/selectors/searches";
import {CancelCreditNotesReloadContext} from "app/taxation/invoicing/features/credit-note/hooks/useCreditNotesEventHandler";

/** Provide a function to refresh the current list of credit notes in any subcomponents of the invoices screen.   */
export const useRefreshCreditNotes = () => {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const location = useLocation();
    const {cancelCreditNoteReload} = useContext(CancelCreditNotesReloadContext);
    const {page = 1} = useSelector(getCreditNotesForCurrentQuery);
    const creditNotesQuery = parseInvoicingQueryString(location.search);
    const creditNotesQueryParams = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
        creditNotesQuery,
        timezone
    );
    const refreshCreditNotes = () => {
        dispatch(
            fetchSearchCreditNotes("creditNotes", creditNotesQueryParams, {
                fromPage: 1,
                toPage: page,
            })
        );
        cancelCreditNoteReload();
    };
    return refreshCreditNotes;
};
