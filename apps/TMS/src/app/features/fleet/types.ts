import type {Trailer, Trucker, Vehicle} from "dashdoc-utils";

export type InitialMeansCombination = {
    pk: undefined;
    trucker: Partial<Trucker> | null;
    vehicle: Partial<Vehicle> | null;
    trailer: Partial<Trailer> | null;
};
