import {guid} from "@dashdoc/core";
import {fetchUsages, getSubcontractUsage} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, LoadingWheel, Modal, ModalFooter, ModalProps, Text} from "@dashdoc/web-ui";
import React, {ReactNode, useEffect, useState} from "react";

import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {AssignationHistory} from "app/features/transportation-plan/assignation-history/AssignationHistory";
import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {RequestForwarded} from "app/features/transportation-plan/plan-or-subcontract/subcontract/components/RequestForwarded";
import {SubcontractSubmit} from "app/features/transportation-plan/types";
import {useDispatch, useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";
import {SearchQuery} from "app/redux/reducers/searches";
import {getFullTransport} from "app/redux/selectors";

import {AssignCarrierOrSubcontractForm} from "../../AssignCarrierOrSubcontractForm";

import {BulkSubcontractInfo} from "./BulkSubcontractInfo";
import {LimitReached} from "./LimitReached";
import {usageService} from "./usage.service";
import {UsageCallout} from "./UsageCallout";

import type {Transport} from "app/types/transport";

const FORM_ID = "manual-charter-form";

type Props = {
    isSubmitting: boolean;
    query: SearchQuery;
    onClose: ModalProps["onClose"];
    onSubcontract: (values: SubcontractSubmit) => Promise<void>;
};

export function BulkSubcontractModal({isSubmitting, query, onSubcontract, onClose}: Props) {
    const dispatch = useDispatch();
    const usage = useSelector(getSubcontractUsage);
    const transport: Transport | null = useSelector((state) => {
        if ("uid__in" in query && Array.isArray(query.uid__in)) {
            const transportUid = query.uid__in[0];
            return getFullTransport(state, transportUid);
        }
        return null;
    });
    const usagesLoading = useSelector((state: RootState) => state.loading.usages);
    const alreadyRequested = useSelector(({account}: RootState) => account.requestPlanUpgrade);
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();
    const [selectedHistoryTransport, setSelectedHistoryTransport] =
        useState<TransportAssignationHistory>();
    const [subcontractFormKey, setSubcontractFormKey] = useState("_");

    useEffect(() => {
        dispatch(fetchUsages());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const limitReached = usageService.limitReached(usage);
    let content: ReactNode;
    if (usagesLoading) {
        content = <LoadingWheel />;
    } else if (alreadyRequested) {
        content = <RequestForwarded />;
    } else if (limitReached) {
        content = <LimitReached />;
    } else if (isSubmitting) {
        content = (
            <Box my={4}>
                <Text mt={4} textAlign="center" variant="h1">
                    {t("common.processing")}
                </Text>
                <Box my={4}>
                    <LoadingWheel noMargin />
                </Box>
            </Box>
        );
    } else {
        content = (
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
                            onSubmit={onSubcontract}
                            onChangeSendToCarrier={persistSendToCarrier}
                            isBulk={true}
                            transportUid={transport?.uid}
                            contextType="subcontracting"
                        />
                    </Box>
                    <ModalFooter
                        onClose={onClose}
                        mainButton={{
                            children: sendToCarrier
                                ? t("chartering.actions.charter")
                                : t("chartering.actions.planChartering"),
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
        );
    }

    return (
        <Modal
            title={t("chartering.actions.charter")}
            onClose={isSubmitting ? undefined : onClose}
            mainButton={null}
            id="charter-modal"
            size={limitReached ? "large" : "xlarge"}
            data-testid="charter-modal"
            animation={
                false /* avoid modal animation  (otherwise there is a fade in fade out between charter and ownFleet */
            }
        >
            {!alreadyRequested && <UsageCallout usage={usage} />}
            {content}
        </Modal>
    );
}
