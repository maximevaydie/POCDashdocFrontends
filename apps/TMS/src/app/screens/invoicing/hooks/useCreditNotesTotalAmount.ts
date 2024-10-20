import {Logger} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {fetchCreditNotesTotalAmount} from "app/redux/actions/creditNotes";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

// Type should match with backend serializer CreditNotesTotalAmountOutputSerializer
type CreditNotesTotalAmountResponse = {
    total_price_ex_tax: string;
    total_price_incl_tax: string;
};

const defaultState: CreditNotesTotalAmountResponse = {
    total_price_ex_tax: "0",
    total_price_incl_tax: "0",
};

export function useCreditNotesTotalAmount(filters: SearchQuery): CreditNotesTotalAmountResponse {
    const dispatch = useDispatch();
    const [amountResponse, setAmountResponse] =
        useState<CreditNotesTotalAmountResponse>(defaultState);

    useEffect(() => {
        async function fetch() {
            try {
                const {response} = await dispatch(fetchCreditNotesTotalAmount(filters));
                setAmountResponse(response);
            } catch (error) {
                Logger.error(error);
                setAmountResponse(defaultState);
            }
        }
        fetch();
    }, [filters]);

    return amountResponse;
}
