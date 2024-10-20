import {
    AnalyticsEvent,
    ErrorBoundary,
    NotFoundScreen,
    analyticsService,
    getConnectedCompany,
    getErrorCodes,
} from "@dashdoc/web-common";
import {Logger, SupportedLocale, t} from "@dashdoc/web-core";
import {Box, CommonScreen, Flex, LoadingWheel, SidePanelProvider, toast} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {useHistory, useParams} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {EditInvoiceGasIndexModal} from "app/features/pricing/gas-index/edit-invoice-gas-index-modal";
import {DraftInvoiceSettings} from "app/features/pricing/invoices/invoice-details/draft-invoice-settings/DraftInvoiceSettings";
import EditInvoiceLineGroupDescriptionModal from "app/features/pricing/invoices/invoice-details/edit-invoice-line-group-description-modal";
import {InvoiceContextProvider} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {InvoiceContent} from "app/features/pricing/invoices/invoice-details/invoice-content/InvoiceContent";
import InvoiceLineModal from "app/features/pricing/invoices/invoice-line-modal/invoice-line-modal";
import {MergeInfoDisabledModal} from "app/features/pricing/MergeInfoDisabledModal";
import {
    fetchAddInvoiceLine,
    fetchDeleteInvoiceLine,
    fetchRetrieveInvoice,
    fetchUpdateInvoice,
    fetchUpdateInvoiceGasIndex,
    fetchUpdateInvoiceLine,
    loadInvoicingConnectorAuthenticated,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getInvoice} from "app/redux/reducers";
import {isFullInvoice} from "app/services/invoicing";
import {InvoiceActionsButtons} from "app/taxation/invoicing/features/invoice/actions/InvoiceActionsButtons";
import {InvoiceAttachmentsCard} from "app/taxation/invoicing/features/invoice/invoice-attachments/InvoiceAttachmentsCard";
import {InvoiceDetailRecap} from "app/taxation/invoicing/features/invoice/invoice-detail-recap/InvoiceDetailRecap";
import {InvoiceInfo} from "app/taxation/invoicing/features/invoice/invoice-info/InvoiceInfo";
import {InvoiceCreditedStatusBadges} from "app/taxation/invoicing/features/invoice/InvoiceCreditedStatusBadges";
import {InvoiceFile} from "app/taxation/invoicing/features/invoice/InvoiceFile";
import {LinksToCreditNotes} from "app/taxation/invoicing/features/invoice/LinksToCreditNotes";
import {InvoiceOrCreditNoteHeader} from "app/taxation/invoicing/features/invoice-or-credit-note/InvoiceOrCreditNoteHeader";
import {invoiceApiService} from "app/taxation/invoicing/services/invoicesApi.service";
import {
    toastInvoiceFuelSurchargeUpdateError,
    toastInvoiceLineUpdateError,
    toastSetInvoiceTemplateError,
} from "app/taxation/invoicing/services/invoicingToasts";
import {
    InvoiceLine,
    InvoiceTransport,
} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";
import {SidebarTabNames} from "app/types/constants";

import type {
    AddOrUpdateInvoiceLine,
    Invoice,
    InvoiceLineGroup,
} from "app/taxation/invoicing/types/invoice.types";

type Props = {
    invoiceUid?: string;
    fromSharing?: boolean;
    fromFloatingPanel?: boolean;
    onEditCreditNote?: (uid: string) => void;
    onDeleteInvoice?: () => void;
    onDuplicateInvoice?: (duplicatedInvoiceUid: string) => void;
};

