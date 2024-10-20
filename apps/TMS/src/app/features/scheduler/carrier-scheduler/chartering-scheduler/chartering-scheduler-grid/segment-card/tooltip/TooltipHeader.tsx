import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Decoration} from "app/features/scheduler/carrier-scheduler/carrierScheduler.types";

import {RawCarrierCharteringSchedulerSegment} from "../../chartering-scheduler.types";

export const TooltipHeader: FunctionComponent<{
    decoration: Decoration;
    charteringSegment: RawCarrierCharteringSchedulerSegment;
    inconsistentOrder: boolean;
}> = ({decoration, charteringSegment, inconsistentOrder}) => {
    const tooltipHoursWarning = inconsistentOrder && (
        <Box py={2} borderTop="1px solid" borderColor="grey.light">
            <Text
                backgroundColor="yellow.ultralight"
                color="yellow.dark"
                variant="caption"
                lineHeight={0}
                p={1}
            >
                {t("scheduler.inconsistentTimeOrder")}
            </Text>
        </Box>
    );

    return (
        <>
            <Text variant="h1" mb={1}>
                {charteringSegment.transport.shipper?.name}
            </Text>
            <Flex pb={2}>
                <Flex
                    width="30px"
                    flexShrink={0}
                    height="30px"
                    backgroundColor={decoration.color}
                    mr={2}
                    borderRadius={1}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Icon
                        name={(decoration as Decoration).statusIcon ?? "calendar"}
                        color="grey.white"
                        strokeWidth={(decoration as Decoration).statusIconStrokeWidth ?? 2}
                    />
                </Flex>
                <Box>
                    <Text variant="caption" lineHeight={0}>
                        {decoration.statusLabel
                            ? t(decoration.statusLabel)
                            : t("siteStatusBadgde.planned")}
                    </Text>
                </Box>
            </Flex>
            {tooltipHoursWarning}
        </>
    );
};
