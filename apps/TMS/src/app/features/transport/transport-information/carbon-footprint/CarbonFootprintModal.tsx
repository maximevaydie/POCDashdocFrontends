import {getConnectedCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, LoadingWheel, Modal, ModeTypeSelector, Text} from "@dashdoc/web-ui";
import {TransportCarbonFootprintResponse} from "dashdoc-utils/dist/api/scopes/transports";
import React, {useCallback, useState} from "react";

import {CarbonFootprintOnboardingIcon} from "app/features/carbon-footprint/CarbonFootprintOnboardingIcon";
import {CarbonFootprintEmissionsBySource} from "app/features/transport/transport-information/carbon-footprint/CarbonFootprintEmissionsBySource";
import {EstimatedCarbonFootprint} from "app/features/transport/transport-information/carbon-footprint/EstimatedCarbonFootprint";
import {ManualCarbonFootprint} from "app/features/transport/transport-information/carbon-footprint/ManualCarbonFootprint";
import {useCarbonFootprintComputationDetails} from "app/features/transport/transport-information/carbon-footprint/useCarbonFootprintComputationDetails";
import {fetchSetCarbonFootprint} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";

import {CarbonFootprintProvider} from "./CarbonFootprintContext";

import type {Transport} from "app/types/transport";

function canDisplayEmissionsBySource(
    estimatedMethod: TransportCarbonFootprintResponse["estimated_method"]
): boolean {
    return (
        !!estimatedMethod.emission_value &&
        Object.values(estimatedMethod.emissions_by_source).some((value) => value !== null)
    );
}

type CarbonFootprintModalProps = {
    transport: Transport;
    onClose: () => void;
};

type CarbonFootprintModalContentProps = CarbonFootprintModalProps & {
    computation: TransportCarbonFootprintResponse;
    refreshCarbonFootprint: (params?: {
        distance?: number | null;
        transportOperationCategory?: Transport["transport_operation_category"];
    }) => Promise<void>;
};
export const CarbonFootprintModal: React.FunctionComponent<CarbonFootprintModalProps> = (
    props
) => {
    const {computation, refresh: refreshCarbonFootprint} = useCarbonFootprintComputationDetails(
        props.transport
    );
    const connectedCompany = useSelector(getConnectedCompany);
    const readOnly = !transportRightService.canEditCarbonFootprint(
        props.transport,
        connectedCompany?.pk
    );

    if (computation === null) {
        return (
            <Modal
                size="large"
                mainButton={null}
                onClose={props.onClose}
                title={
                    <Flex>
                        <Text variant="title">{t("carbonFootprint.modalTitle")}</Text>
                        {!readOnly && <CarbonFootprintOnboardingIcon ml={3} />}
                    </Flex>
                }
            >
                <LoadingWheel />
            </Modal>
        );
    }

    if (readOnly) {
        return (
            <CarbonFootprintProvider
                transport={props.transport}
                refreshCarbonFootprint={refreshCarbonFootprint}
            >
                <ReadOnlyCarbonFootprintModalContent
                    {...props}
                    computation={computation}
                    refreshCarbonFootprint={refreshCarbonFootprint}
                />
            </CarbonFootprintProvider>
        );
    }
    return (
        <CarbonFootprintProvider
            transport={props.transport}
            refreshCarbonFootprint={refreshCarbonFootprint}
        >
            <EditableCarbonFootprintModalContent
                {...props}
                computation={computation}
                refreshCarbonFootprint={refreshCarbonFootprint}
            />
        </CarbonFootprintProvider>
    );
};

