import {LoadingWheel} from "@dashdoc/web-ui";
import {Pricing} from "dashdoc-utils";
import React, {useState} from "react";

import {CarrierAssignationRuleModal} from "app/features/transportation-plan/carrier-assignation-rule/carrier-assignation-rule-modal/CarrierAssignationRuleModal";
import {useCarrierCard} from "app/features/transportation-plan/hooks/useCarrierCard";
import {usePricingDetails} from "app/features/transportation-plan/hooks/usePricingDetails";
import {useAssignationRule} from "app/hooks/useAssignationRule";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";

import {useLastCarrierApprovalDate} from "../hooks/useLastCarrierApprovalDate";

import {CarrierOfferRequested} from "./CarrierOfferRequested";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    agreedPrice: Pricing | null;
    onAbort: () => void;
};
export const CancelableOffer = ({transport, agreedPrice, onAbort}: Props) => {
    const date = useLastCarrierApprovalDate(transport);
    const pricingDetails = usePricingDetails(agreedPrice);
    const carrierCard = useCarrierCard(transport);
    const isReadOnly = useIsReadOnly();
    const {rule, updateRule, isRuleSubmitting, isLoading} = useAssignationRule(transport);
    const [displayRule, setDisplayRule] = useState<boolean>(false);

    if (date && carrierCard) {
        return (
            <>
                {isLoading ? (
                    <LoadingWheel />
                ) : (
                    <CarrierOfferRequested
                        date={date}
                        assignationMode={transport.carrier_assignation_mode}
                        rule={transport.carrier_assignation_rule}
                        carrierCard={carrierCard}
                        pricingDetails={pricingDetails}
                        onAbortRequest={onAbort}
                        onSelectAutomation={() => setDisplayRule(true)}
                    />
                )}
                {displayRule && rule && (
                    <CarrierAssignationRuleModal
                        onSubmit={updateRule}
                        isSubmitting={isRuleSubmitting}
                        isReadOnly={isReadOnly}
                        onClose={() => setDisplayRule(false)}
                        entity={rule}
                    />
                )}
            </>
        );
    }
    return null;
};
