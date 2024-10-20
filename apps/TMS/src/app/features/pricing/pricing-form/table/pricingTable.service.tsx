import {t} from "@dashdoc/web-core";
import {Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {FormikErrors, FormikTouched} from "formik";
import React, {FunctionComponent} from "react";

import {
    ReadOnlyPricingTableColumn,
    UpdatePricingTableColumn,
} from "app/features/pricing/pricing-form/table/types";
import {PricingFormData} from "app/services/invoicing";

type ColumnTitleProps = {
    title: string;
    textAlign?: "left" | "center" | "right";
};
const ColumnTitle: FunctionComponent<ColumnTitleProps> = ({title, textAlign = "center"}) => {
    return (
        <Text variant="captionBold" ellipsis textAlign={textAlign} width="100%">
            {title}
        </Text>
    );
};

function getReadOnlyColumns(vatEnabled: boolean): {
    width: number;
    name: ReadOnlyPricingTableColumn;
    getLabel: () => JSX.Element;
}[] {
    return getColumns(vatEnabled, true) as {
        width: number;
        name: ReadOnlyPricingTableColumn;
        getLabel: () => JSX.Element;
    }[];
}
function getEditableColumns(vatEnabled: boolean): {
    width: number;
    name: UpdatePricingTableColumn;
    getLabel: () => JSX.Element;
}[] {
    return getColumns(vatEnabled, false) as {
        width: number;
        name: UpdatePricingTableColumn;
        getLabel: () => JSX.Element;
    }[];
}
function getColumns(
    vatEnabled: boolean,
    readOnly: boolean
): {
    width: number;
    name: UpdatePricingTableColumn | ReadOnlyPricingTableColumn;
    getLabel: () => JSX.Element;
}[] {
    const columns: {
        width: number;
        name: UpdatePricingTableColumn | ReadOnlyPricingTableColumn;
        getLabel: () => JSX.Element;
    }[] = [];
    if (vatEnabled) {
        columns.push({
            width: readOnly ? 89 : 140,
            getLabel: () => (
                <ColumnTitle
                    title={t("common.invoiceItem")}
                    textAlign={readOnly ? "left" : "center"}
                />
            ),
            name: "invoiceItem",
        });
    }
    columns.push({
        width: 150,
        getLabel: () => (
            <ColumnTitle
                title={t("common.description")}
                textAlign={readOnly ? "left" : "center"}
            />
        ),
        name: "description",
    });
    columns.push({
        width: readOnly ? 70 : 100,
        getLabel: () => (
            <ColumnTitle title={t("common.quantity")} textAlign={readOnly ? "right" : "center"} />
        ),
        name: "quantity",
    });
    if (readOnly) {
        columns.push({
            width: 70,
            getLabel: () => <ColumnTitle title={t("common.unit")} textAlign="right" />,
            name: "unit",
        });
    }
    columns.push({
        width: readOnly ? 70 : 100,
        getLabel: () => (
            <ColumnTitle
                title={t("pricingMetrics.unitPrice")}
                textAlign={readOnly ? "right" : "center"}
            />
        ),
        name: "unitPrice",
    });
    if (vatEnabled) {
        columns.push({
            width: 70,
            getLabel: () => <ColumnTitle title={t("settings.totalNoVAT")} textAlign="right" />,
            name: "priceAndVat",
        });
    } else {
        columns.push({
            width: 70,
            getLabel: () => <ColumnTitle title={t("settings.totalNoVAT")} textAlign="right" />,
            name: "price",
        });
    }

    columns.push({
        width: 30,
        getLabel: () => (
            <TooltipWrapper
                boxProps={{
                    pt: 1,
                    textAlign: "center",
                    display: "inline-block",
                    width: "100%",
                }}
                content={t("components.gasIndex")}
                placement="top"
            >
                <Icon name="gasIndex" />
            </TooltipWrapper>
        ),
        name: "gasIndex",
    });

    if (!readOnly) {
        columns.push({
            width: 20,
            getLabel: () => <></>,
            name: "delete",
        });
    }

    return columns;
}

/** Get the formik errors for a specific field without getting a headache with typescript errors */
const getFormikErrorMessage = (
    errors: FormikErrors<PricingFormData>,
    elementPath: (string | number)[]
): string => {
    let current: unknown = errors;
    for (const path of elementPath) {
        if (typeof current === "string") {
            return current;
        }
        if (typeof current === "object") {
            current = (current as any)[path];
            continue;
        }
        return "";
    }
    if (typeof current === "string") {
        return current;
    }
    return "";
};

/** Get the formik touched for a specific field without getting a headache with typescript errors */
const getFormikTouched = (
    touched: FormikTouched<PricingFormData>,
    elementPath: (string | number)[]
): boolean => {
    let current: unknown = touched;
    for (const path of elementPath) {
        if (typeof current === "boolean") {
            return current;
        }
        if (typeof current === "object") {
            current = (current as any)[path];
            continue;
        }
        return false;
    }
    if (typeof current === "boolean") {
        return current;
    }
    return false;
};

export const pricingTableService = {
    getReadOnlyColumns,
    getEditableColumns,
    getFormikErrorMessage,
    getFormikTouched,
};
