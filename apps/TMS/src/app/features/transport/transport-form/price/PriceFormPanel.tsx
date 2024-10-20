import {Logger, t} from "@dashdoc/web-core";
import {Box, Flex, FloatingPanelWithValidationButtons, Text, toast} from "@dashdoc/web-ui";
import {useFormik, useFormikContext} from "formik";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useContext, useRef} from "react";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";
import {PriceTabsForms} from "app/features/transport/transport-form/price/PriceTabsForms";
import {
    getPlannedQuantitiesFromLoads,
    getPricingMetricQuantitiesFromNewTransportForm,
    getRealQuantitiesFromNewTransportForm,
    PricingFormData,
} from "app/services/invoicing";
import {CustomerToInvoiceSelect} from "app/taxation/invoicing/features/customer-to-invoice/CustomerToInvoiceSelect";

import {TransportFormContext} from "../transport-form-context";
import {useInitialPriceData} from "../transport-form-initial-values";
import {TransportFormPrice, TransportFormValues} from "../transport-form.types";
import {TEST_ID_PREFIX} from "../TransportForm";

import type {SlimCompany} from "dashdoc-utils";

type PriceFormProps = {
    isCarrier: boolean;
    isCarrierGroupOfTransport: boolean;
    canEditCustomerToInvoice: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    shipper: SlimCompany | undefined;
    matchingTariffGrids: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
    onSubmit: (value: any) => void;
    onClose: () => void;
};

export const PriceFormPanel: FunctionComponent<PriceFormProps> = ({
    isCarrier,
    isCarrierGroupOfTransport,
    isOwnerOfCurrentFuelSurchargeAgreement,
    canEditCustomerToInvoice,
    shipper,
    matchingTariffGrids,
    matchingFuelSurchargeAgreement,
    invoiceItemSuggestionArguments,
    onSubmit,
    onClose,
}) => {
    const {volumeDisplayUnit} = useContext(TransportFormContext);
    const {
        values: {loads, price, loadings, unloadings},
    } = useFormikContext<TransportFormValues>();
    const pricingFormRef = useRef<{
        isDirty: boolean;
        submitForm: () => Promise<void>;
        isValid: boolean;
        isEmpty: boolean;
    }>();
    const purchaseCostsFormRef = useRef<{
        isDirty: boolean;
        submitForm: () => Promise<void>;
        isValid: boolean;
        isEmpty: boolean;
    }>();

    const initialValues = useInitialPriceData(canEditCustomerToInvoice, shipper);
    const formik = useFormik<TransportFormPrice>({
        initialValues: price ?? initialValues,
        enableReinitialize: true,
        onSubmit: (value) => {
            onSubmit(value);
            onClose();
        },
    });

    const quotationPlannedQuantities = getPlannedQuantitiesFromLoads(loads, volumeDisplayUnit);
    const quotationRealQuantities = getRealQuantitiesFromNewTransportForm(
        loadings.length,
        unloadings.length
    );
    const pricingMetricQuantities = getPricingMetricQuantitiesFromNewTransportForm(
        loads,
        volumeDisplayUnit,
        loadings.length,
        unloadings.length
    );

    return (
        <FloatingPanelWithValidationButtons
            width={0.5}
            minWidth={1200}
            onClose={onClose}
            title={t("common.price")}
            mainButton={{
                type: "button",
                onClick: async () => {
                    try {
                        if (pricingFormRef.current?.isDirty) {
                            await pricingFormRef.current?.submitForm();
                        }

                        if (purchaseCostsFormRef.current?.isDirty) {
                            await purchaseCostsFormRef.current?.submitForm();
                        }

                        if (
                            (isNil(pricingFormRef.current) ||
                                pricingFormRef.current?.isValid ||
                                pricingFormRef.current?.isEmpty) &&
                            (isNil(purchaseCostsFormRef.current) ||
                                purchaseCostsFormRef.current?.isValid ||
                                purchaseCostsFormRef.current?.isEmpty)
                        ) {
                            await formik.submitForm();
                        }
                    } catch (e) {
                        Logger.error(e);
                        toast.error(t("common.error"));
                    }
                },
            }}
            data-testid={`${TEST_ID_PREFIX}add-price-panel`}
        >
            <Flex flexDirection="column">
                {canEditCustomerToInvoice && (
                    <Box zIndex="level2">
                        <Text variant="h1" mb={3}>
                            {t("common.billing")}
                        </Text>
                        <Flex>
                            <Box width="400px">
                                <CustomerToInvoiceSelect
                                    displayTooltip
                                    label={t("common.customerToInvoice")}
                                    value={formik.values.customerToInvoice}
                                    onChange={(value) =>
                                        formik.setFieldValue("customerToInvoice", value)
                                    }
                                />
                            </Box>
                        </Flex>
                    </Box>
                )}
                <PriceTabsForms
                    pricingFormRef={pricingFormRef}
                    purchaseCostsFormRef={purchaseCostsFormRef}
                    isCarrierOfTransport={isCarrier}
                    isCarrierGroupOfTransport={isCarrierGroupOfTransport}
                    isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                    initialPricing={formik.values.quotation}
                    initialPlannedQuantities={quotationPlannedQuantities}
                    initialRealQuantities={quotationRealQuantities}
                    onSubmitQuotation={(value: PricingFormData, hasErrors: boolean) => {
                        if (hasErrors) {
                            return;
                        }

                        formik.setFieldValue("quotation", value);
                    }}
                    matchingTariffGrids={matchingTariffGrids}
                    matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                    invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                    canEditCustomerToInvoice={canEditCustomerToInvoice}
                    initialPurchaseCostLines={formik.values.purchaseCosts?.lines ?? []}
                    pricingMetricQuantities={pricingMetricQuantities}
                    onSubmitPurchaseCostLines={(purchaseCostsLines) =>
                        formik.setFieldValue("purchaseCosts.lines", purchaseCostsLines)
                    }
                />
            </Flex>
        </FloatingPanelWithValidationButtons>
    );
};
