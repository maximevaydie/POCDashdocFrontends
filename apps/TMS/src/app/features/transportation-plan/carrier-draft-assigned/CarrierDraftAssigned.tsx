import {useDispatch, useTimezone} from "@dashdoc/web-common";
import {LoadingWheel} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, Pricing} from "dashdoc-utils";
import {toDate} from "date-fns-tz";
import React, {FunctionComponent, useMemo, useState} from "react";

import {CarrierAssignationRuleModal} from "app/features/transportation-plan/carrier-assignation-rule/carrier-assignation-rule-modal/CarrierAssignationRuleModal";
import {useCarrierCard} from "app/features/transportation-plan/hooks/useCarrierCard";
import {usePricingDetails} from "app/features/transportation-plan/hooks/usePricingDetails";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useAssignationRule} from "app/hooks/useAssignationRule";
import {useIsReadOnly} from "app/hooks/useIsReadOnly";
import {
    fetchConfirmTransportDraftAssigned,
    fetchRemoveDraftCarrier,
} from "app/redux/actions/transports";
import {SearchQuery} from "app/redux/reducers/searches";

import {CarrierCardDraftAssigned} from "./CarrierCardDraftAssigned";

import type {Transport} from "app/types/transport";

export interface Props {
    transport: Transport;
    agreedPrice: Pricing | null;
    onConfirmAssignation: () => void;
    onCancelAssignation: () => void;
}
export const CarrierDraftAssigned: FunctionComponent<Props> = ({
    transport,
    agreedPrice,
    onConfirmAssignation,
    onCancelAssignation,
}) => {
    const dispatch = useDispatch();

    const pricingDetails = usePricingDetails(agreedPrice);
    const carrierCard = useCarrierCard(transport);
    const isReadOnly = useIsReadOnly();
    const timezone = useTimezone();
    const {rule, updateRule, isRuleSubmitting, isLoading} = useAssignationRule(transport);
    const transportListRefresher = useRefreshTransportLists();
    const {carrier_assignation_date} = transport;

    const [displayRule, setDisplayRule] = useState<boolean>(false);
    const confirmFilters: SearchQuery = {uid__in: [transport.uid]};

    const date: string | undefined = useMemo(() => {
        let result;
        if (carrier_assignation_date) {
            result = formatDate(
                parseAndZoneDate(toDate(carrier_assignation_date), timezone),
                "PPPp"
            );
        }
        return result;
    }, [timezone, carrier_assignation_date]);

    return (
        <>
            {isLoading || !date || !carrierCard ? (
                <LoadingWheel />
            ) : (
                <CarrierCardDraftAssigned
                    date={date}
                    assignationMode={transport.carrier_assignation_mode}
                    rule={transport.carrier_assignation_rule}
                    carrierCard={carrierCard}
                    pricingDetails={pricingDetails}
                    onConfirmAssignation={async () => {
                        await dispatch(fetchConfirmTransportDraftAssigned(confirmFilters));
                        transportListRefresher();
                        onConfirmAssignation();
                    }}
                    onSelectAutomation={() => setDisplayRule(true)}
                    onCancel={async () => {
                        await dispatch(fetchRemoveDraftCarrier(transport.uid));
                        transportListRefresher();
                        onCancelAssignation();
                    }}
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
};
