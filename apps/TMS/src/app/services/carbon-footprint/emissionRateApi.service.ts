import {apiService} from "@dashdoc/web-common";
import {FuelType} from "dashdoc-utils";

import {UpdateEmissionRatePayload} from "app/features/carbon-footprint/types";

export type EmissionRate = {
    uid: string;
    expire_at: string;
    emission_rate: number;
};

export type UpdateEmissionRateInformation = {
    tonne_kilometer: number;
    transport_count: number;
    transport_with_error_count: number;
};

export class EmissionRatesApiService {
    collectInformation(
        emissionRateUid: string,
        start: string,
        end: string
    ): Promise<UpdateEmissionRateInformation> {
        return apiService.post(
            `/carbon-footprint/emission-rates/${emissionRateUid}/collect-information-for-update/`,
            {
                start,
                end,
            },
            {
                apiVersion: "web",
            }
        );
    }

    /**
     * @deprecated Use collectInformation instead
     */
    collectInformationDeprecated(
        emissionRateUid: string,
        {
            start,
            end,
        }: {
            start: Date;
            end: Date;
        }
    ): Promise<UpdateEmissionRateInformation> {
        return apiService.post(
            `/carbon-footprint/emission-rates/${emissionRateUid}/collect-information-for-update/`,
            {
                start: start.toISOString(),
                end: end.toISOString(),
            },
            {
                apiVersion: "web",
            }
        );
    }

    update(
        emissionRateUid: string,
        {
            start,
            end,
            effective_start,
            effective_end,
            tonne_kilometer,
            fuels,
        }: UpdateEmissionRatePayload
    ): Promise<EmissionRate> {
        return apiService.post(
            `/carbon-footprint/emission-rates/${emissionRateUid}/update/`,
            {
                start,
                end,
                effective_start: effective_start,
                effective_end: effective_end,
                tonne_kilometer,
                fuels,
            },
            {
                apiVersion: "web",
            }
        );
    }

    updateDeprecated(
        emissionRateUid: string,
        {
            start,
            end,
            effective_start,
            effective_end,
            tonne_kilometer,
            fuels,
        }: {
            start: Date;
            end: Date;
            effective_start: Date;
            effective_end: Date;
            tonne_kilometer: number;
            fuels: {
                fuel: FuelType;
                quantity: number;
            }[];
        }
    ): Promise<EmissionRate> {
        return apiService.post(
            `/carbon-footprint/emission-rates/${emissionRateUid}/update/`,
            {
                start: start.toISOString(),
                end: end.toISOString(),
                effective_start: effective_start.toISOString(),
                effective_end: effective_end.toISOString(),
                tonne_kilometer,
                fuels,
            },
            {
                apiVersion: "web",
            }
        );
    }
}

export const emissionRatesApiService = new EmissionRatesApiService();
