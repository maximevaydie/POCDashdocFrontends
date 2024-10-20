import {useTimezone} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Flex, Icon, Link, LoadingWheel, Modal, Text, toast} from "@dashdoc/web-ui";
import {IsInvoicingConnectorAuthenticatedResponse, useToggle} from "dashdoc-utils";
import React, {ReactNode, useEffect, useState} from "react";

import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {MergeInfoDisabledModal} from "app/features/pricing/MergeInfoDisabledModal";
import {InvoicingConnectorErrorText} from "app/features/transport/update-late-transports/InvoicingConnectorErrorText";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {
    fetchBulkInvoiceTransports,
    fetchIsInvoicingConnectorAuthenticated,
} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {fetchInvoicingStatusAsync} from "app/redux/reducers/invoicing-status";
import {SearchQuery} from "app/redux/reducers/searches";
import {
    BulkCreateInvoicesResponse,
    CreatedInvoice,
    TransportsErrorsMap,
} from "app/services/invoicing";
import {
    InvoiceError,
    getInvoiceErrorMessageFromServerError,
} from "app/services/invoicing/invoiceError.service";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {InvoicingMethodStatusDashdocInvoicing} from "app/taxation/invoicing/types/invoiceMethodStatusType";

type InvoiceTransportModalProps = {
    selectedTransportsQuery: SearchQuery;
    selectedTransportsCount: number;
    onClose: () => void;
    onDashdocInvoicingNotReady: () => void;
    onInvoicesCreated?: (invoices: CreatedInvoice[]) => void;
};

type BulkCreateInvoicesStatus =
    | "thirdPartyInvoicingNotReady"
    | "dashdocInvoicingNotReady"
    | "pending"
    | "loading"
    | "done";

