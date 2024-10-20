import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon} from "@dashdoc/web-ui";
import {Text} from "@dashdoc/web-ui";
import {CountBadge} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export interface OffersHeaderModalProps {
    offersCount: number;
}

export const OffersHeaderModal: FunctionComponent<OffersHeaderModalProps> = ({offersCount}) => (
    <Flex alignItems="center">
        <Icon color="blue.default" name="truck" mr={2} fontSize={6} />
        <Box ml={2}>
            <Flex alignItems="center">
                {offersCount > 0 && <CountBadge value={offersCount} />}
                <Text>{t("shipper.carrierOffers", {smart_count: offersCount})}</Text>
            </Flex>
        </Box>
    </Flex>
);
