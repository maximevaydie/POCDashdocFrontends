import {apiService} from "@dashdoc/web-common";
import {MeansCombination} from "dashdoc-utils";

export function fetchAddMeansCombination(
    combination: MeansCombination
): Promise<MeansCombination> {
    return apiService.post(
        "/means-combinations/",
        {
            trucker: combination.trucker?.pk,
            vehicle: combination.vehicle?.pk,
            trailer: combination.trailer?.pk,
        },
        {
            apiVersion: "web",
        }
    );
}

export function fetchUpdateMeansCombination(
    combination: MeansCombination
): Promise<MeansCombination> {
    return apiService.patch(
        `/means-combinations/${combination.pk}/`,
        {
            // null => delete
            // undefined => don't change
            trucker: combination.trucker === null ? null : combination.trucker?.pk,
            vehicle: combination.vehicle === null ? null : combination.vehicle?.pk,
            trailer: combination.trailer === null ? null : combination.trailer?.pk,
        },
        {
            apiVersion: "web",
        }
    );
}

export function fetchDeleteMeansCombination(combinationPk: number): Promise<void> {
    return apiService.delete(`/means-combinations/${combinationPk}/`, {
        apiVersion: "web",
    });
}
