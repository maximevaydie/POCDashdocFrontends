import {Logger} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {fetchInvoicesTotalAmount} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type InvoicesTotal = {
    price_ex_tax: number;
    price_incl_tax: number | null;
};

type CreditNotesTotal = {
    price_ex_tax: number;
    price_incl_tax: number;
};

// Type should match with backend serializer TotalAmountOutputSerializer
type InvoicesTotalAmountResponse = {
    invoices: InvoicesTotal;
    credit_notes: CreditNotesTotal | null;
};

const defaultState: InvoicesTotalAmountResponse = {
    invoices: {
        price_ex_tax: 0,
        price_incl_tax: null,
    },
    credit_notes: null,
};

export function useInvoicesTotalAmount(filters: SearchQuery): InvoicesTotalAmountResponse {
    const dispatch = useDispatch();
    const [amountResponse, setAmountResponse] =
        useState<InvoicesTotalAmountResponse>(defaultState);

    useEffect(() => {
        async function fetch() {
            try {
                setAmountResponse(defaultState);
                const {response} = await dispatch(fetchInvoicesTotalAmount(filters));
                const {invoices, credit_notes} = response;
                setAmountResponse({
                    invoices: invoices,
                    credit_notes: credit_notes,
                });
            } catch (error) {
                Logger.error(error);
            }
        }
        fetch();
    }, [filters]);

    return amountResponse;
}
