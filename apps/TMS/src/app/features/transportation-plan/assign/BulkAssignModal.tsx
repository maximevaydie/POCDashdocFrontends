import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Icon,
    IconNames,
    LoadingWheel,
    Modal,
    ModalFooter,
    ModalProps,
    Text,
} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {AssignationHistory} from "app/features/transportation-plan/assignation-history/AssignationHistory";
import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {AssignCarrierOrSubcontractForm} from "app/features/transportation-plan/plan-or-subcontract/AssignCarrierOrSubcontractForm";
import {BulkSubcontractInfo} from "app/features/transportation-plan/plan-or-subcontract/subcontract/components/BulkSubcontractInfo";
import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {getFullTransport} from "app/redux/selectors";

import type {Transport} from "app/types/transport";

const FORM_ID = "manual-charter-form";

type Props = {
    query: SearchQuery;
    isSubmitting: boolean;
    onClose: ModalProps["onClose"];
    onAssign: (values: SubcontractSubmit) => Promise<void>;
};

export function BulkAssignModal({query, isSubmitting, onAssign, onClose}: Props) {
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();
    const [selectedHistoryTransport, setSelectedHistoryTransport] = useState<
        TransportAssignationHistory | undefined
    >();
    const [subcontractFormKey, setSubcontractFormKey] = useState("_");

    const transport: Transport | null = useSelector((state) => {
        if ("uid__in" in query && Array.isArray(query.uid__in)) {
            const transportUid = query.uid__in[0];
            return getFullTransport(state, transportUid);
        }
        return null;
    });

    const warnings: {iconName: IconNames; iconColor: string; message: string}[] = [
        {
            iconName: "checkCircle",
            iconColor: "green.default",
            message: t("bulkAction.setPricing.priceWillBeAppliedOnAllTransportsWithoutPrice"),
        },
        {
            iconName: "checkCircle",
            iconColor: "green.default",
            message: t("bulkAction.setPricing.replaceAllExistingPricingLines"),
        },
    ];

    return (
        <Modal
            title={t("chartering.actions.assign")}
            onClose={isSubmitting ? undefined : onClose}
            mainButton={null}
            id="charter-modal"
            size="xlarge"
            data-testid="charter-modal"
            animation={
                false /* avoid modal animation  (otherwise there is a fade in fade out between charter and ownFleet */
            }
        >
            {isSubmitting && (
                <Box my={4}>
                    <Text mt={4} textAlign="center" variant="h1">
                        {t("common.processing")}
                    </Text>
                    <Box my={4}>
                        <LoadingWheel noMargin />
                    </Box>
                </Box>
            )}
            {!isSubmitting && (
                <Flex>
                    <Box width="66%">
                        <BulkSubcontractInfo />
                        <Box p={4} flexGrow={1}>
                            <AssignCarrierOrSubcontractForm
                                key={subcontractFormKey}
                                formId={FORM_ID}
                                disabled={isSubmitting}
                                initialSendToCarrierValue={sendToCarrier}
                                initialPrice={null}
                                selectedHistoryTransport={selectedHistoryTransport}
                                onSubmit={onAssign}
                                onChangeSendToCarrier={persistSendToCarrier}
                                isBulk={true}
                                transportUid={transport?.uid}
                                contextType="assignation"
                            />
                            {/* Warnings */}
                            <Box mt={4} pt={4} borderTop={"1px solid"} borderTopColor="grey.light">
                                <Text>
                                    {t(
                                        "bulkAction.setInvoiceItemOrPricing.byValidatingThisAction"
                                    )}
                                </Text>
                                {warnings.map((warning, index) => (
                                    <Flex key={`warning-${index}`} alignItems="baseline" mt={2}>
                                        <Icon
                                            name={warning.iconName}
                                            color={warning.iconColor}
                                            mr={2}
                                        />
                                        <Text>{warning.message}</Text>
                                    </Flex>
                                ))}
                            </Box>
                        </Box>
                        <ModalFooter
                            onClose={onClose}
                            mainButton={{
                                children: t("chartering.actions.assign"),
                                type: "submit",
                                loading: isSubmitting,
                                disabled: isSubmitting,
                                form: FORM_ID,
                                ["data-testid"]: "charter-modal-save-button",
                            }}
                        />
                    </Box>
                    <Box
                        mr={5}
                        ml={4}
                        borderLeftWidth={1}
                        borderLeftStyle="solid"
                        borderLeftColor="grey.light"
                    />
                    <Box width="34%" pt={1}>
                        <AssignationHistory
                            query={query}
                            transport={transport}
                            onSelect={(selectedHistoryTransport) => {
                                setSelectedHistoryTransport(selectedHistoryTransport);
                                setSubcontractFormKey(guid());
                            }}
                        />
                    </Box>
                </Flex>
            )}
        </Modal>
    );
}