export const InvoiceScreen: FunctionComponent<Props> = ({
    invoiceUid: invoiceUidFromProps,
    fromSharing = false,
    fromFloatingPanel = false,
    onEditCreditNote,
    onDeleteInvoice: originalOnDeleteInvoice,
    onDuplicateInvoice,
}) => {
    const match = useParams<{invoiceUid?: string}>();
    const invoiceUidFromUrl = match?.invoiceUid;
    const invoiceUid = (invoiceUidFromProps || invoiceUidFromUrl) as string;
    const history = useHistory();
    const dispatch = useDispatch();
    // aborted in the action if already loading/loaded
    dispatch(loadInvoicingConnectorAuthenticated());
    const invoice = useSelector((state) => getInvoice(state, invoiceUid));
    const [isLoading, setIsLoading, setIsNotLoading] = useToggle(
        !invoice || !isFullInvoice(invoice)
    );
    const [showAddInvoiceLineModal, openAddInvoiceLineModal, closeAddInvoiceLineModal] =
        useToggle(false);

    const [lineGroupDescriptionEdited, setLineGroupDescriptionEdited] = useState<
        InvoiceLineGroup["id"] | null
    >(null);

    const [
        showAddOrUpdateGasIndexModal,
        _openAddOrUpdateGasIndexModal,
        closeAddOrUpdateGasIndexModal,
    ] = useToggle(false);
    const [mergingInfoDisabled, showMergingInfoDisabled, hideMergingInfoDisabled] = useToggle();
    const openAddOrUpdateGasIndexModal = () => {
        _openAddOrUpdateGasIndexModal();
        analyticsService.sendEvent(AnalyticsEvent.invoiceGasIndexModalOpen, {
            "invoice uid": invoiceUid,
            "company id": connectedCompany?.pk,
        });
    };
    const connectedCompany = useSelector(getConnectedCompany);

    const invoicingConnectorLoaded = useSelector((state) => state.invoicingConnectorLoaded);

    const fetchInvoice = useCallback(async () => {
        try {
            await dispatch(fetchRetrieveInvoice(invoiceUid));
        } catch (e) {
            Logger.error(`Invoice with uid "${invoiceUid}" not found;`);
        }
        setIsNotLoading();
    }, [invoiceUid]);

    /**
     * When the invoice is opened in a separate tab, the `onDeleteInvoice` prop is not set
     * and deleting it would shows a 404 screen. Instead fallback redirect to the invoices list.
     * */
    const handleOnDeleteInvoice = useCallback(() => {
        if (originalOnDeleteInvoice) {
            originalOnDeleteInvoice();
        } else {
            history.push("/app/invoices/");
        }
    }, [history, originalOnDeleteInvoice]);

    const setDescriptionTemplate = async (templateUid: string | null) => {
        if (!invoice) {
            toastSetInvoiceTemplateError();
            return;
        }

        setIsLoading();
        try {
            await dispatch(fetchUpdateInvoice(invoice.uid, {template_uid: templateUid}));
        } catch (e) {
            Logger.error(`Failed to set invoice description template to "${templateUid}";`);
            toastSetInvoiceTemplateError();
        }
        fetchInvoice();
        setIsNotLoading();
    };

    const setBankInformation = async (bankInformationUid: string) => {
        if (!invoice) {
            return;
        }

        try {
            await dispatch(
                fetchUpdateInvoice(invoice.uid, {bank_information_uid: bankInformationUid})
            );
        } catch (e) {
            toast.error(t("common.error"));
            Logger.error(`Failed to set invoice bank information to "${bankInformationUid}";`);
        }
    };

    async function setLanguage(language: SupportedLocale) {
        if (!invoice) {
            return;
        }

        setIsLoading();
        try {
            await dispatch(fetchUpdateInvoice(invoice.uid, {language}));
        } catch (e) {
            toast.error(t("common.error"));
            Logger.error(`Failed to set invoice language to "${language}";`);
        }
        setIsNotLoading();
        fetchInvoice();
    }

    const handleRemoveTransportFromInvoice = async (transportUid: InvoiceTransport["uid"]) => {
        setIsLoading();
        try {
            await invoiceApiService.removeTransportFromInvoice(invoiceUid, transportUid);
            if (invoice && invoice.transports_count <= 1) {
                handleOnDeleteInvoice();
            } else {
                await fetchInvoice();
            }
        } catch (error) {
            toast.error(t("common.error"));
        }
        setIsNotLoading();
    };

    const handleAddInvoiceLine = async (invoiceLine: AddOrUpdateInvoiceLine) => {
        if (!invoice) {
            toast.error(t("common.error"));
            return;
        }

        setIsLoading();
        try {
            await dispatch(fetchAddInvoiceLine(invoice.uid, invoiceLine));
        } catch (error) {
            toast.error(t("invoices.couldNotCreateInvoiceLine"), {
                toastId: "could-not-create-invoice-line-toast-error",
            });
        }
        setIsNotLoading();
        fetchInvoice();
    };

    const handleUpdateStandaloneInvoiceLine = async (
        invoiceLineId: number,
        invoiceLine: AddOrUpdateInvoiceLine
    ) => {
        setIsLoading();
        try {
            await dispatch(fetchUpdateInvoiceLine(invoiceLineId, invoiceLine));
        } catch (error) {
            let errorCode: undefined | string = undefined;
            if (error instanceof Response) {
                errorCode = getErrorCodes(await error.json())?.[0];
            }
            toastInvoiceLineUpdateError(errorCode);
        }
        setIsNotLoading();
        fetchInvoice();
    };

    const handleRemoveStandaloneInvoiceLine = async (invoiceLineId: InvoiceLine["id"]) => {
        if (!invoice) {
            toast.error(t("common.error"));
            return;
        }

        setIsLoading();
        try {
            await dispatch(fetchDeleteInvoiceLine(invoiceLineId, invoice.uid));
        } catch (error) {
            toast.error(t("common.error"));
        }
        setIsNotLoading();
        fetchInvoice();
    };

    const handleUpdateGasIndex = async (
        gasIndexValue: number,
        gasIndexInvoiceItemUid: string | null
    ) => {
        if (!invoice) {
            toast.error(t("common.error"));
            return;
        }

        setIsLoading();

        try {
            const result = await dispatch(
                fetchUpdateInvoiceGasIndex(invoice.uid, gasIndexValue, gasIndexInvoiceItemUid)
            );
            const invoiceResult = Object.values(result.entities.invoices)[0] as Invoice & {
                has_merge_by_been_reset: boolean;
            };
            if (invoiceResult.has_merge_by_been_reset) {
                showMergingInfoDisabled();
            }
        } catch (error) {
            let errorCode: undefined | string = undefined;
            if (error instanceof Response) {
                errorCode = getErrorCodes(await error.json())?.[0];
            }
            toastInvoiceFuelSurchargeUpdateError(errorCode);
        }

        setIsNotLoading();
    };

    useEffect(() => {
        fetchInvoice();
    }, []);

    if (
        isLoading ||
        // Once loading is complete, the invoice should never be partial
        // but adding this here provides type narrowing for the rest of the function,
        // so `invoice` will be of type `Invoice` instead of `Invoice | PartialInvoice`.
        (invoice && !isFullInvoice(invoice))
    ) {
        return <LoadingWheel />;
    } else if (!invoice) {
        return <NotFoundScreen />;
    }
    const WrapperComponent = fromFloatingPanel ? Box : SidePanelProvider;

    return (
        <WrapperComponent>
            <ErrorBoundary>
                <InvoiceContextProvider invoice={invoice} fromSharing={fromSharing}>
                    <Flex justifyContent="center" width="100%">
                        <CommonScreen
                            data-testid="invoice-screen"
                            title={getTabTranslations(SidebarTabNames.INVOICE)}
                            customTitle={
                                invoice.document_number
                                    ? t("invoiceDetails.documentNumber", {
                                          number: invoice.document_number,
                                      })
                                    : t("components.invoice")
                            }
                            getCustomTitleWrapper={(title) => (
                                <InvoiceOrCreditNoteHeader
                                    item={invoice}
                                    fromSharing={fromSharing}
                                    title={title}
                                    additionalInfo={
                                        <InvoiceCreditedStatusBadges invoice={invoice} />
                                    }
                                    type="invoice"
                                    fromFloatingPanel={fromFloatingPanel}
                                />
                            )}
                            actions={
                                <InvoiceActionsButtons
                                    invoice={invoice}
                                    fromSharing={fromSharing}
                                    onDeleteInvoice={handleOnDeleteInvoice}
                                    onCreateCreditNote={onEditCreditNote}
                                    onDuplicateInvoice={onDuplicateInvoice}
                                    setIsLoading={setIsLoading}
                                    setIsNotLoading={setIsNotLoading}
                                />
                            }
                            shrinkScreen={fromFloatingPanel}
                        >
                            <Box className="container-fluid" p={0}>
                                {invoice.status === "draft" && !fromSharing && (
                                    <DraftInvoiceSettings
                                        invoice={invoice}
                                        onSetDescriptionTemplate={setDescriptionTemplate}
                                        onSetBankInformation={setBankInformation}
                                        onSetLanguage={setLanguage}
                                    />
                                )}

                                <LinksToCreditNotes
                                    invoice={invoice}
                                    onEditCreditNote={onEditCreditNote}
                                    fromSharing={fromSharing}
                                />

                                <InvoiceDetailRecap invoice={invoice} fromSharing={fromSharing} />

                                {invoicingConnectorLoaded ? (
                                    <>
                                        <InvoiceContent
                                            fromSharing={fromSharing}
                                            invoice={invoice}
                                            onRemoveTransportFromInvoice={(transportUid) =>
                                                handleRemoveTransportFromInvoice(transportUid)
                                            }
                                            onEditInvoiceLineGroupDescription={
                                                setLineGroupDescriptionEdited
                                            }
                                            onAddInvoiceLine={() => {
                                                openAddInvoiceLineModal();
                                            }}
                                            onRemoveStandaloneInvoiceLine={
                                                handleRemoveStandaloneInvoiceLine
                                            }
                                            onUpdateStandaloneInvoiceLine={
                                                handleUpdateStandaloneInvoiceLine
                                            }
                                            onAddOrUpdateGasIndex={openAddOrUpdateGasIndexModal}
                                        />
                                    </>
                                ) : (
                                    <LoadingWheel />
                                )}

                                {!(fromSharing && invoice.attachments.length == 0) && (
                                    <InvoiceAttachmentsCard
                                        invoice={invoice}
                                        fromSharing={fromSharing}
                                    />
                                )}

                                <InvoiceFile fromSharing={fromSharing} invoice={invoice} />

                                {!!lineGroupDescriptionEdited && (
                                    <EditInvoiceLineGroupDescriptionModal
                                        onClose={() => setLineGroupDescriptionEdited(null)}
                                        invoiceLineGroupId={lineGroupDescriptionEdited}
                                    />
                                )}

                                {showAddInvoiceLineModal && (
                                    <InvoiceLineModal
                                        mode="add"
                                        onSubmit={handleAddInvoiceLine}
                                        onClose={closeAddInvoiceLineModal}
                                        is_dashdoc={invoice.is_dashdoc}
                                    />
                                )}

                                {showAddOrUpdateGasIndexModal && (
                                    <EditInvoiceGasIndexModal
                                        invoice={invoice}
                                        onSubmit={handleUpdateGasIndex}
                                        onClose={closeAddOrUpdateGasIndexModal}
                                    />
                                )}

                                {mergingInfoDisabled && (
                                    <MergeInfoDisabledModal onClose={hideMergingInfoDisabled} />
                                )}
                            </Box>
                        </CommonScreen>

                        <InvoiceInfo invoice={invoice} />
                    </Flex>
                </InvoiceContextProvider>
            </ErrorBoundary>
        </WrapperComponent>
    );
};
