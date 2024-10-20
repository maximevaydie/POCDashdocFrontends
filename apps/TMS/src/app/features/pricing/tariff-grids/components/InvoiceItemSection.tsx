import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Callout, Flex, Text} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React, {FC} from "react";

import {InvoiceItemSelector} from "app/features/pricing/invoices/invoice-item/InvoiceItemSelector";

import {TariffGrid} from "../types";

export const InvoiceItemSection: FC<{
    tariffGrid: TariffGrid;
    mandatoryInvoiceItem: boolean;
    onChange: (value: InvoiceItem | null) => void;
}> = ({tariffGrid, mandatoryInvoiceItem, onChange}) => {
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");

    return (
        <Flex
            data-testid="tariff-grid-product-section"
            flexDirection="column"
            px={3}
            pt={3}
            pb={5}
            borderBottomStyle="solid"
            borderBottomWidth="1px"
            borderBottomColor="grey.light"
        >
            <Text variant="h1" mb={3}>
                {t("common.invoiceItem")}
            </Text>
            <InvoiceItemSelector
                required={hasDashdocInvoicingEnabled}
                menuPortalTarget={document.body}
                onChange={onChange}
                selectedInvoiceItem={tariffGrid?.invoice_item ?? null}
                data-testid="invoice-item-selector-for-tariff-grid"
                emptyContent={
                    <Callout variant="informative">
                        <Text>{t("settings.invoicing.emptyProductCatalog")}</Text>
                    </Callout>
                }
                errorMessage={mandatoryInvoiceItem ? t("common.mandatoryField") : undefined}
            />
        </Flex>
    );
};
