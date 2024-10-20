import {t} from "@dashdoc/web-core";
import {Box, Select, SelectProps, theme} from "@dashdoc/web-ui";
import React, {FC} from "react";

import {useInvoiceContext} from "app/features/pricing/invoices/invoice-details/invoice-content/contexts/InvoiceOrCreditNoteContext";
import {useShipperInvoiceTemplates} from "app/hooks/useShipperInvoiceTemplate";

import type {Invoice} from "app/taxation/invoicing/types/invoice.types";

export const InvoiceDescriptionTemplatePicker: FC<Partial<SelectProps>> = ({...selectProps}) => {
    const {invoice} = useInvoiceContext();
    const debtorTemplates = useShipperInvoiceTemplates(invoice.debtor.pk);
    const selectOptions = [
        {
            value: null,
            testId: "select-option-default",
            label: t("invoice.DefaultTemplate"),
        },
        ...debtorTemplates.map(({uid, name}) => ({
            value: uid,
            label: name,
            testId: `select-option-${name}`,
        })),
    ];

    return (
        <Box maxWidth={300} mr={3}>
            <Select
                {...selectProps}
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.descriptionTemplate")}
                options={selectOptions}
                data-testid={"invoice-description-template-select"}
            />
        </Box>
    );
};

// @deprecated This component must be removed with the FF fuelSurchargeInInvoiceFooter
export const InvoiceDescriptionTemplatePickerLegacy: FC<{
    invoice: Invoice;
    onChange: (templateUid: string | null) => unknown;
}> = ({invoice, onChange}) => {
    const debtorTemplates = useShipperInvoiceTemplates(invoice.debtor.pk);
    const description_template = invoice.description_template;
    const selectValue =
        description_template === null
            ? {value: "null", label: t("invoice.DefaultTemplate")}
            : {value: description_template.uid, label: description_template.name};
    const selectOptions = [
        {
            value: "null",
            testId: "select-option-default",
            label: t("invoice.DefaultTemplate"),
        },
        ...debtorTemplates.map(({uid, name}) => ({
            value: uid,
            label: name,
            testId: `select-option-${name}`,
        })),
    ];

    return (
        <Box minWidth={200} mr={3}>
            <Select<{value: string | undefined; label: string; testId?: string}>
                menuPortalTarget={document.body}
                styles={{
                    menuPortal: (base) => ({...base, zIndex: theme.zIndices.topbar}),
                }}
                label={t("invoice.descriptionTemplate")}
                value={selectValue}
                options={selectOptions}
                data-testid={"invoice-description-template-select"}
                onChange={(e) => {
                    const choice = e as {value?: string; label?: string};
                    if (choice.value === "null") {
                        onChange(null);
                    }
                    if (choice.value !== undefined && choice.value !== "null") {
                        onChange(choice.value);
                    }
                }}
            />
        </Box>
    );
};
