import {apiService} from "@dashdoc/web-common";
import {TRANSPORTS_BUSINESS_STATUSES} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {Logger} from "@dashdoc/web-core";
import {queryService} from "@dashdoc/web-core";
import {useEffect, useState} from "react";

import {SearchQuery} from "app/redux/reducers/searches";

// Type should match with backend serializer TransportsTotalPriceOutputSerializer
type TotalTransportsPriceResponse = {
    price_without_tax: number;
};

export function useTotalTransportsPrice(
    tab: string,
    filters: SearchQuery
): TotalTransportsPriceResponse | null {
    const [priceResponse, setPriceResponse] = useState<TotalTransportsPriceResponse | null>(null);

    const isTransportTab = (TRANSPORTS_BUSINESS_STATUSES as Readonly<string[]>).includes(tab);

    useEffect(() => {
        async function fetch() {
            try {
                setPriceResponse(null);
                const response = await apiService.get(
                    `/transports/total-transports-price/?${queryService.toQueryString(filters)}`,
                    {
                        apiVersion: "v4",
                    }
                );
                const {price_without_tax} = response;
                setPriceResponse({
                    price_without_tax,
                });
            } catch (error) {
                Logger.error(error);
            }
        }
        if (isTransportTab) {
            fetch();
        }
    }, [filters, isTransportTab]);

    return priceResponse;
}