const InvoiceTransportModal = (props: InvoiceTransportModalProps) => {
    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const timezone = useTimezone();

    const [transportInvoicedCount, setTransportInvoicedCount] = useState(0);
    const [transportNotInvoicedCount, setTransportNotInvoicedCount] = useState(0);
    const [mergingInfoDisabled, showMergingInfoDisabled, hideMergingInfoDisabled] = useToggle();
    const [transportsErrors, setTransportsErrors] = useState<ReactNode[]>([]);
    const [invoiceCount, setInvoiceCount] = useState(0);
    const [status, setStatus] = useState<BulkCreateInvoicesStatus>("loading");
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    useEffect(() => {
        let abortAsyncOnCleanupFlag = false;
        const cleanup = () => {
            // Since this useEffect is async we need a cleanup mechanism
            abortAsyncOnCleanupFlag = true;
        };
        const fetchThirdPartyInvoicingStatus = async () => {
            try {
                const response: IsInvoicingConnectorAuthenticatedResponse = await dispatch(
                    fetchIsInvoicingConnectorAuthenticated()
                );
                if (abortAsyncOnCleanupFlag) {
                    // If the component is unmounted, we don't want to try to set the state
                    return;
                }
                if (response.response.isAuthenticated) {
                    setStatus("pending");
                    return;
                }
                if (response.response.authenticationData?.code === "no_invoicing_connector") {
                    // We can invoice without invoicing connector, so that's not an error
                    setStatus("pending");
                    return;
                }
                setStatus("thirdPartyInvoicingNotReady");
            } catch (e) {
                Logger.error(e);
                setStatus("thirdPartyInvoicingNotReady");
            }
        };
        const fetchDashdocInvoicingStatus = async () => {
            try {
                const response =
                    (await fetchInvoicingStatusAsync()) as InvoicingMethodStatusDashdocInvoicing;
                if (abortAsyncOnCleanupFlag) {
                    // If the component is unmounted, we don't want to try to set the state
                    return;
                }
                if (response?.is_ready_for_invoicing) {
                    setStatus("pending");
                    return;
                }
                setStatus("dashdocInvoicingNotReady");
            } catch (e) {
                Logger.error(e);
                setStatus("dashdocInvoicingNotReady");
            }
        };

        if (hasDashdocInvoicingEnabled) {
            fetchDashdocInvoicingStatus();
        } else {
            fetchThirdPartyInvoicingStatus();
        }

        return cleanup;
    }, [hasDashdocInvoicingEnabled, dispatch]);

    const setInvoiceTransportErrorMessages = (transportsErrorsMap: TransportsErrorsMap) => {
        let errorMessages: ReactNode[] = [];
        for (const [errorCode, transportsIds] of Object.entries(transportsErrorsMap)) {
            if (transportsIds.length === 0) {
                continue;
            }
            const transportLinks = transportsIds.map((transportIds, index) => (
                <>
                    {index > 0 && ", "}
                    <Link
                        onClick={() =>
                            window.open(`/app/transports/${transportIds.uid}/`, "_blank")
                        }
                    >
                        {transportIds.pk}
                    </Link>
                </>
            ));
            errorMessages.push(
                <Text data-testid={`invoicing-error-message-${errorCode}`}>
                    {getInvoiceErrorMessageFromServerError(errorCode as InvoiceError)}{" "}
                    {transportLinks}
                </Text>
            );
        }
        setTransportsErrors(errorMessages);
    };

    const handleCreateInvoicesError = async (error: any) => {
        if (error.status >= 400 && error.status < 500) {
            const errorData: BulkCreateInvoicesResponse = await error.json();
            if (errorData.invoice_creation_errors) {
                setInvoiceTransportErrorMessages(errorData.invoice_creation_errors);
                setTransportNotInvoicedCount(props.selectedTransportsCount);
                setStatus("done");
                return;
            }
        }
        toast.error(t("common.error"));
        setStatus("pending");
        throw error;
    };

    const createInvoices = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setStatus("loading");
        try {
            const bulkCreateAction = await fetchBulkInvoiceTransports(
                getTransportsQueryParamsFromFiltersQuery(props.selectedTransportsQuery, timezone)
            )(dispatch);

            const response: BulkCreateInvoicesResponse = bulkCreateAction.response;
            if (response.warnings.reset_merge_by_invoices_uid.length > 0) {
                showMergingInfoDisabled();
            }

            const invoiceCount = response.invoices.length;
            setInvoiceCount(invoiceCount);
            setTransportInvoicedCount(response.invoiced_transport_count);
            setInvoiceTransportErrorMessages(response.invoice_creation_errors);
            setTransportNotInvoicedCount(
                props.selectedTransportsCount - response.invoiced_transport_count
            );
            setStatus("done");
            props.onInvoicesCreated?.(response.invoices);
        } catch (error) {
            handleCreateInvoicesError(error);
        }
    };

    const onConfirmUnderstanding = () => {
        transportListRefresher();
        props.onClose();
    };

    let mainButtonProps;
    switch (status) {
        case "done":
            mainButtonProps = {
                onClick: onConfirmUnderstanding,
                children: t("common.confirmUnderstanding"),
            };
            break;
        case "dashdocInvoicingNotReady":
            mainButtonProps = {
                onClick: () => {
                    props.onClose();
                    props.onDashdocInvoicingNotReady();
                },
                children: t("invoiceTransportsModal.dashdocInvoicingNotReadyButton"),
            };
            break;
        default:
            mainButtonProps = {
                onClick: createInvoices,
                loading: status === "loading",
                disabled:
                    props.selectedTransportsCount === 0 ||
                    status === "thirdPartyInvoicingNotReady",
                children: t("invoiceTransportsModal.sendToInvoice"),
                "data-testid": "invoice-transports-modal-button",
            };
    }

    return (
        <>
            <Modal
                title={t("invoiceTransportsModal.Title")}
                id="invoice-modal"
                onClose={props.onClose}
                mainButton={mainButtonProps}
                secondaryButton={status === "done" ? null : {}}
                data-testid="invoice-transports-modal"
            >
                {status === "thirdPartyInvoicingNotReady" && (
                    <InvoicingConnectorErrorText data-testid="invoice-transports-modal-unable-text" />
                )}
                {status === "dashdocInvoicingNotReady" && <DashdocInvoicingNotReadyErrorText />}
                {status === "pending" && (
                    <Text variant="h1" textAlign="center">
                        {t("invoiceTransportsModal.Body", {
                            smart_count: props.selectedTransportsCount,
                        })}
                    </Text>
                )}
                {status === "loading" && <LoadingWheel noMargin />}
                {status === "done" && (
                    <>
                        <Text variant="title" textAlign="center" mb={2}>
                            {t("invoice.doneInvoicingTransportFromInvoiceTransportModal")}
                        </Text>
                        {transportInvoicedCount > 0 && invoiceCount > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="checkCircle"
                                    color="green.default"
                                    alignSelf="center"
                                />
                                <Text data-testid="invoice-transports-modal-success-text">
                                    {t("invoiceTransportsModal.invoicesCreated.transports", {
                                        smart_count: transportInvoicedCount,
                                    })}{" "}
                                    {t("invoiceTransportsModal.invoicesCreated.invoices", {
                                        smart_count: invoiceCount,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {transportNotInvoicedCount > 0 && (
                            <Flex>
                                <Icon
                                    mr={2}
                                    name="removeCircle"
                                    color="red.default"
                                    alignSelf="center"
                                />
                                <Text data-testid="invoice-transports-modal-error-text">
                                    {t("invoiceTransportsModal.transportNotInvoicedCount", {
                                        smart_count: transportNotInvoicedCount,
                                    })}
                                </Text>
                            </Flex>
                        )}
                        {transportsErrors}
                    </>
                )}
            </Modal>
            {mergingInfoDisabled && <MergeInfoDisabledModal onClose={hideMergingInfoDisabled} />}
        </>
    );
};

function DashdocInvoicingNotReadyErrorText() {
    return <Text>{t("invoiceTransportsModal.dashdocInvoicingNotReady")}</Text>;
}

export default InvoiceTransportModal;
