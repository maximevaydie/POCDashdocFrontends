import {InitialMeans} from "./means-combination.types";

import type {InitialMeansCombination} from "../types";

export function getInitialMeansCombinations({means, type}: InitialMeans): InitialMeansCombination {
    return {
        pk: undefined,
        trucker:
            type === "trucker"
                ? {
                      ...means,
                      // trucker object from scheduler is missing display_name required by trucker select
                      display_name:
                          means.display_name ??
                          means.user?.first_name + " " + means.user?.last_name,
                  }
                : null,
        vehicle: type === "vehicle" ? means : null,
        trailer: type === "trailer" ? means : null,
    };
}
