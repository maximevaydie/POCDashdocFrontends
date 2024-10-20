import {t} from "@dashdoc/web-core";
import {Box, Flex} from "@dashdoc/web-ui";
import {PurchaseCostLine, PurchaseCostTemplate, yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {forwardRef, useImperativeHandle, useState} from "react";

import {PricingTotalPricesOverview} from "app/features/pricing/pricing-total-prices-overview";
import {
    AddPurchaseCostFormInitialData,
    AddPurchaseCostLineModal,
} from "app/features/pricing/purchase-cost/AddPurchaseCostLineModal";
import {PurchaseCostDropdown} from "app/features/pricing/purchase-cost/PurchaseCostDropdown";
import {PurchaseCostTable} from "app/features/pricing/purchase-cost/PurchaseCostTable";
import {TransportPricingMetricQuantities} from "app/hooks/useTransportPricingMetricQuantities";
import {getPricingMetricQuantity} from "app/services/invoicing";
import {getPurchaseCostsCurrency} from "app/services/invoicing/purchaseCosts.service";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport | null;
    initialPurchaseCostLines?: PurchaseCostLine[];
    pricingMetricQuantities: TransportPricingMetricQuantities | null;
    onSubmit: (purchaseCostLines: PurchaseCostLine[]) => void;
};

export interface PurchaseCostFormData {
    purchaseCostLines: PurchaseCostLine[];
}

export const PurchaseCostForm = forwardRef(
    ({transport, initialPurchaseCostLines, pricingMetricQuantities, onSubmit}: Props, ref) => {
        const [newPurchaseCostLine, setNewPurchaseCostLine] =
            useState<AddPurchaseCostFormInitialData | null>(null);

        const formik = useFormik<PurchaseCostFormData>({
            initialValues: {
                purchaseCostLines: initialPurchaseCostLines ?? [],
            },
            enableReinitialize: true,
            validationSchema: yup.object().shape({
                purchaseCostLines: yup.array().of(
                    yup.object().shape({
                        description: yup
                            .string()
                            .nullable(true)
                            .required(t("common.mandatoryField")),
                        quantity: yup.string().nullable(true).required(t("common.mandatoryField")),
                        unit_price: yup
                            .string()
                            .nullable(true)
                            .required(t("common.mandatoryField")),
                    })
                ),
            }),
            onSubmit: (values) => {
                onSubmit(values.purchaseCostLines);
            },
        });

        useImperativeHandle(ref, () => ({
            isDirty: formik?.dirty ?? false,
            submitForm: formik.submitForm,
            isValid: formik?.isValid,
            isEmpty: formik.values.purchaseCostLines.length === 0,
        }));

        const currency = getPurchaseCostsCurrency(initialPurchaseCostLines);
        const totalPriceWithoutVat = formik.values.purchaseCostLines.reduce((acc, line) => {
            const price = parseFloat(line.quantity) * parseFloat(line.unit_price);
            if (isNaN(price)) {
                return acc;
            }
            return acc + price;
        }, 0);

        return (
            <>
                <form id={"purchase-cost-form"} onSubmit={formik.handleSubmit} noValidate>
                    <PurchaseCostTable formik={formik} transport={transport} />
                    <Flex backgroundColor={"blue.ultralight"} p={3}>
                        <Box width={280}>
                            <PurchaseCostDropdown
                                onSelectPurchaseCostTemplate={(
                                    purchaseCostTemplate: PurchaseCostTemplate
                                ) => {
                                    const pricingMetricQuantity = getPricingMetricQuantity(
                                        pricingMetricQuantities,
                                        purchaseCostTemplate.metric
                                    );
                                    const newPurchaseCostLine: PurchaseCostLine = {
                                        metric: purchaseCostTemplate.metric,
                                        description: purchaseCostTemplate.description,
                                        unit_price: purchaseCostTemplate.unit_price,
                                        include_in_turnover:
                                            purchaseCostTemplate.include_in_turnover,
                                        currency: "EUR",
                                        quantity: pricingMetricQuantity,
                                        quantity_source:
                                            purchaseCostTemplate.metric === "FLAT"
                                                ? "OVERRIDDEN"
                                                : "AUTO",
                                        total_without_tax: "0",
                                    };

                                    const newLines = [
                                        ...formik.values.purchaseCostLines,
                                        newPurchaseCostLine,
                                    ];
                                    formik.setFieldValue("purchaseCostLines", newLines);
                                }}
                                onAddCustomPurchaseCost={(description) => {
                                    setNewPurchaseCostLine({
                                        description,
                                        metric: null,
                                        quantity: null,
                                        unit_price: null,
                                        quantity_source: "AUTO",
                                    });
                                }}
                            />
                        </Box>
                    </Flex>
                    <Flex justifyContent="flex-end" my={3} pr={54}>
                        <PricingTotalPricesOverview
                            currency={currency}
                            totalPriceWithoutVat={totalPriceWithoutVat}
                        />
                    </Flex>
                </form>
                {newPurchaseCostLine && (
                    <AddPurchaseCostLineModal
                        transport={transport}
                        transportPricingMetricQuantities={pricingMetricQuantities}
                        initialFormData={newPurchaseCostLine}
                        onSubmit={(purchaseCostLineData) => {
                            const newPurchaseCostLine: PurchaseCostLine = {
                                ...purchaseCostLineData,
                                currency: "EUR",
                                quantity_source: purchaseCostLineData.quantity_source,
                                include_in_turnover: true,
                                total_without_tax: "0",
                            };
                            const newLines = [
                                ...formik.values.purchaseCostLines,
                                newPurchaseCostLine,
                            ];
                            formik.setFieldValue("purchaseCostLines", newLines);

                            setNewPurchaseCostLine(null);
                        }}
                        onClose={() => setNewPurchaseCostLine(null)}
                    />
                )}
            </>
        );
    }
);

PurchaseCostForm.displayName = "PurchaseCostForm";
