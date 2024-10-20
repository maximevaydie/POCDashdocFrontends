import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text} from "@dashdoc/web-ui";
import {DecoratedSection} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {CarrierAssignationRuleLink} from "app/features/transportation-plan/carrier-assignation-rule/CarrierAssignationRuleLink";

import {CarrierCard, PricingDetails} from "../../types";

import {OfferTooltip} from "./OfferTooltip";

export interface CarrierOfferRequestedProps {
    carrierCard: CarrierCard;
    pricingDetails: PricingDetails | null;
    assignationMode: "auto" | "manual" | null;
    date: string;
    rule: {id: number; name: string; deleted: string | null} | null;
    onSelectAutomation: () => void;
    onAbortRequest: () => void;
}
export const CarrierOfferRequested: FunctionComponent<CarrierOfferRequestedProps> = ({
    carrierCard,
    pricingDetails,
    date,
    assignationMode,
    rule,
    onSelectAutomation,
    onAbortRequest,
}) => {
    const demandSentDetails = `${t("common.demandSent")}${
        date && " " + t("common.onDate", {date})
    } ${t("shipper.transportWaitingToBeValidated")}`;
    let subTitle: React.ReactNode;
    subTitle = (
        <>
            {assignationMode == "auto" && (
                <>
                    {`${t("shipper.transportAutoAssignation")} `}
                    {rule && (
                        <CarrierAssignationRuleLink onClick={onSelectAutomation} rule={rule} />
                    )}
                    {t("common.colon")}
                </>
            )}
            {` ${demandSentDetails}`}
        </>
    );

    return (
        <DecoratedSection
            {...carrierCard}
            subTitle={subTitle}
            badgeLabel={t("components.sentToCarrier")}
        >
            <Box justifyContent="flex-end">
                <Box>
                    <Flex justifyContent="flex-end">
                        {pricingDetails && (
                            <>
                                <Text pr={2} data-testid="offer-price">
                                    {pricingDetails.value}
                                </Text>
                                <OfferTooltip
                                    rows={pricingDetails.rows}
                                    value={pricingDetails.value}
                                />
                            </>
                        )}
                    </Flex>
                    <Button
                        variant="plain"
                        severity="danger"
                        onClick={onAbortRequest}
                        ml={2}
                        style={{whiteSpace: "nowrap"}}
                        data-testid="cancel-offer-request"
                    >
                        {t("common.abortDemand")}
                    </Button>
                </Box>
            </Box>
        </DecoratedSection>
    );
};
