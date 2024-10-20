import {FuelType} from "dashdoc-utils";

export type UpdateEmissionRatePayload = {
    start: string;
    end: string;
    effective_start: string;
    effective_end: string;
    tonne_kilometer: number;
    fuels: {
        fuel: FuelType;
        quantity: number;
    }[];
};

export type FuelConsumption = {
    fuel: FuelType;
    quantity: number;
};

export type NullableFuelConsumption = {
    fuel: FuelType | null;
    quantity: number | null;
};
