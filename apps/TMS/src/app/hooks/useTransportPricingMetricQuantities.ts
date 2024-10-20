import {apiService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import isNil from "lodash.isnil";
import {useEffect, useState} from "react";

export interface TransportPricingMetricQuantities {
    distance_in_km: string;
    duration_in_minute: string;
    duration_in_hour: string;
    loaded_weight_in_kg: string;
    loaded_weight_in_tonne: string;
    loaded_volume_in_litre: string;
    loaded_volume_in_m3: string;
    loaded_quantity: string;
    loaded_linear_meters: string;
    loaded_steres: string;
    unloaded_weight_in_kg: string;
    unloaded_weight_in_tonne: string;
    unloaded_volume_in_litre: string;
    unloaded_volume_in_m3: string;
    unloaded_quantity: string;
    unloaded_linear_meters: string;
    unloaded_steres: string;
    nb_deliveries: string;
    nb_rounds: string;
}

export const useTransportPricingMetricQuantities = (transportUid: string | undefined) => {
    const [transportPricingMetricQuantities, setTransportPricingMetricQuantities] =
        useState<TransportPricingMetricQuantities | null>(null);

    useEffect(() => {
        if (isNil(transportUid)) {
            setTransportPricingMetricQuantities(null);
        } else {
            apiService
                .get(`/transports/${transportUid}/pricing-metric-quantities/`, {apiVersion: "web"})
                .then((response: TransportPricingMetricQuantities) => {
                    setTransportPricingMetricQuantities(response);
                })
                .catch((error) => {
                    Logger.error(error);
                });
        }
    }, [transportUid]);

    return transportPricingMetricQuantities;
};
