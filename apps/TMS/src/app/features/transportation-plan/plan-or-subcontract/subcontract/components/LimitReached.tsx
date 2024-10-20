import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    ContractSVG,
    Flex,
    Icon,
    RecurringOffersSVG,
    RequestForQuotationsSVG,
    Text,
} from "@dashdoc/web-ui";
import React from "react";

import {RequestPlanUpgradeAction} from "./RequestPlanUpgradeAction";

export const LimitReached = () => {
    return (
        <Box m={4}>
            <FirstSection />
            <Box
                mt={4}
                mb={6}
                height="1px"
                borderTopWidth="2px"
                borderTopStyle="solid"
                borderTopColor="grey.light"
            />
            <SecondSection />
            <Callout iconDisabled mt={4}>
                <Flex alignItems="center">
                    <Box flexGrow={1}>
                        <Text fontWeight={600}>{t("offer.charterTMS.benefits.unlimited")}</Text>
                    </Box>

                    <RequestPlanUpgradeAction buttonProps={{variant: "secondary"}} />
                </Flex>
            </Callout>
        </Box>
    );
};

const FirstSection = () => (
    <Flex>
        <Box flexGrow={1}>
            <Text variant="title">{t("offer.charterTMS.title")}</Text>

            <Text mt={2} variant="h1" color="blue.dark">
                {t("offer.charterTMS.doYouCharter")}
            </Text>

            <Text my={4}>{t("offer.charterTMS.benefits")}</Text>

            <Flex mt={4}>
                <Icon fontSize={4} name="truck" />
                <Box ml={4}>
                    <Text fontWeight={600}>{t("offer.charterTMS.benefits.1.title")}</Text>
                    <Text>{t("offer.charterTMS.benefits.1.details")}</Text>
                </Box>
            </Flex>

            <Flex mt={4}>
                <Icon fontSize={4} name="masterCosts" />
                <Box ml={4}>
                    <Text fontWeight={600}>{t("offer.charterTMS.benefits.2.title")}</Text>
                    <Text>{t("offer.charterTMS.benefits.2.details")}</Text>
                </Box>
            </Flex>

            <Flex fontSize={4} mt={4}>
                <Icon name="gain" />
                <Box ml={4}>
                    <Text fontWeight={600}>{t("offer.charterTMS.benefits.3.title")}</Text>
                    <Text>{t("offer.charterTMS.benefits.3.details")}</Text>
                </Box>
            </Flex>
        </Box>

        <ContractSVG />
    </Flex>
);

const SecondSection = () => (
    <Box>
        <Text variant="captionBold">{t("offer.charterTMS.advancedFeatures")}</Text>

        <Flex mt={6} alignItems="center">
            <RecurringOffersSVG />
            <Box ml={2}>
                <Text variant="h1" color="blue.dark">
                    {t("offer.charterTMS.advancedFeatures.1.title")}
                </Text>
                <Text mt={2}>{t("offer.charterTMS.advancedFeatures.1.details")}</Text>
            </Box>
        </Flex>
        <Flex mt={3} alignItems="center">
            <RequestForQuotationsSVG />
            <Box ml={2}>
                <Text variant="h1" color="blue.dark">
                    {t("offer.charterTMS.advancedFeatures.2.title")}
                </Text>
                <Text mt={2}>{t("offer.charterTMS.advancedFeatures.2.details")}</Text>
            </Box>
        </Flex>
    </Box>
);
