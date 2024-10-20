import {t} from "@dashdoc/web-core";
import {OutlinedBigIconAndTextButton, IconProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {LocationTypeValue} from "../types";

export type LocationTypeProps = {
    locationType: LocationTypeValue;
    selected?: boolean;
    onClick: () => void;
};
export const LocationType: FunctionComponent<LocationTypeProps> = ({
    locationType,
    selected,
    onClick,
}) => {
    let icon: IconProps["name"] = "address";
    let label = t("common.city");
    switch (locationType) {
        case "county":
            icon = "area";
            label = t("common.county");
            break;
        case "postcode":
            icon = "address";
            label = t("common.postcode");
            break;
        default:
            break;
    }
    return (
        <OutlinedBigIconAndTextButton
            active={selected}
            onClick={onClick}
            iconName={icon}
            label={label}
            dataTestId={`location-picker-${locationType}`}
        />
    );
};
