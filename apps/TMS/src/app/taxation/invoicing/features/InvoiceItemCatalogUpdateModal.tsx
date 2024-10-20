import {t} from "@dashdoc/web-core";
import React, {FC} from "react";

import {
    InvoiceItemFormModal,
    ValidInvoiceItemFormType,
} from "app/taxation/invoicing/features/InvoiceItemFormModal";

import {
    useDashdocTaxCodes,
    useUpdateInvoiceItemForCatalog,
} from "../services/invoiceItemCatalogApiHooks";
import {InvoiceItemForCatalog} from "../types/invoiceItemCatalogTypes";

/**
 * A modal for updating a  dashdoc invoice item.
 */
export const InvoiceItemCatalogUpdateModal: FC<{
    onClose: () => unknown;
    updateCallback: () => unknown;
    invoiceItem: InvoiceItemForCatalog;
}> = ({onClose, updateCallback, invoiceItem}) => {
    const {taxCodes} = useDashdocTaxCodes();
    const initialTaxCode =
        taxCodes.find((taxCode) => taxCode.id === invoiceItem.tax_code.id) ?? null;
    const updateInvoiceItem = useUpdateInvoiceItemForCatalog();
    const handleSubmit = async ({
        itemName,
        accountCode,
        taxCode,
        enabled,
    }: ValidInvoiceItemFormType) => {
        await updateInvoiceItem({
            uid: invoiceItem.uid,
            description: itemName,
            account_code: accountCode,
            tax_code: taxCode,
            enabled: enabled,
        });
        updateCallback();
        onClose();
    };
    return (
        <InvoiceItemFormModal
            title={`${t("common.update")} – ${invoiceItem.description}`}
            initialValues={{
                itemName: invoiceItem.description,
                accountCode: invoiceItem.account_code,
                taxCode: initialTaxCode,
                enabled: invoiceItem.enabled,
            }}
            onClose={onClose}
            onSubmit={handleSubmit}
            data-testid="invoiceItemCatalog-update-modal"
        />
    );
};
