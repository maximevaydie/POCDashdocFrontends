import {ExportTab} from "@dashdoc/web-common/src/features/export/tabs/ExportTab";
import {TabOption} from "@dashdoc/web-common/src/features/export/tabs/types";
import {ExportFormat} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import {IconNames} from "@dashdoc/web-ui";
import React from "react";

import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

type Props = {
    onClick: (format: ExportFormat) => void;
    currentFormat: ExportFormat;
};
export function InvoiceExportTabs({currentFormat, onClick}: Props) {
    const hasDashocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const options: TabOption[] = [
        {
            icon: "accountingInvoice",
            value: "invoices",
            label: t("invoiceExportModal.invoicesDefaultTab"),
        },
        {
            icon: "document",
            value: "documents",
            label: t("exportModal.documentsExport"),
        },
        ...(hasDashocInvoicingEnabled
            ? [
                  {
                      icon: "euro" as IconNames,
                      value: "accounting" as ExportFormat,
                      label: t("invoiceExportModal.accountingTab"),
                  },
              ]
            : []),
    ];

    return (
        <>
            {options.map((option) => {
                return (
                    <ExportTab
                        key={option.value}
                        option={option}
                        currentValue={currentFormat}
                        onClick={() => onClick(option.value)}
                    />
                );
            })}
        </>
    );
}
