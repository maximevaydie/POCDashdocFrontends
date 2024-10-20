import {TranslationKeys} from "@dashdoc/web-core";

export type FleetType = "truckers" | "plates";
function getLabelKey(type: FleetType): TranslationKeys {
    return type === "truckers"
        ? "export.trucker.unavailabilities"
        : "export.plates.unavailabilities";
}

export const exportService = {getLabelKey};
