import {t} from "@dashdoc/web-core";
import {Modal} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {BankInformationForm} from "app/taxation/invoicing/features/invoice-settings/BankInformationForm";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type AddBankInformationModalProps = {
    onInvoicePaymentAdd: (invoiceBankInformation: InvoiceBankInformation) => void;
    onClose: () => void;
    onSubmit: () => void;
};

export function AddBankInformationModal({
    onClose,
    onSubmit,
    onInvoicePaymentAdd,
}: AddBankInformationModalProps) {
    const [loading, setLoading] = useState(false);

    return (
        <Modal
            onClose={onClose}
            title={t("InvoicePaymentSettings.addModalTitle")}
            size="large"
            mainButton={{
                form: "payment-data-form",
                type: "submit",
                loading: loading,
                "data-testid": "payment-settings-save-button",
                children: t("common.save"),
            }}
            secondaryButton={{
                onClick: onClose,
                "data-testid": "payment-settings-cancel-button",
            }}
        >
            <BankInformationForm
                invoiceBankInformation={null}
                onSubmit={(invoiceBankInformation: InvoiceBankInformation) => {
                    onInvoicePaymentAdd(invoiceBankInformation);
                    onSubmit();
                }}
                setLoading={setLoading}
                origin="settings"
            />
        </Modal>
    );
}
