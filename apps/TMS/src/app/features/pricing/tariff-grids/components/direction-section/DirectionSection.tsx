import {t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegion, Flex, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {Landmark} from "app/features/pricing/tariff-grids/components/direction-section/Landmark";
import {TariffGrid, TariffGridZone} from "app/features/pricing/tariff-grids/types";

type DirectionSectionProps = {
    originOrDestination: TariffGridZone | null;
    isOriginOrDestination: TariffGrid["is_origin_or_destination"];
    onClick: () => unknown;
};

const svgArrow = (
    <svg width="15" height="65" viewBox="0 0 15 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M14 0.999023L14 0.499023L14.5 0.499023L14.5 0.999023L14 0.999023ZM14 33.999L14.5 33.999L14.5 34.499L14 34.499L14 33.999ZM0.646448 34.3526C0.451186 34.1573 0.451186 33.8407 0.646448 33.6455L3.82843 30.4635C4.02369 30.2682 4.34027 30.2682 4.53554 30.4635C4.7308 30.6588 4.7308 30.9753 4.53554 31.1706L1.70711 33.999L4.53554 36.8274C4.7308 37.0227 4.7308 37.3393 4.53554 37.5346C4.34027 37.7298 4.02369 37.7298 3.82843 37.5346L0.646448 34.3526ZM1 0.499023L14 0.499023L14 1.49902L1 1.49902L1 0.499023ZM14.5 0.999023L14.5 33.999L13.5 33.999L13.5 0.999023L14.5 0.999023ZM14 34.499L1 34.499L1 33.499L14 33.499L14 34.499Z"
            fill="#919EAB"
        />
    </svg>
);

export const DirectionSection: FC<DirectionSectionProps> = ({
    originOrDestination,
    isOriginOrDestination,
    onClick,
}) => {
    return (
        <Box
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            borderBottomColor="grey.light"
            p={3}
        >
            <Text variant="h1" mb={2}>
                {t("tariffGrids.GridDirection")}
            </Text>
            <ClickableUpdateRegion
                clickable
                onClick={onClick}
                data-testid="direction-update-region"
            >
                <Flex p={2}>
                    <Flex flexDirection="column" flexGrow={1} mr={2}>
                        <Landmark
                            siteCategory="origin"
                            originOrDestination={originOrDestination}
                            isOriginOrDestination={isOriginOrDestination}
                            data-testid="origin-landmark"
                        />
                        <Landmark
                            mt={2}
                            siteCategory="destination"
                            originOrDestination={originOrDestination}
                            isOriginOrDestination={isOriginOrDestination}
                            data-testid="destination-landmark"
                        />
                    </Flex>
                    {svgArrow}
                </Flex>
            </ClickableUpdateRegion>
        </Box>
    );
};
