import {t} from "@dashdoc/web-core";
import {Box, CompanyAvatar, Flex, Text} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import React from "react";

import {PricingDetailTooltipContent} from "app/features/transportation-plan/carrier-offer/components/OfferTooltip";
import {usePricingDetails} from "app/features/transportation-plan/hooks/usePricingDetails";

import {TransportAssignationHistory} from "../types";

import {PlannedLoadsRecap} from "./PlannedLoadsRecap";

export function AssignedTransportHistoryDetailedCard({
    transportAssignationHistory,
}: {
    transportAssignationHistory: TransportAssignationHistory;
}) {
    const quotationDetails = usePricingDetails(
        transportAssignationHistory.quotation as unknown as Pricing
    );

    return (
        <Box>
            <Flex
                borderBottomWidth={1}
                borderBottomStyle="solid"
                borderBottomColor="grey.light"
                alignItems="center"
                pb={2}
            >
                <CompanyAvatar
                    logo={transportAssignationHistory.carrier.logo}
                    name={transportAssignationHistory.carrier.name}
                />
                <Text ml={2} variant="h2">
                    {transportAssignationHistory.carrier.name}
                </Text>
            </Flex>
            <Box py={4}>
                <Text variant="h1" mb={1}>
                    {t("common.loads")}
                </Text>
                {transportAssignationHistory.deliveries.map((delivery) => (
                    <PlannedLoadsRecap key={delivery.uid} delivery={delivery} />
                ))}
            </Box>
            {quotationDetails !== null && (
                <Box py={4} borderTopWidth={1} borderTopStyle="solid" borderTopColor="grey.light">
                    <PricingDetailTooltipContent
                        title={t("common.price")}
                        rows={quotationDetails.rows}
                        value={quotationDetails.value}
                    />
                </Box>
            )}
        </Box>
    );
}
