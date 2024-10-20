import {t} from "@dashdoc/web-core";
import {Button} from "@dashdoc/web-ui";
import {Callout, Modal, Text} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {InvoiceableCompany, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {useCreateBareCreditNote} from "app/taxation/invoicing/features/credit-note/hooks/bareCreditNoteHook";
import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";
import {useInvoicingStatusForDashdocInvoicing} from "app/taxation/invoicing/hooks/useInvoicingMethodStatus";
import {toastCreateBareCreditNoteError} from "app/taxation/invoicing/services/invoicingToasts";

export const CreateBareCreditNoteAction = ({
    onSuccess,
}: {
    onSuccess: (creditNoteUid: string) => unknown;
}) => {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const [
        isInvoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle();
    return (
        <>
            <Button onClick={openModal} data-testid="create-bare-credit-note-button">
                {t("creditNotes.createTransportLessCreditNote")}
            </Button>
            {isModalOpen && (
                <CreateBareCreditNoteModal
                    onSuccess={onSuccess}
                    onClose={closeModal}
                    onDashdocInvoicingNotReady={openInvoicingOnboardingModal}
                />
            )}
            {isInvoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard onClose={closeInvoicingOnboardingModal} />
            )}
        </>
    );
};

const CreateBareCreditNoteModal = ({
    onSuccess,
    onClose,
    onDashdocInvoicingNotReady,
}: {
    onSuccess: (invoiceUid: string) => unknown;
    onClose: () => unknown;
    onDashdocInvoicingNotReady: () => unknown;
}) => {
    const [customerToInvoice, setCustomerToInvoice] = useState<InvoiceableCompany | null>(null);
    const {loading: isLoadingCreateBareCreditNote, createBareCreditNote} =
        useCreateBareCreditNote();
    const {
        loading: isFetchingInvoicingStatusLoading,
        error: hasFetchInvoicingStatusError,
        invoicingStatus,
    } = useInvoicingStatusForDashdocInvoicing();

    const loading = isLoadingCreateBareCreditNote || isFetchingInvoicingStatusLoading;

    let modalContent;
    let mainButtonProps = {
        disabled: customerToInvoice === null || loading,
        onClick: async () => {
            if (customerToInvoice) {
                const result = await createBareCreditNote(customerToInvoice.pk);
                if (result.error) {
                    toastCreateBareCreditNoteError();
                }
                if (!result.error && result.newBareCreditNote !== undefined) {
                    onClose();
                    onSuccess(result.newBareCreditNote.uid);
                }
            }
        },
        children: t("common.confirm"),
    };

    if (loading) {
        modalContent = <LoadingWheel />;
    } else if (hasFetchInvoicingStatusError) {
        modalContent = <Callout variant="danger">{t("common.error")}</Callout>;
    } else if (
        invoicingStatus?.invoicing_method === "dashdoc-invoicing" &&
        !invoicingStatus?.is_ready_for_invoicing
    ) {
        modalContent = <Text>{t("invoiceTransportsModal.dashdocInvoicingNotReady")}</Text>;
        mainButtonProps = {
            disabled: false,
            onClick: async () => {
                onClose();
                onDashdocInvoicingNotReady();
            },
            children: t("invoiceTransportsModal.dashdocInvoicingNotReadyButton"),
        };
    } else {
        modalContent = (
            <>
                <Text mb={4}>{t("invoices.CreateBareCreditNoteIntroText")}</Text>
                <CustomerToInvoiceSelect
                    value={customerToInvoice}
                    onChange={setCustomerToInvoice}
                    data-testid="customer-to-invoice-select"
                    required
                    isShipper={true}
                />
            </>
        );
    }
    return (
        <Modal
            title={t("invoices.CreateBareCreditNoteTitle")}
            mainButton={mainButtonProps}
            onClose={onClose}
        >
            {modalContent}
        </Modal>
    );
};
