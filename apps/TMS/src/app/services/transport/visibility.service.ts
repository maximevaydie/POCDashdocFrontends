import {t} from "@dashdoc/web-core";
import {VisibilityLevel} from "dashdoc-utils";

type VisibilityIcon = "unlock" | "shipper" | "lock";
export function getVisibilityIcon(visibilityLevel: VisibilityLevel): VisibilityIcon {
    let icon: VisibilityIcon = "unlock";
    if (visibilityLevel === "own_company_only") {
        icon = "shipper";
    } else if (visibilityLevel === "own_company_only_except_truckers") {
        icon = "lock";
    }
    return icon;
}

export function getVisibilityLabelText(visibilityLevel: VisibilityLevel) {
    let text = t("visibilityLabel.allActors");
    if (visibilityLevel === "own_company_only") {
        text = t("visibilityLabel.ownCompanyOnly");
    } else if (visibilityLevel === "own_company_only_except_truckers") {
        text = t("visibilityLabel.ownCompanyExceptTruckers");
    }
    return text;
}

export function getOneWordVisibilityLabel(visibilityLevel: VisibilityLevel) {
    let oneWordLabel = t("components.public");
    if (visibilityLevel === "own_company_only") {
        oneWordLabel = t("components.enterprise");
    } else if (visibilityLevel === "own_company_only_except_truckers") {
        oneWordLabel = t("components.exploitation");
    }
    return oneWordLabel;
}
