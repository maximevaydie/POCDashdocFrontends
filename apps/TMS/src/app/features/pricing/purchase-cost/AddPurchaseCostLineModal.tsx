import {guid} from "@dashdoc/core";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Modal, NumberInput, SimpleOption, TextInput} from "@dashdoc/web-ui";
import {
    PurchaseCostLine,
    PricingMetricKey,
    mapMetricToMaxQuantityDecimals,
    yup,
} from "dashdoc-utils";
import {useFormik} from "formik";
import React from "react";

import {PricingMetricSelect} from "app/features/pricing/pricing-metrics/PricingMetricsSelect";
import {TransportPricingMetricQuantities} from "app/hooks/useTransportPricingMetricQuantities";
import {
    getManualOrAutomaticIcon,
    getMetricDisplayUnit,
    getPricingMetricQuantity,
    getQuantityTooltipContent,
} from "app/services/invoicing";

import type {Transport} from "app/types/transport";

export type AddPurchaseCostFormInitialData = {
    metric: SimpleOption<PricingMetricKey> | null;
    description: string;
    quantity: string | null;
    unit_price: string | null;
    quantity_source: PurchaseCostLine["quantity_source"];
};

type AddPurchaseCostFormSubmitData = {
    metric: PricingMetricKey;
    description: string;
    quantity: string;
    unit_price: string;
    quantity_source: PurchaseCostLine["quantity_source"];
};

interface AddPurchaseCostLineModalProps {
    transport: Transport | null;
    transportPricingMetricQuantities: TransportPricingMetricQuantities | null;
    initialFormData: AddPurchaseCostFormInitialData;
    onSubmit: (purchaseCostLineData: AddPurchaseCostFormSubmitData) => unknown;
    onClose: () => unknown;
}

export const AddPurchaseCostLineModal = ({
    transport,
    transportPricingMetricQuantities,
    initialFormData,
    onSubmit,
    onClose,
}: AddPurchaseCostLineModalProps) => {
    const [quantityInputKey, setQuantityInputKey] = React.useState("_");

    const formik = useFormik<AddPurchaseCostFormInitialData>({
        initialValues: initialFormData,
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object().shape({
            metric: yup.object().nullable(true).required(t("common.mandatoryField")),
            description: yup.string().nullable(true).required(t("common.mandatoryField")),
            quantity: yup.string().nullable(true).required(t("common.mandatoryField")),
            unit_price: yup.string().nullable(true).required(t("common.mandatoryField")),
        }),
        onSubmit: (values) => {
            const submitValues: AddPurchaseCostFormSubmitData = {
                metric: (values.metric as SimpleOption<PricingMetricKey>).value,
                description: values.description,
                quantity: values.quantity as string,
                unit_price: values.unit_price as string,
                quantity_source: values.quantity_source,
            };
            onSubmit(submitValues);
        },
    });

    const isOverridden = formik.values.quantity_source === "OVERRIDDEN";
    const icon = formik.values.metric
        ? getManualOrAutomaticIcon(formik.values.metric.value, isOverridden)
        : null;

    return (
        <Modal
            data-testid="add-purchase-cost-line-modal"
            title={t("purchaseCosts.newPurchaseCost")}
            onClose={onClose}
            mainButton={{
                children: t("purchaseCosts.addPurchaseCost"),
                type: "submit",
                form: "purchase-cost-line-form",
            }}
        >
            <form id="purchase-cost-line-form" onSubmit={formik.handleSubmit} noValidate>
                <TextInput
                    autoFocus
                    containerProps={{mb: 3}}
                    required
                    data-testid="add-purchase-cost-line-description"
                    label={t("common.description")}
                    {...formik.getFieldProps("description")}
                    onChange={(_, event) => formik.handleChange(event)}
                    error={formik.errors.description}
                />

                <PricingMetricSelect
                    required
                    label={t("purchaseCosts.priceType")}
                    dataTestId="add-purchase-cost-line-pricing-metric-select"
                    {...formik.getFieldProps("metric")}
                    onChange={(newPricingMetric: SimpleOption<PricingMetricKey>) => {
                        formik.setFieldError("metric", undefined);
                        formik.setFieldValue("metric", newPricingMetric);

                        const quantitySource =
                            newPricingMetric.value === "FLAT" ? "OVERRIDDEN" : "AUTO";

                        if (quantitySource === "AUTO") {
                            const pricingMetricQuantity = getPricingMetricQuantity(
                                transportPricingMetricQuantities,
                                newPricingMetric.value
                            );
                            formik.setFieldValue("quantity", pricingMetricQuantity);
                            setQuantityInputKey(guid());
                        }

                        if (formik.values.quantity_source !== quantitySource) {
                            formik.setFieldValue("quantity_source", quantitySource);
                        }
                    }}
                    error={formik.errors.metric}
                />

                <Flex justifyContent="space-between" mt={3}>
                    <Box flexBasis="49%">
                        <NumberInput
                            required
                            key={quantityInputKey}
                            data-testid="add-purchase-cost-line-quantity"
                            leftIcon={icon ?? undefined}
                            leftTooltipContent={
                                formik.values.metric
                                    ? getQuantityTooltipContent(
                                          formik.values.metric.value,
                                          isOverridden,
                                          transport
                                      )
                                    : undefined
                            }
                            leftTooltipPlacement="top"
                            label={t("common.quantity")}
                            min={0}
                            maxDecimals={
                                formik.values.metric
                                    ? mapMetricToMaxQuantityDecimals[formik.values.metric.value]
                                    : undefined
                            }
                            units={
                                formik.values.metric
                                    ? getMetricDisplayUnit(formik.values.metric.value)
                                    : undefined
                            }
                            {...formik.getFieldProps("quantity")}
                            onChange={(value) => {
                                formik.setFieldError("quantity", undefined);
                                formik.setFieldValue("quantity", value);
                                if (formik.values.quantity_source === "AUTO") {
                                    formik.setFieldValue("quantity_source", "OVERRIDDEN");
                                }
                            }}
                            onTransientChange={(value) => formik.setFieldValue("quantity", value)}
                            error={formik.errors.quantity}
                        />
                    </Box>
                    <Box flexBasis="49%">
                        <NumberInput
                            required
                            data-testid="add-purchase-cost-line-unit-price"
                            label={t("common.unitPrice")}
                            maxDecimals={3}
                            units={"€"}
                            {...formik.getFieldProps("unit_price")}
                            onChange={(value) => {
                                formik.setFieldError("unit_price", undefined);
                                formik.setFieldValue("unit_price", value);
                            }}
                            onTransientChange={(value) =>
                                formik.setFieldValue("unit_price", value)
                            }
                            error={formik.errors.unit_price}
                        />
                    </Box>
                </Flex>
            </form>
        </Modal>
    );
};
