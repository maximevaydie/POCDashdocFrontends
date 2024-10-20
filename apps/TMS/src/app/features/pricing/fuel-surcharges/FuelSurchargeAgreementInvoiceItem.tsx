import {t} from "@dashdoc/web-core";
import {Box, ClickableUpdateRegionStyle, Flex, Modal, Select, Text} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React, {useState} from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";
import {FuelSurchargeAgreementWithSurchargeItems} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";

type FuelSurchargeAgreementInvoiceItemProps = {
    fuelSurchargeAgreement: FuelSurchargeAgreementWithSurchargeItems;
    onUpdate: (invoiceItem: InvoiceItem | null) => void;
};

export function FuelSurchargeAgreementInvoiceItem({
    fuelSurchargeAgreement,
    onUpdate,
}: FuelSurchargeAgreementInvoiceItemProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const defaultInvoiceItem = fuelSurchargeAgreement.invoice_item;
    const defaultInvoiceItemOption = defaultInvoiceItem
        ? {
              label: defaultInvoiceItem.description,
              id: defaultInvoiceItem.uid,
          }
        : undefined;

    return (
        <>
            <Flex flex="1" flexDirection="column">
                <Flex mb={3} style={{columnGap: "4px"}}>
                    <Text variant="h1" color="grey.dark">
                        {t("common.invoiceItem")}
                    </Text>
                </Flex>
                <Box onClick={() => setIsEditModalOpen(true)} as={ClickableUpdateRegionStyle}>
                    <Select
                        isDisabled
                        options={defaultInvoiceItemOption ? [defaultInvoiceItemOption] : []}
                        value={defaultInvoiceItemOption}
                        data-testid="fuel-surcharge-agreement-details-invoice-item-select"
                    />
                </Box>
            </Flex>

            {isEditModalOpen && (
                <EditModal
                    defaultInvoiceItem={defaultInvoiceItem}
                    onUpdate={onUpdate}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )}
        </>
    );
}

type EditModalProps = {
    defaultInvoiceItem: InvoiceItem | undefined;
    onUpdate: (defaultInvoiceItem: InvoiceItem | null) => void;
    onClose: () => void;
};

function EditModal({defaultInvoiceItem, onUpdate, onClose}: EditModalProps) {
    const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<InvoiceItem | undefined>(
        defaultInvoiceItem
    );

    return (
        <Modal
            title={t("fuelSurcharges.editInvoiceItem")}
            onClose={onClose}
            mainButton={{
                children: t("common.save"),
                onClick: () => {
                    onUpdate(selectedInvoiceItem ?? null);
                    onClose();
                },
            }}
            secondaryButton={{
                onClick: onClose,
            }}
        >
            <InvoiceItemSelector
                onChange={(item) => {
                    setSelectedInvoiceItem(item ?? undefined);
                }}
                selectedInvoiceItem={selectedInvoiceItem ?? null}
                data-testid="fuel-surcharge-agreement-details-invoice-item-modal-select"
            />
        </Modal>
    );
}
