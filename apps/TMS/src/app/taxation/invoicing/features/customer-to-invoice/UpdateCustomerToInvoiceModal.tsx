import {PartnerLink} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Modal, Text} from "@dashdoc/web-ui";
import {InvoiceableCompany, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {CustomerToInvoiceSelect} from "./CustomerToInvoiceSelect";

interface UpdateCustomerToInvoiceModalProps {
    initialCustomerToInvoice: InvoiceableCompany | null;
    onClose: () => void;
    onSubmit: (customerCompanyPk: number | null) => Promise<any>;
}

export function UpdateCustomerToInvoiceModal({
    initialCustomerToInvoice,
    onClose,
    onSubmit,
}: UpdateCustomerToInvoiceModalProps) {
    const [customerToInvoice, setCustomerToInvoice] = useState<InvoiceableCompany | null>(
        initialCustomerToInvoice?.invoicing_address ? initialCustomerToInvoice : null
    );
    const [loading, setIsLoading, setIsNotLoading] = useToggle(false);

    return (
        <Modal
            title={t("component.updateCustomerToInvoice")}
            onClose={onClose}
            data-testid="update-customer-to-invoice-modal"
            mainButton={{
                ["data-testid"]: "update-customer-to-invoice-modal-submit",
                type: "button",
                disabled: loading,
                loading: loading,
                children: t("common.save"),
                onClick: handleSubmit,
            }}
        >
            <>
                <Flex>
                    <Box width="400px">
                        <CustomerToInvoiceSelect
                            value={customerToInvoice}
                            onChange={setCustomerToInvoice}
                            displayTooltip
                        />
                    </Box>
                </Flex>

                {customerToInvoice && (
                    <Flex justifyContent="flex-end">
                        <Text variant="caption" mt={2}>
                            <PartnerLink pk={customerToInvoice.pk}>
                                {t("component.goToCompany")}
                                <Icon name="openInNewTab" ml={1} fontSize={9} />
                            </PartnerLink>
                        </Text>
                    </Flex>
                )}
            </>
        </Modal>
    );

    async function handleSubmit() {
        if (initialCustomerToInvoice?.pk === customerToInvoice?.pk) {
            return onClose();
        }
        setIsLoading();
        await onSubmit(customerToInvoice?.pk ?? null);
        setIsNotLoading();
        onClose();
    }
}
