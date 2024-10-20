import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import {Trailer, Trucker, Vehicle} from "dashdoc-utils";

import {AutoFilledMeansFields} from "app/features/transport/transport-form/transport-form.types";

interface UseAutoFillMeansProps {
    onAutoFillVehicle: (vehicle: Vehicle) => void;
    onAutoFillTrailer: (trailer: Trailer) => void;
    onAutoFillTrucker: (trucker: Trucker) => void;
}

// TODO: Relocate smart suggest logic to this hook
export function useAutoFillMeans({
    onAutoFillVehicle,
    onAutoFillTrailer,
    onAutoFillTrucker,
}: UseAutoFillMeansProps) {
    const autoFillMeans = (
        fromMeansType: "trucker" | "vehicle" | "trailer",
        fromMeans: Pick<Trucker | Vehicle | Trailer, "means_combination">
    ): AutoFilledMeansFields => {
        const autoFilledMeansFields: AutoFilledMeansFields = {
            source: "meansCombination",
        };

        if (fromMeansType !== "trucker" && fromMeans.means_combination?.trucker) {
            //TODO: BasicTrucker is not compatible with Trucker
            onAutoFillTrucker(fromMeans.means_combination.trucker as Trucker);
            autoFilledMeansFields.trucker = t("meanCombinations.linkedMeansDetected");
        }

        if (fromMeansType !== "vehicle" && fromMeans.means_combination?.vehicle) {
            //TODO: BasicVehicle is not compatible with Vehicle
            onAutoFillVehicle(fromMeans.means_combination.vehicle as Vehicle);
            autoFilledMeansFields.vehicle = t("meanCombinations.linkedMeansDetected");
        }

        if (fromMeansType !== "trailer" && fromMeans.means_combination?.trailer) {
            //TODO: BasicTrailer is not compatible with Trailer
            onAutoFillTrailer(fromMeans.means_combination.trailer as Trailer);
            autoFilledMeansFields.trailer = t("meanCombinations.linkedMeansDetected");
        }

        return autoFilledMeansFields;
    };

    const getAutoFilledFieldIcon = (source: AutoFilledMeansFields["source"]): IconNames | null => {
        switch (source) {
            case "meansCombination":
                return "schedulerFlash";
            case "smartSuggestion":
                return "magicWand";
            default:
                return null;
        }
    };

    return {autoFillMeans, getAutoFilledFieldIcon};
}
