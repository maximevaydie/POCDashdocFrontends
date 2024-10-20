import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text} from "@dashdoc/web-ui";
import {DecoratedSection} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {CarrierAssignationRuleLink} from "app/features/transportation-plan/carrier-assignation-rule/CarrierAssignationRuleLink";
import {OfferTooltip} from "app/features/transportation-plan/carrier-offer/components/OfferTooltip";

import {CarrierCard, PricingDetails} from "../types";

export interface CarrierDraftAssignedProps {
    carrierCard: CarrierCard;
    pricingDetails: PricingDetails | null;
    assignationMode: "auto" | "manual" | null;
    date: string;
    rule: {id: number; name: string; deleted: string | null} | null;
    onConfirmAssignation: () => void;
    onSelectAutomation: () => void;
    onCancel: () => void;
}
export const CarrierCardDraftAssigned: FunctionComponent<CarrierDraftAssignedProps> = ({
    carrierCard,
    pricingDetails,
    date,
    assignationMode,
    rule,
    onConfirmAssignation,
    onSelectAutomation,
    onCancel,
}) => {
    const dateSubTitlePart = `${t("common.assigned")} ${
        date && " " + t("common.onDate", {date})
    } ${t("shipper.transportWaitingToBeSent")}`;
    const subTitle = (
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
            {` ${dateSubTitlePart}`}
        </>
    );

    return (
        <DecoratedSection
            {...carrierCard}
            subTitle={subTitle}
            badgeLabel={t("components.planned")}
        >
            <Box justifyContent="flex-end">
                <Box>
                    <Flex justifyContent="flex-end">
                        {pricingDetails && (
                            <>
                                <Text pr={2}>{pricingDetails.value}</Text>
                                <OfferTooltip
                                    rows={pricingDetails.rows}
                                    value={pricingDetails.value}
                                />
                            </>
                        )}
                    </Flex>
                    <Flex>
                        <Button
                            variant="plain"
                            severity="danger"
                            onClick={onCancel}
                            ml={2}
                            style={{whiteSpace: "nowrap"}}
                            data-testid="cancel-draft-carrier"
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={onConfirmAssignation}
                            minWidth="auto"
                            data-testid="send-request-to-carrier"
                        >
                            {t("common.sendRequest")}
                        </Button>
                    </Flex>
                </Box>
            </Box>
        </DecoratedSection>
    );
};
