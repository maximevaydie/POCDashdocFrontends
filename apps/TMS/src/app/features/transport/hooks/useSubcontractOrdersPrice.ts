import {ORDERS_BUSINESS_STATUSES} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {Logger} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {fetchSubcontractOrdersPrice} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";

type UseSubcontractOrdersPriceResponse = {
    totalParentTransportPrice: number | null;
    totalWeightedParentTransportPrice: number | null;
    totalTransportPrice: number | null;
    margin: number | null;
};

const defaultState: UseSubcontractOrdersPriceResponse = {
    totalParentTransportPrice: null,
    totalWeightedParentTransportPrice: null,
    totalTransportPrice: null,
    margin: null,
};

export function useSubcontractOrdersPrice(
    tab: string,
    filters: SearchQuery
): UseSubcontractOrdersPriceResponse {
    const dispatch = useDispatch();
    const [priceResponse, setPriceResponse] =
        useState<UseSubcontractOrdersPriceResponse>(defaultState);

    const isSubcontractOrderTab = (ORDERS_BUSINESS_STATUSES as Readonly<string[]>).includes(tab);

    useEffect(() => {
        async function fetch() {
            try {
                setPriceResponse(defaultState);
                const {response} = await dispatch(fetchSubcontractOrdersPrice(filters));
                const {
                    margin,
                    total_parent_transport_price,
                    weighted_total_parent_transport_price,
                    total_transport_price,
                } = response;
                setPriceResponse({
                    margin,
                    totalParentTransportPrice: total_parent_transport_price,
                    totalWeightedParentTransportPrice: weighted_total_parent_transport_price,
                    totalTransportPrice: total_transport_price,
                });
            } catch (error) {
                Logger.error(error);
            }
        }
        if (isSubcontractOrderTab) {
            fetch();
        }
    }, [filters, isSubcontractOrderTab]);

    return priceResponse;
}
