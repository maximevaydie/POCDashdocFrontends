import {t} from "@dashdoc/web-core";
import {Callout, IconLink, Modal, Text} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import {InvoiceableCompany, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";
import {InvoicingOnboardingWizard} from "app/taxation/invoicing/features/onboarding-wizard/InvoicingOnboardingWizard";
import {useInvoicingStatusForDashdocInvoicing} from "app/taxation/invoicing/hooks/useInvoicingMethodStatus";
import {useCreateBareInvoice} from "app/taxation/invoicing/services/bareInvoice";
import {toastCreateBareInvoiceError} from "app/taxation/invoicing/services/invoicingToasts";

const CreateBareInvoiceModal = ({
    onSuccess,
    onClose,
    onDashdocInvoicingNotReady,
}: {
    onSuccess: (invoiceUid: string) => unknown;
    onClose: () => unknown;
    onDashdocInvoicingNotReady: () => unknown;
}) => {
    const [customerToInvoice, setCustomerToInvoice] = useState<InvoiceableCompany | null>(null);
    const {loading: isLoadingCreateBareInvoice, createBareInvoice} = useCreateBareInvoice();
    const {
        loading: isFetchingInvoicingStatusLoading,
        error: hasFetchInvoicingStatusError,
        invoicingStatus,
    } = useInvoicingStatusForDashdocInvoicing();

    const loading = isLoadingCreateBareInvoice || isFetchingInvoicingStatusLoading;

    let modalContent;
    let mainButtonProps = {
        disabled: customerToInvoice === null || loading,
        onClick: async () => {
            if (customerToInvoice) {
                const result = await createBareInvoice(customerToInvoice.pk);
                if (result.error) {
                    toastCreateBareInvoiceError();
                }
                if (!result.error && result.newBareInvoice !== undefined) {
                    onClose();
                    onSuccess(result.newBareInvoice.uid);
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
                <Text mb={4}>{t("invoices.CreateBareInvoiceIntroText")}</Text>
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
            title={t("invoices.CreateBareInvoiceTitle")}
            mainButton={mainButtonProps}
            onClose={onClose}
        >
            {modalContent}
        </Modal>
    );
};

export const CreateBareInvoiceAction = ({
    onSuccess,
}: {
    onSuccess: (invoiceUid: string) => void;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [
        isInvoicingOnboardingModalOpen,
        openInvoicingOnboardingModal,
        closeInvoicingOnboardingModal,
    ] = useToggle();

    return (
        <>
            <IconLink
                data-testid="create-bare-invoice-action"
                text={t("invoice.createOtherInvoice")}
                iconName={"add"}
                onClick={() => {
                    setIsModalOpen(true);
                }}
            />

            {isModalOpen && (
                <CreateBareInvoiceModal
                    onSuccess={onSuccess}
                    onClose={() => {
                        setIsModalOpen(false);
                    }}
                    onDashdocInvoicingNotReady={openInvoicingOnboardingModal}
                />
            )}
            {isInvoicingOnboardingModalOpen && (
                <InvoicingOnboardingWizard onClose={closeInvoicingOnboardingModal} />
            )}
        </>
    );
};
