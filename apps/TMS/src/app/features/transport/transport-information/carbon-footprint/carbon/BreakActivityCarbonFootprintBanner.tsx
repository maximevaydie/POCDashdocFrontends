import {t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegion, Flex, Icon, Text} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import React from "react";

import {SetBreakActivityCarbonFootprintModal} from "app/features/transport/transport-information/carbon-footprint/carbon/SetBreakActivityCarbonFootprintModal";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";
import {useTransportViewer} from "app/hooks/useTransportViewer";

import type {Site, Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    breakSite: Site;
};

export const BreakActivityCarbonFootprintBanner: React.FunctionComponent<Props> = ({
    transport,
    breakSite,
}) => {
    const [modalIsOpened, openModal, closeModal] = useToggle();

    const isReadOnlyUser = useIsReadOnly();
    const {isCarrier, isReadOnly: isReadOnlyTransport} = useTransportViewer(transport);
    const canEditCarbonFootprint = isCarrier && !isReadOnlyTransport && !isReadOnlyUser;
    return (
        <Box pr={1} borderTopColor="grey.light" borderTopWidth={1} borderTopStyle="solid">
            <ClickableUpdateRegion
                clickable={canEditCarbonFootprint}
                onClick={openModal}
                data-testid="edit-break-carbon-footprint"
            >
                <Flex m={3} alignItems="center">
                    <Icon name="ecologyLeaf" color="grey.dark" />
                    <Text ml={2} mr={4} variant="captionBold" color="grey.dark">
                        {t("carbonFootprint.title")}
                    </Text>
                    <Text
                        variant="caption"
                        color="grey.dark"
                        data-testid="edit-break-carbon-footprint-value"
                    >
                        {`${formatNumber(breakSite.manual_emission_value, {
                            maximumFractionDigits: 2,
                        })} ${t("components.carbonFootprint.unit")}`}
                    </Text>
                </Flex>
            </ClickableUpdateRegion>
            {modalIsOpened && (
                <SetBreakActivityCarbonFootprintModal breakSite={breakSite} onClose={closeModal} />
            )}
        </Box>
    );
};
