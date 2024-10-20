import {t} from "@dashdoc/web-core";
import React, {FC, useRef} from "react";

import {useCreateInvoiceItemForCatalog} from "app/taxation/invoicing/services/invoiceItemCatalogApiHooks";

import {InvoiceItemFormModal, ValidInvoiceItemFormType} from "./InvoiceItemFormModal";

/**
 * A modal for creating a new dashdoc invoice item.
 */
export const InvoiceItemCatalogCreationModal: FC<{
    onClose: () => unknown;
    creationCallback: () => unknown;
}> = ({onClose, creationCallback}) => {
    const createInvoiceItem = useCreateInvoiceItemForCatalog();
    const hasBeenSubmitted = useRef(false);
    const handleSubmit = async ({
        itemName,
        accountCode,
        taxCode,
        enabled,
    }: ValidInvoiceItemFormType) => {
        if (hasBeenSubmitted.current) {
            return;
        }
        hasBeenSubmitted.current = true;
        await createInvoiceItem({
            description: itemName,
            account_code: accountCode,
            tax_code_id: taxCode.id,
            enabled: enabled,
        });
        creationCallback();
        onClose();
    };
    return (
        <InvoiceItemFormModal
            title={t("invoiceItemCatalog.createModalTitle")}
            initialValues={{
                itemName: "",
                accountCode: "",
                taxCode: null,
                enabled: true,
            }}
            onSubmit={handleSubmit}
            onClose={onClose}
            data-testid="invoiceItemCatalog-create-modal"
        />
    );
};
