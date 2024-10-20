import {LogisticPoint} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {NoWrap} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};
export function CoordinatesValidatedCell({logisticPoint}: Props) {
    if (!logisticPoint.coords_validated) {
        return null;
    }
    return <NoWrap>{t("addressBook.coordinatesVerified")}</NoWrap>;
}
