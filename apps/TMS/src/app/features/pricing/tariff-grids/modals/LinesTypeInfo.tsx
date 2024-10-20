import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {DistanceRangeIllustration} from "app/features/pricing/tariff-grids/modals/DistanceRangeIllustration";
import {TariffGridLinesType} from "app/features/pricing/tariff-grids/types";

type LinesTypeInfoProps = {
    linesType: TariffGridLinesType;
};

export const LinesTypeInfo: FC<LinesTypeInfoProps> = ({linesType}) => {
    if (linesType === "distance_range_in_km") {
        return (
            <Flex mt={2} flexGrow={1}>
                <Text
                    variant="caption"
                    overflowWrap="break-word"
                    css={{inlineSize: "200px"}}
                    mr={4}
                >
                    {t("tariffGrids.DistanceRangeHelpText")}
                </Text>
                <DistanceRangeIllustration />
            </Flex>
        );
    } else if (linesType === "zones") {
        return (
            <Box mt={2}>
                <Text variant="caption">{t("tariffGrids.GeoAreaHelpText")}</Text>
            </Box>
        );
    }

    return null;
};
