import {apiService} from "@dashdoc/web-common";
import {FuelType} from "dashdoc-utils";

export type GenericVehicleEmissionRate = {
    uid: string;
    value: number;
    french_label: string;
    english_label: string;
    category: "articulated" | "rigid" | "utility" | "light_duty_vehicle" | "national_average";
};

export type GetGenericVehicleEmissionRatesResponse = {
    default_generic_emission_rate_uid: string;
    results: GenericVehicleEmissionRate[];
};

export type GenericFuelEmissionRate = {
    uid: string;
    value: number;
};

export class GenericEmissionRatesApiService {
    getGenericVehicleEmissionRates(): Promise<GetGenericVehicleEmissionRatesResponse> {
        return apiService.get(`/carbon-footprint/generic-emission-rates/vehicles/`, {
            apiVersion: "web",
        });
    }

    getGenericFuelEmissionRates(): Promise<{results: Record<FuelType, GenericFuelEmissionRate>}> {
        return apiService.get(`/carbon-footprint/generic-emission-rates/fuel/`, {
            apiVersion: "web",
        });
    }
}

export const genericEmissionRatesApiService = new GenericEmissionRatesApiService();
