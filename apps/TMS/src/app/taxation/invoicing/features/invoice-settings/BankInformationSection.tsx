import {t} from "@dashdoc/web-core";
import {ClickableUpdateRegionStyle, Flex, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

import {AddBankInformationModal} from "app/taxation/invoicing/features/invoice-settings/AddBankInformationModal";
import {EditBankInformationModal} from "app/taxation/invoicing/features/invoice-settings/EditBankInformationModal";
import {InvoiceBankInformation} from "app/taxation/invoicing/types/invoiceSettingsTypes";

type BankInformationSectionProps = {
    invoiceBankInformation: InvoiceBankInformation | null;
    onInvoicePaymentEdit: (invoiceBankInformation: InvoiceBankInformation) => void;
    onInvoicePaymentAdd: (invoiceBankInformation: InvoiceBankInformation) => void;
    onInvoicePaymentDelete: (bankInformationUid: string) => void;
};

export function BankInformationSection({
    invoiceBankInformation,
    onInvoicePaymentEdit,
    onInvoicePaymentAdd,
    onInvoicePaymentDelete,
}: BankInformationSectionProps) {
    const [isModalOpen, openModal, closeModal] = useToggle();

    let content;
    if (invoiceBankInformation === null) {
        content = <Text color="grey.dark">{t("common.unspecified")}</Text>;
    } else {
        content = (
            <>
                {invoiceBankInformation.name && (
                    <Text color="grey.dark" variant="h2">
                        {invoiceBankInformation.name}
                    </Text>
                )}
                <Flex flexDirection="row" mt={1}>
                    {invoiceBankInformation.bank_iban && (
                        <Text mr={7}>
                            {t("invoiceSettings.bankIban") +
                                " " +
                                invoiceBankInformation.bank_iban}
                        </Text>
                    )}
                    {invoiceBankInformation.bank_bic && (
                        <Text>
                            {t("invoiceSettings.bankBik") + " " + invoiceBankInformation.bank_bic}
                        </Text>
                    )}
                </Flex>
                {invoiceBankInformation.bank_name && (
                    <Text>
                        {t("invoiceSettings.bankName") + " " + invoiceBankInformation.bank_name}
                    </Text>
                )}
            </>
        );
    }

    return (
        <Flex>
            <Flex
                border="1px solid"
                borderColor="grey.light"
                p={4}
                width="100%"
                onClick={openModal}
                as={ClickableUpdateRegionStyle}
                flexDirection="column"
                data-testid="invoice-payment-section"
            >
                {content}
            </Flex>
            {isModalOpen &&
                (invoiceBankInformation ? (
                    <EditBankInformationModal
                        onClose={closeModal}
                        onSubmit={closeModal}
                        invoiceBankInformation={invoiceBankInformation}
                        onInvoicePaymentEdit={onInvoicePaymentEdit}
                        onInvoicePaymentDelete={onInvoicePaymentDelete}
                    />
                ) : (
                    <AddBankInformationModal
                        onClose={closeModal}
                        onSubmit={closeModal}
                        onInvoicePaymentAdd={onInvoicePaymentAdd}
                    />
                ))}
        </Flex>
    );
}
