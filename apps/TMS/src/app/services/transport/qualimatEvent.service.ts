import {t} from "@dashdoc/web-core";
import {CleaningRegime} from "dashdoc-utils";

export function getCleaningRegime(regime: CleaningRegime): string {
    if (regime === "A") {
        return t("qualimat.regimeA");
    } else if (regime === "B") {
        return t("qualimat.regimeB");
    } else if (regime === "C") {
        return t("qualimat.regimeC");
    } else if (regime === "D") {
        return t("qualimat.regimeD");
    } else if (regime === "none") {
        return t("qualimat.noCleaning");
    }
    return "";
}
