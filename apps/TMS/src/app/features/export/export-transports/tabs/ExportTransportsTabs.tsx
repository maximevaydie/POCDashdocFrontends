import {useFeatureFlag} from "@dashdoc/web-common";
import {ExportTab} from "@dashdoc/web-common/src/features/export/tabs/ExportTab";
import {TabOption} from "@dashdoc/web-common/src/features/export/tabs/types";
import {ExportFormat} from "@dashdoc/web-common/src/features/export/types";
import {t} from "@dashdoc/web-core";
import React from "react";

type Props = {
    onClick: (format: ExportFormat) => void;
    currentFormat: ExportFormat;
    isOrderTab: boolean;
    isTransportTab: boolean;
};
export function ExportTransportsTabs({currentFormat, isOrderTab, isTransportTab, onClick}: Props) {
    const hasInvoicingExcelExportEnabled = useFeatureFlag("invoicing-excel-export");

    const options: TabOption[] = [
        {
            icon: "workflowDataTable2",
            value: "excel_custom",
            label: t("exportModal.pickupDeliveryCustom"),
        },
        {
            icon: "list",
            value: "excel",
            label: t("exportModal.pickupDeliveryExport"),
        },
        {
            icon: "document",
            value: "documents",
            label: t("exportModal.documentsExport"),
        },
    ];

    if (isOrderTab) {
        options.push({
            icon: "euro",
            value: "chartering",
            label: t("exportModal.orderPlusPriceExport"),
        });
    }

    if (isTransportTab) {
        options.push({
            icon: "euro",
            value: "pricing",
            label: t("exportModal.transportPlusPriceExport"),
        });
    }

    if (hasInvoicingExcelExportEnabled) {
        options.push({
            icon: "invoice",
            value: "invoicing-excel",
            label: t("exportModal.invoicingExport"),
        });
    }

    options.push({
        icon: "ecologyLeaf",
        value: "carbon-footprint",
        label: t("exportModal.carbonFootprintExport"),
    });

    return (
        <>
            {options.map((option) => {
                return (
                    <ExportTab
                        key={option.value}
                        option={option}
                        currentValue={
                            currentFormat === "operations-carbon-footprint" // Carbon footprint tab may select 2 formats
                                ? "carbon-footprint"
                                : currentFormat
                        }
                        onClick={() => onClick(option.value)}
                    />
                );
            })}
        </>
    );
}
