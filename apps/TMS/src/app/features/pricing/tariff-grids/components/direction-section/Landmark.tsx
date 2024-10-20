import {t} from "@dashdoc/web-core";
import {Flex, Icon, FlexProps, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {displayZone} from "app/features/pricing/tariff-grids/tariffGridZoneUtils";
import {TariffGrid, TariffGridZone} from "app/features/pricing/tariff-grids/types";

type LandmarkProps = {
    siteCategory: "origin" | "destination";
    originOrDestination: TariffGridZone | null;
    isOriginOrDestination: TariffGrid["is_origin_or_destination"];
} & FlexProps;

export const Landmark: FC<LandmarkProps> = ({
    siteCategory,
    originOrDestination,
    isOriginOrDestination,
    ...flexProps
}) => {
    const isActive = siteCategory === isOriginOrDestination;

    const getLabel = () => {
        if (!isActive && siteCategory === "origin") {
            return t("tariffGrids.GridOrigin");
        }

        if (!isActive && siteCategory === "destination") {
            return t("tariffGrids.GridDestination");
        }

        if (originOrDestination === null && siteCategory === "origin") {
            return t("tariffGrid.AddAnOrigin");
        }

        if (originOrDestination === null) {
            // siteCategory === "destination"
            return t("tariffGrid.AddADestination");
        }

        return displayZone(originOrDestination);
    };

    return (
        <Flex
            flexGrow={1}
            p={1}
            px={2}
            backgroundColor={isActive ? "blue.ultralight" : "grey.light"}
            alignItems="center"
            {...flexProps}
        >
            <Icon
                name={isActive ? "address" : "tariffGrid"}
                mr={2}
                color={isActive ? "blue.default" : "grey.ultradark"}
            />
            <Text color={isActive ? "blue.default" : "grey.ultradark"}>{getLabel()}</Text>
        </Flex>
    );
};
