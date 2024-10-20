import {apiService} from "@dashdoc/web-common";
import {useEffect, useState} from "react";
import {z} from "zod";

import {
    TariffGridCountryCode,
    TariffGridAreasDetails,
    tariffGridAreasDetailsSchema,
} from "app/features/pricing/tariff-grids/types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    createPopulateTariffGridAreaAction,
    tariffGridAreasSelector,
} from "app/taxation/pricing/store/tariffGridAreasSlice";

const fetchTariffGridAreas = async (): Promise<Record<string, TariffGridAreasDetails>> => {
    const response: unknown = await apiService.get("tariff-grids/zones/", {
        apiVersion: "web",
    });
    const validated_value: Record<string, TariffGridAreasDetails> = z
        .record(tariffGridAreasDetailsSchema)
        .parse(response);
    return validated_value;
};

export const useTariffGridZones = (): Record<string, TariffGridAreasDetails> | undefined => {
    const [hasFetched, setHasFetched] = useState<boolean>(false);
    const {tariffGridAreas: storedTariffGridAreas} = useSelector(tariffGridAreasSelector);
    const dispatch = useDispatch();
    useEffect(() => {
        if (storedTariffGridAreas !== undefined || hasFetched) {
            return;
        }
        const abortController = new AbortController(); // we use an abort controller to cancel the subscription
        // eslint-disable-next-line github/no-then
        fetchTariffGridAreas().then((tariffGridAreas) => {
            if (!abortController.signal.aborted) {
                setHasFetched(true);
                dispatch(createPopulateTariffGridAreaAction(tariffGridAreas));
            }
        });
        return () => {
            abortController.abort();
        };
    }, [storedTariffGridAreas, hasFetched, dispatch]);

    return storedTariffGridAreas;
};

/** Extract the list of  available countries from a record of tariff grid areas details */
export const getAvailableCountries = (
    tariffGridAreas: Record<string, TariffGridAreasDetails> | undefined
): Set<TariffGridCountryCode> => {
    const availableCountries = new Set<TariffGridCountryCode>();
    if (tariffGridAreas === undefined) {
        return availableCountries;
    }
    for (const area of Object.values(tariffGridAreas)) {
        availableCountries.add(area.country);
    }
    return availableCountries;
};
