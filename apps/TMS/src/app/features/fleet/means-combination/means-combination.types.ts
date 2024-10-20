import {Trailer, Trucker, Vehicle} from "dashdoc-utils";

export type InitialMeans =
    | {means: Partial<Trucker>; type: "trucker"}
    | {means: Partial<Vehicle>; type: "vehicle"}
    | {means: Partial<Trailer>; type: "trailer"};
