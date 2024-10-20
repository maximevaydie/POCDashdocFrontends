import {t} from "@dashdoc/web-core";
import {Callout, Modal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {BankInformationForm} from "app/taxation/invoicing/features/invoice-settings/BankInformationForm";
import {deleteBankInformation} from "app/taxation/invoicing/services/invoiceSettings";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type EditBankInformationModalProps = {
    invoiceBankInformation: InvoiceBankInformation | null;
    onInvoicePaymentEdit: (invoiceBankInformation: InvoiceBankInformation) => void;
    onInvoicePaymentDelete: (bankInformationUid: string) => void;
    onClose: () => void;
    onSubmit: () => void;
};

export function EditBankInformationModal({
    onClose,
    onSubmit,
    invoiceBankInformation,
    onInvoicePaymentEdit,
    onInvoicePaymentDelete,
}: EditBankInformationModalProps) {
    const [loading, setLoading] = useState(false);

    const handleDeleteBankInformation = async () => {
        if (invoiceBankInformation?.uid) {
            await deleteBankInformation(invoiceBankInformation.uid);
            onInvoicePaymentDelete(invoiceBankInformation.uid);
        }
        onClose();
    };

    return (
        <Modal
            onClose={onClose}
            title={t("InvoicePaymentSettings.title")}
            size="large"
            mainButton={{
                form: "payment-data-form",
                type: "submit",
                loading: loading,
                "data-testid": "payment-settings-save-button",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: handleDeleteBankInformation,
                "data-testid": "payment-settings-cancel-button",
                children: t("common.delete"),
                withConfirmation: true,
                confirmationMessage: t("components.confirmDeleteBankInformation"),
                modalProps: {
                    title: t("components.deleteBankInformation"),
                    mainButton: {
                        children: t("common.delete"),
                        "data-testid": "document-delete-confirmation-button",
                    },
                },
                severity: "danger",
            }}
        >
            <BankInformationForm
                invoiceBankInformation={invoiceBankInformation}
                onSubmit={(invoiceBankInformation: InvoiceBankInformation) => {
                    onInvoicePaymentEdit(invoiceBankInformation);
                    onSubmit();
                }}
                setLoading={setLoading}
                origin="settings"
            />
            <Callout>{t("InvoicePaymentSettings.callout")}</Callout>
        </Modal>
    );
}
