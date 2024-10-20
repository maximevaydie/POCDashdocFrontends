import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type HasCoordsValidatedQuery = {
    has_coords_validated?: boolean;
};

export function getHasCoordsValidatedFilter(ignore = false): FilterData<HasCoordsValidatedQuery> {
    return getBooleanChoiceFilter<HasCoordsValidatedQuery>({
        key: "has-coords-validated",
        testId: "has-coords-validated",
        label: t("components.gpsCoordinates"),
        icon: "gpsCoordinates",
        conditionLabel: `${t("components.gpsCoordinatesStatus.verified").toLowerCase()} / ${t("components.gpsCoordinatesStatus.notVerified").toLowerCase()}`,
        optionsLabels: {
            on: t("components.gpsCoordinatesStatus.verified"),
            off: t("components.gpsCoordinatesStatus.notVerified"),
        },
        badgeOptionsLabels: {
            on: `${t("components.gpsCoordinates")} ${t("components.gpsCoordinatesStatus.verified").toLowerCase()}`,
            off: `${t("components.gpsCoordinates")} ${t("components.gpsCoordinatesStatus.notVerified").toLowerCase()}`,
        },
        queryKey: "has_coords_validated",
        ignore,
    });
}
