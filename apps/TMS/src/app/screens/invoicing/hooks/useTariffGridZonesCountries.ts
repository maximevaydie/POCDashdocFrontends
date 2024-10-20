import {apiService} from "@dashdoc/web-common";
import {useEffect, useState} from "react";

import {
    tariffGridCountriesZodSchema,
    type TariffGridCountries,
} from "app/features/pricing/tariff-grids/types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    createPopulateTariffGridCountriesAction,
    tariffGridCountriesSelector,
} from "app/taxation/pricing/store/tariffGridCountriesSlice";

const fetchTariffGridZonesCountries = async (): Promise<TariffGridCountries> => {
    const response: unknown = await apiService.get("tariff-grids/zones-countries/", {
        apiVersion: "web",
    });
    return tariffGridCountriesZodSchema.parse(response);
};

export const useTariffGridZonesCountries = (): TariffGridCountries | undefined => {
    const [hasFetched, setHasFetched] = useState<boolean>(false);
    const {tariffGridCountries: storedTariffGridCountries} = useSelector(
        tariffGridCountriesSelector
    );
    const dispatch = useDispatch();
    useEffect(() => {
        if (storedTariffGridCountries !== undefined || hasFetched) {
            return;
        }
        const abortController = new AbortController(); // we use an abort controller to cancel the subscription
        // eslint-disable-next-line github/no-then
        fetchTariffGridZonesCountries().then((tariffGridCountries) => {
            if (!abortController.signal.aborted) {
                setHasFetched(true);
                dispatch(createPopulateTariffGridCountriesAction(tariffGridCountries));
            }
        });
        return () => {
            abortController.abort();
        };
    }, [storedTariffGridCountries, hasFetched, dispatch]);

    return storedTariffGridCountries;
};
