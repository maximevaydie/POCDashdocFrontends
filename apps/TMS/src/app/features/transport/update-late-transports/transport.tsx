import {apiService} from "@dashdoc/web-common";
import {getErrorMessage} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, UploadButton} from "@dashdoc/web-ui";
import {
    deliveryIsQualimat,
    TransportMessagePost,
    populateFormData,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";

import {AddLateDocumentModal} from "../../document/add-late-document-modal";

import {TransportDeliveryInfo} from "./transport-delivery-info";
import {TransportDocuments} from "./transport-documents";
import {TransportInformations} from "./transport-informations";

import type {Transport} from "app/types/transport";

export type SimpleTransportStatus = "ongoing" | "done" | "cancelled";

export enum UserPersona {
    // Invited carrier with consignment note missing
    REMINDER_DOCUMENT = "1",
    // Invited carrier with almost no activity on Dashdoc
    REMINDER_STATUS = "2",
}

interface LateTransportProps {
    userCompany: Parameters<typeof AddLateDocumentModal>[0]["userCompany"];
    transport: Transport;
    persona: UserPersona;
    updatesEnabled: boolean;
    setError: (error: string | null) => void;
    setQualimatWarning: (enabled: boolean) => void;
    onDocumentAdded: () => void;
    onStatusChange: () => void;
}

export function LateTransport({
    userCompany,
    transport,
    persona,
    updatesEnabled,
    setError,
    setQualimatWarning,
    onDocumentAdded,
    onStatusChange,
}: LateTransportProps) {
    const [selectedDocument, setSelectedDocument] = useState<File | null>(null);
    const [isStatusLoading, loadStatus, unloadStatus] = useToggle(false);
    const [isDocumentLoading, loadDocument, unloadDocument] = useToggle(false);
    const handleDocumentSelected = useCallback(
        (files: FileList) => {
            const file = files[0];
            setSelectedDocument(file);
        },
        [setSelectedDocument]
    );

    const isQualimatPreventingStatusUpdate = useMemo(() => {
        const isTransportQualimat = !!transport.deliveries.find((delivery) =>
            deliveryIsQualimat(delivery)
        );

        const isTransportMissingPlates = !!transport.segments.find((segment) => !segment.vehicle);
        return isTransportQualimat && isTransportMissingPlates;
    }, [transport]);

    const onAddDocument = async (document: TransportMessagePost) => {
        loadDocument();
        try {
            const payload = {...document, transport_uid: transport.uid};
            const formData = populateFormData(payload);
            await apiService.post(
                `/public-portal-transport/${transport.uid}/add-missing-document/`,
                formData,
                {
                    apiVersion: "web",
                }
            );
        } catch (error) {
            setError(await getErrorMessage(error, null));
        }
        unloadDocument();
        onDocumentAdded();
        setSelectedDocument(null);
    };

    const handleCloseDocumentModal = useCallback(() => {
        setSelectedDocument(null);
    }, [setSelectedDocument]);

    const handleStatusChange = useCallback(
        async (status: SimpleTransportStatus) => {
            loadStatus();
            switch (status) {
                case "done":
                    try {
                        await apiService.post(
                            `/public-portal-transport/${transport.uid}/mark-done/`,
                            null,
                            {
                                apiVersion: "web",
                            }
                        );
                    } catch (error) {
                        setError(await getErrorMessage(error, null));
                    }
                    break;
                case "cancelled":
                    try {
                        await apiService.post(
                            `/public-portal-transport/${transport.uid}/cancel/`,
                            {
                                cancel_reason: t("updateLateTransports.cancelReason"),
                            },
                            {apiVersion: "web"}
                        );
                    } catch (error) {
                        if (error.status === 403) {
                            setError(t("updateLateTransports.cantCancelOngoingTransport"));
                        } else {
                            setError(await getErrorMessage(error, null));
                        }
                    }
                    break;
                default:
                    break;
            }
            unloadStatus();
            onStatusChange();
        },
        [loadStatus, onStatusChange, setError, transport.uid, unloadStatus]
    );

    useEffect(() => {
        if (isQualimatPreventingStatusUpdate) {
            setQualimatWarning(true);
        } else {
            setQualimatWarning(false);
        }
    }, [transport]);

    const transportInformations = (
        <TransportInformations
            transport={transport}
            persona={persona}
            qualimatPreventStatusUpdate={isQualimatPreventingStatusUpdate}
            onStatusChange={updatesEnabled ? handleStatusChange : null}
            statusLoading={isStatusLoading}
        />
    );
    const transportDeliveryInfos = (
        <Flex flexDirection="column">
            {transport.deliveries.map((delivery) => (
                <TransportDeliveryInfo key={`delivery-${delivery.uid}`} delivery={delivery} />
            ))}
        </Flex>
    );

    let firstComponent = transportInformations;
    let secondComponent = transportDeliveryInfos;

    if (persona === UserPersona.REMINDER_STATUS && updatesEnabled) {
        firstComponent = transportDeliveryInfos;
        secondComponent = transportInformations;
    }

    return (
        <Flex flexDirection="column" p={5}>
            <Flex justifyContent="space-between">
                {firstComponent}
                {updatesEnabled && persona === UserPersona.REMINDER_DOCUMENT && (
                    <Box>
                        <UploadButton
                            buttonDataTestId="late-transport-upload-document-button"
                            disabled={isDocumentLoading}
                            onFileChange={handleDocumentSelected}
                            accept="image/*,.pdf"
                        >
                            <Icon mr={1} name="add" fontSize={1} />
                            {t("updateLateTransports.addCN")}
                        </UploadButton>
                    </Box>
                )}
            </Flex>
            {secondComponent}
            <TransportDocuments
                transport={transport}
                onAddDocument={updatesEnabled ? handleDocumentSelected : null}
                isLoading={isDocumentLoading}
            />
            {selectedDocument && (
                <AddLateDocumentModal
                    data-testid="late-transport-add-document-modal"
                    userCompany={userCompany}
                    transport={transport}
                    file={selectedDocument}
                    onSubmit={onAddDocument}
                    onClose={handleCloseDocumentModal}
                />
            )}
        </Flex>
    );
}