export function EditableCarbonFootprintModalContent({
    transport,
    onClose,
    computation,
    refreshCarbonFootprint,
}: CarbonFootprintModalContentProps) {
    const dispatch = useDispatch();

    const [isSaving, setIsSaving] = useState(false);

    const [mode, setMode] = useState<"manual" | "estimated">(
        computation.manual_method.emission_value ? "manual" : "estimated"
    );

    const [manualEmissionValue, setManualEmissionValue] = useState(
        computation.manual_method.emission_value
    );
    const [distanceOverride, setDistanceOverride] = useState<number | null>(null);

    const saveCarbonFootprint = useCallback(async () => {
        setIsSaving(true);
        if (manualEmissionValue !== null && mode === "manual") {
            dispatch(fetchSetCarbonFootprint(transport.uid, manualEmissionValue));
        } else {
            await dispatch(fetchSetCarbonFootprint(transport.uid, null));
            if (distanceOverride !== null) {
                refreshCarbonFootprint({
                    distance: distanceOverride,
                });
            }
        }
        setIsSaving(false);
    }, [
        mode,
        dispatch,
        transport.uid,
        manualEmissionValue,
        distanceOverride,
        refreshCarbonFootprint,
    ]);

    return (
        <Modal
            size="xlarge"
            mainButton={{
                children: t("common.save"),
                onClick: async () => {
                    await saveCarbonFootprint();
                    onClose();
                },
                disabled: isSaving,
            }}
            secondaryButton={{
                variant: "plain",
                children: t("common.cancel"),
                onClick: onClose,
                disabled: isSaving,
            }}
            onClose={onClose}
            title={
                <Flex>
                    <Text variant="title">{t("carbonFootprint.modalTitle")}</Text>
                    <CarbonFootprintOnboardingIcon ml={3} />
                </Flex>
            }
        >
            <Flex flexDirection="row">
                <Box flex={3}>
                    <Text>{t("carbonFootprint.shareYrouCarbonFootprint")}</Text>
                    <Box mt={5} mb={3}>
                        <ModeTypeSelector<"manual" | "estimated">
                            modeList={[
                                {
                                    label: t("carbonFootprint.dashdocmethod"),
                                    value: "estimated",
                                    icon: "iso",
                                },
                                {
                                    label: t("carbonFootprint.manualMethod"),
                                    value: "manual",
                                    icon: "select",
                                },
                            ]}
                            currentMode={mode}
                            setCurrentMode={setMode}
                        />
                    </Box>
                    {mode === "estimated" ? (
                        <EstimatedCarbonFootprint
                            computation={computation}
                            transport={transport}
                            refreshCarbonFootprint={refreshCarbonFootprint}
                            distanceOverride={distanceOverride}
                            onDistanceOverrideChange={setDistanceOverride}
                        />
                    ) : (
                        <ManualCarbonFootprint
                            manualEmissionValue={manualEmissionValue}
                            onChangeManuelEmissionValue={setManualEmissionValue}
                        />
                    )}
                </Box>
                {canDisplayEmissionsBySource(computation.estimated_method) && (
                    <Box
                        flex={1}
                        borderLeftColor="grey.light"
                        borderLeftWidth="1px"
                        borderLeftStyle="solid"
                        mt={-5}
                        py={5}
                        px={3}
                    >
                        <CarbonFootprintEmissionsBySource
                            emissions_by_source={computation.estimated_method.emissions_by_source}
                        />
                    </Box>
                )}
            </Flex>
        </Modal>
    );
}

export function ReadOnlyCarbonFootprintModalContent({
    transport,
    onClose,
    computation,
    refreshCarbonFootprint,
}: CarbonFootprintModalContentProps) {
    return (
        <Modal
            size="xlarge"
            mainButton={null}
            onClose={onClose}
            title={t("carbonFootprint.modalTitle")}
            data-testid="read-only-carbon-footprint-modal"
        >
            <Flex flexDirection="row">
                <Box flex={3}>
                    <EstimatedCarbonFootprint
                        computation={computation}
                        transport={transport}
                        refreshCarbonFootprint={refreshCarbonFootprint}
                        readOnly
                    />
                </Box>
                {canDisplayEmissionsBySource(computation.estimated_method) && (
                    <Box
                        flex={1}
                        borderLeftColor="grey.light"
                        borderLeftWidth="1px"
                        borderLeftStyle="solid"
                        mt={-5}
                        py={5}
                        px={3}
                    >
                        <CarbonFootprintEmissionsBySource
                            emissions_by_source={computation.estimated_method.emissions_by_source}
                        />
                    </Box>
                )}
            </Flex>
        </Modal>
    );
}
