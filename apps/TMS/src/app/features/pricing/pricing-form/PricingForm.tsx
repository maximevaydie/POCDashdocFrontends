import {companyService, getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Text} from "@dashdoc/web-ui";
import {
    FuelSurchargeAgreementOwnerType,
    InvoiceItem,
    PlannedQuantities,
    PricingMetricKey,
    PricingQuantities,
    yup,
} from "dashdoc-utils";
import {FormikErrors, FormikProps, useFormik} from "formik";
import {
    forwardRef,
    default as React,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import cloneDeep from "rfdc/default";

import {FuelSurchargeAgreementTransportMatch} from "app/features/pricing/fuel-surcharges/types";
import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {pricingFormService} from "app/features/pricing/pricing-form/pricingForm.service";
import {PricingFormActionButtons} from "app/features/pricing/pricing-form/PricingFormActionButtons";
import {EditablePricingTable} from "app/features/pricing/pricing-form/table/EditablePricingTable";
import {TariffGridApplicationInfo} from "app/features/pricing/tariff-grids/types";
import {loadInvoicingConnectorAuthenticated} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getInitialPlannedQuantity,
    getInitialRealQuantity,
    getMetricLabel,
    getPricingCurrency,
    listOfMetrics,
    PricingFormData,
    PricingFormLine,
    PricingTableLine,
    TariffGridLineForm,
} from "app/services/invoicing";
import {tariffGridMatchingService} from "app/services/invoicing/tariffGridMatching.service";

import {PricingTotalPricesOverview} from "../pricing-total-prices-overview";

import {ReadOnlyPricingTable} from "./table/ReadOnlyPricingTable";

type PricingFormErrors = FormikErrors<PricingFormData> & {
    negative_total_price?: string;
    cannot_be_empty?: string;
};

const pricingFormValidationSchema = (
    invoiceItemRequired: boolean,
    hasGasIndex: boolean,
    isForChartering: boolean
) =>
    yup.object().shape({
        gas_index: yup.string(),
        gas_index_invoice_item:
            invoiceItemRequired && hasGasIndex
                ? yup
                      .object()
                      .shape({
                          uid: yup.string(),
                      })
                      .required(t("common.mandatoryField"))
                      .nullable()
                : yup
                      .object()
                      .shape({
                          uid: yup.string(),
                      })
                      .nullable(),
        lines: yup.array().of(
            yup.object().shape({
                description: yup.string().required(t("common.mandatoryField")),
                // Mark invoice_item as required for some connectors
                invoice_item:
                    invoiceItemRequired && !isForChartering
                        ? yup
                              .object()
                              .shape({
                                  uid: yup.string(),
                              })
                              .required(t("common.mandatoryField"))
                              .nullable()
                        : yup
                              .object()
                              .shape({
                                  uid: yup.string(),
                              })
                              .nullable(),
                metric: yup.string().oneOf(listOfMetrics).required(t("common.mandatoryField")),
                quantity: yup.string().when("isOverridden", {
                    is: (isOverridden: boolean) => !!isOverridden,
                    then: yup.string().required(t("common.mandatoryField")),
                }),
                unit_price: yup.string().required(t("common.mandatoryField")),
                is_gas_indexed: yup.bool(),
                dismissed_suggested_invoice_item: yup.bool().optional().nullable(),
            })
        ),
    });

export type PricingFormProps = {
    initialPricing: PricingFormData;
    pricingType?: "agreedPrice" | "invoicedPrice" | "shipperFinalPrice";
    readOnly?: boolean;
    initialRealQuantities?: PricingQuantities;
    initialPlannedQuantities?: PlannedQuantities;
    onSubmit: (pricing: PricingFormData, hasErrors: boolean) => void;
    submitOnChange?: boolean;
    formId?: string;
    hideHeaderInformation?: boolean;
    isCarrierOfTransport: boolean;
    isOwnerOfCurrentFuelSurchargeAgreement: boolean;
    isForChartering?: boolean;
    hideErrors?: boolean;
    displayTariffGrids?: boolean;
    canAddOrRemoveLine?: boolean;
    matchingTariffGridInfos: TariffGridApplicationInfo[];
    matchingFuelSurchargeAgreement: FuelSurchargeAgreementTransportMatch | null;
    invoiceItemSuggestionArguments?: InvoiceItemSuggestionArguments;
    hideGasIndexButton?: boolean;
    canPricingBeEmpty?: boolean;
    onCopyToFinalPrice?: () => void;
    onCopyFromInvoicedPrice?: () => void;
};

// @guidedtour[epic=pricing, seq=1] PricingForm
// We can create or update a agreed/invoiced price in the frontend in two different places.
// - In the transport creation form via the price form panel:
//   LINK frontend/src/app/features/transport/transport-form/transport-form.tsx#price-form-panel-use
// - In the transport details page via the pricing modal:
//   LINK frontend/src/app/features/transport/transport-details/transport-details.tsx#pricing-modal-use
// In both case we use the same component, the `PricingForm` to perform crud actions on the pricing.
// This is the main component to create or update a pricing is the `PricingForm`.

export const PricingForm = forwardRef(
    (
        {
            initialPricing,
            pricingType,
            readOnly,
            initialRealQuantities,
            initialPlannedQuantities,
            onSubmit,
            submitOnChange,
            formId,
            isCarrierOfTransport,
            isOwnerOfCurrentFuelSurchargeAgreement,
            isForChartering = false,
            matchingTariffGridInfos,
            matchingFuelSurchargeAgreement,
            invoiceItemSuggestionArguments,
            displayTariffGrids = true,
            hideErrors = false,
            canAddOrRemoveLine = true,
            hideGasIndexButton = false,
            canPricingBeEmpty = true,
            onCopyToFinalPrice,
            onCopyFromInvoicedPrice,
        }: PricingFormProps,
        ref
    ) => {
        const dispatch = useDispatch();

        const invoicingConnector = useSelector((state) => state.invoicingConnector);
        const hasFuelSurchargesAndTariffGridsManagementEnabled = useFeatureFlag(
            "fuelSurchargesAndTariffGridsManagement"
        );

        const companyDefaultCurrency = useSelector((state) =>
            companyService.getDefaultCurrency(getConnectedCompany(state))
        );
        const currency = getPricingCurrency(initialPricing) ?? companyDefaultCurrency;

        const [hasGasIndex, setHasGasIndex] = useState(() => {
            if (initialPricing?.gas_index && parseFloat(initialPricing.gas_index) !== 0) {
                return true;
            }
            return false;
        });

        const vatEnabled = isCarrierOfTransport;
        const invoiceItemRequired =
            vatEnabled && ["billit", "sage"].includes(invoicingConnector?.data_source || "");

        const suggestCreateFuelSurchargeAgreementOwnerType = isCarrierOfTransport
            ? FuelSurchargeAgreementOwnerType.CARRIER
            : pricingType === "agreedPrice" || pricingType === "shipperFinalPrice"
              ? FuelSurchargeAgreementOwnerType.SHIPPER
              : null;

        const formik: FormikProps<PricingFormData> = useFormik({
            initialValues: initialPricing,
            validationSchema: pricingFormValidationSchema(
                invoiceItemRequired,
                hasGasIndex,
                isForChartering
            ),
            validateOnBlur: false,
            enableReinitialize: true,
            validate: handleValidateForm,
            onSubmit: handleSubmitForm,
        });

        const appliedTariffGrid: TariffGridLineForm | null =
            formik.values.tariff_grid_line || null;

        useImperativeHandle(ref, () => ({
            isDirty: formik.dirty,
            submitForm: formik.submitForm,
            isValid: formik.isValid,
            isEmpty: formik.values.lines.length === 0,
        }));

        dispatch(loadInvoicingConnectorAuthenticated()); // aborted in the action if already loading/loaded

        useEffect(() => {
            if (submitOnChange) {
                formik.handleSubmit();
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [submitOnChange, formik.values, formik.isValid]);

        useEffect(() => {
            // If the form is not valid, formik does not call te onSubmit function, but we want
            // it to be called so that the parent component is aware that there are errors
            if (submitOnChange && !formik.isValid) {
                handleSubmitForm(formik.values);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [submitOnChange, formik.isValid]);

        const {
            gasIndex: totalGasIndexPrice,
            fuelSurcharge: totalFuelSurchargePrice,
            totalGross: totalPrice,
            vat: totalVat,
        } = pricingFormService.computeTotal(formik.values, hasGasIndex, vatEnabled);

        const totalPriceWithoutVat = totalPrice + totalGasIndexPrice + totalFuelSurchargePrice;
        const appliedFuelSurchargeLine = formik.values.fuel_surcharge_line;

        const pricingLines = useMemo(() => {
            const lines: PricingTableLine[] = [...formik.values.lines];
            // If you change this behavior with more than one tariffGrid line, please update the UpdatePricingTable getRowKey function
            if (appliedTariffGrid) {
                lines.push({
                    isTariffGridLine: true,
                    ...appliedTariffGrid,
                });
            }

            // If you change this behavior with more than one gasIndex line, please update the UpdatePricingTable getRowKey function
            if (hasGasIndex && (!readOnly || totalGasIndexPrice !== 0)) {
                lines.push({isGasIndexLine: true});
            }

            if (appliedFuelSurchargeLine) {
                lines.push({isFuelSurchargeLine: true, ...appliedFuelSurchargeLine});
            }

            return lines;
        }, [
            formik.values.lines,
            hasGasIndex,
            readOnly,
            totalGasIndexPrice,
            appliedTariffGrid,
            appliedFuelSurchargeLine,
        ]);

        return (
            <form id={formId ?? "pricing-form"} onSubmit={formik.handleSubmit} noValidate>
                {formik.values && (
                    <Box mb={5}>
                        {readOnly ? (
                            <ReadOnlyPricingTable
                                currency={currency}
                                vatEnabled={vatEnabled}
                                pricingLines={pricingLines}
                                gasIndexValue={formik.values.gas_index}
                                gasIndexInvoiceItem={formik.values.gas_index_invoice_item}
                                totalGasIndexPrice={totalGasIndexPrice}
                                totalFuelSurchargePrice={totalFuelSurchargePrice}
                                isOwnerOfFuelSurcharge={isOwnerOfCurrentFuelSurchargeAgreement}
                            />
                        ) : (
                            <EditablePricingTable
                                currency={currency}
                                vatEnabled={vatEnabled}
                                pricingLines={pricingLines}
                                gasIndexValue={formik.values.gas_index}
                                gasIndexInvoiceItem={formik.values.gas_index_invoice_item}
                                totalGasIndexPrice={totalGasIndexPrice}
                                totalFuelSurchargePrice={totalFuelSurchargePrice}
                                errors={hideErrors ? {} : formik.errors}
                                touched={hideErrors ? {} : formik.touched}
                                displayFuelSurchargeLineTitle={isCarrierOfTransport}
                                isOwnerOfFuelSurcharge={isOwnerOfCurrentFuelSurchargeAgreement}
                                invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                                hideGasIndexButton={hideGasIndexButton}
                                pricingType={pricingType}
                                onDeleteFuelSurchargeLine={handleDeleteFuelSurchargeLine}
                                onDeleteTariffGridLine={handleDeleteTariffGridLine}
                                onUpdateTariffGridLine={handleUpdateTariffGridLine}
                                onUpdateGasIndexInvoiceItem={handleUpdateGasIndexInvoiceItem}
                                onUpdateLineInvoiceItem={handleUpdatePricingLineInvoiceItem}
                                onUpdateLineDescription={(event, index) => {
                                    formik.setFieldError(`lines[${index}].description`, undefined);
                                    handleFormChange(event);
                                }}
                                onUpdateLineQuantity={(value, index) => {
                                    const newValue = value === null ? "" : value;
                                    if (
                                        newValue.toString() !==
                                        formik.values.lines[index].unit_price
                                    ) {
                                        formik.setFieldError(
                                            `lines[${index}].quantity`,
                                            undefined
                                        );
                                        formik.setFieldValue(`lines[${index}].quantity`, newValue);
                                    }
                                    if (!formik.values.lines[index].isOverridden) {
                                        formik.setFieldValue(`lines[${index}].isOverridden`, true);
                                    }
                                }}
                                onUpdateLineUnitPrice={(value, index) => {
                                    const newValue = value === null ? "" : value;
                                    if (
                                        newValue.toString() !==
                                        formik.values.lines[index].unit_price
                                    ) {
                                        formik.setFieldError(
                                            `lines[${index}].unit_price`,
                                            undefined
                                        );
                                        formik.setFieldValue(
                                            `lines[${index}].unit_price`,
                                            newValue
                                        );
                                    }
                                }}
                                onUpdateLineGasIndex={handleFormChange}
                                onDeleteLine={
                                    canAddOrRemoveLine ? handleDeletePricingLine : undefined
                                }
                                onUpdateGasIndexValue={(value: number) => {
                                    if (value.toString() !== formik.values.gas_index) {
                                        formik.setFieldError("gas_index", undefined);
                                        formik.setFieldValue("gas_index", value);
                                    }
                                }}
                                onDeactivateGasIndex={handleDeactivateGasIndex}
                                onCopyFromInvoicedPrice={onCopyFromInvoicedPrice}
                            />
                        )}
                        <PricingFormActionButtons
                            showAddPricingLine={!readOnly && canAddOrRemoveLine}
                            showFuelSurcharges={!readOnly && !hideGasIndexButton}
                            allowFuelSurchargeAgreement={
                                hasFuelSurchargesAndTariffGridsManagementEnabled
                            }
                            showTariffGrids={
                                !readOnly &&
                                displayTariffGrids &&
                                hasFuelSurchargesAndTariffGridsManagementEnabled
                            }
                            showCopyToFinalPrice={totalPrice !== 0}
                            isCarrierOfTransport={isCarrierOfTransport}
                            currency={currency}
                            hasAppliedManualFuelSurcharge={hasGasIndex}
                            hasAppliedFuelSurchargeAgreement={!!appliedFuelSurchargeLine}
                            appliedTariffGrid={appliedTariffGrid}
                            matchingTariffGrids={matchingTariffGridInfos}
                            matchingFuelSurchargeAgreement={matchingFuelSurchargeAgreement}
                            suggestCreateFuelSurchargeAgreementOwnerType={
                                suggestCreateFuelSurchargeAgreementOwnerType
                            }
                            onAddPricingLine={handleAddPricingLine}
                            onAddManualFuelSurcharge={handleAddGasIndex}
                            onApplyMatchingFuelSurchargeAgreement={
                                handleMatchingFuelSurchargeAgreementApply
                            }
                            onAddTariffGrid={handleTariffGridSelect}
                            onCopyToFinalPrice={onCopyToFinalPrice}
                        />
                    </Box>
                )}
                {!!(formik.errors as PricingFormErrors).negative_total_price && (
                    <Flex justifyContent="flex-start">
                        <Text color="red.dark">
                            {(formik.errors as PricingFormErrors).negative_total_price}
                        </Text>
                    </Flex>
                )}
                {!!(formik.errors as PricingFormErrors).cannot_be_empty && (
                    <Flex justifyContent="flex-start">
                        <Text color="red.dark">
                            {(formik.errors as PricingFormErrors).cannot_be_empty}
                        </Text>
                    </Flex>
                )}
                <Flex justifyContent="flex-end">
                    <PricingTotalPricesOverview
                        currency={currency}
                        totalPriceWithoutVat={totalPriceWithoutVat}
                        totalVat={totalVat}
                    />
                    {/* Align the total prices on the total column
                    (it's a manual px based workaround, so, intrinsically imperfect) */}
                    {vatEnabled ? (
                        <>{readOnly ? <Box ml="63px" /> : <Box ml="90px" />}</>
                    ) : (
                        <>{readOnly ? <Box ml="75px" /> : <Box ml="123px" />}</>
                    )}
                </Flex>
            </form>
        );

        async function handleFormChange(event: React.ChangeEvent<any>) {
            formik.handleChange(event);
        }

        function handleValidateForm(values: PricingFormData): PricingFormErrors {
            if (!canPricingBeEmpty && values.lines.length === 0) {
                return {
                    cannot_be_empty: t("pricingForm.atLeastOnePriceLineIsRequired"),
                };
            }

            if (totalPriceWithoutVat >= 0) {
                return {};
            }
            const errors: PricingFormErrors = {
                negative_total_price: t("errors.negative_total_price"),
                lines: [],
            };

            for (let line of values.lines) {
                let error: FormikErrors<PricingFormLine> = {};
                if (parseFloat(line.unit_price) < 0) {
                    error.unit_price = " ";
                }

                // The "invoice_item" field is mandatory for some connectors
                // But if it's a pricing for chartering, we can't provide it
                if (!line.invoice_item && invoiceItemRequired && !isForChartering) {
                    error.invoice_item = t("common.mandatoryField");
                }

                if (errors.lines && Array.isArray(errors.lines)) {
                    (errors.lines as FormikErrors<PricingFormLine>[]).push(error);
                }
            }
            return errors;
        }

        function handleSubmitForm(pricing: PricingFormData) {
            let returnedPricing = cloneDeep(pricing);
            if (!hasGasIndex) {
                returnedPricing.gas_index = "0";
                returnedPricing.gas_index_invoice_item = null;
            }
            onSubmit(returnedPricing, !formik.isValid);
        }

        function handleAddPricingLine(metric: PricingMetricKey) {
            let newPricingLines = [...formik.values.lines];
            const initialPricingLineQuantity = getInitialPricingLineQuantity(metric);

            const newLine: PricingFormLine = {
                description: getMetricLabel(metric) || "",
                invoice_item: null,
                metric: metric,
                quantity: initialPricingLineQuantity,
                unit_price: "",
                is_gas_indexed: true,
                isOverridden: metric === "FLAT",
                isNewLine: true,
                currency,
            };

            newPricingLines.push(newLine);

            formik.setFieldValue("lines", newPricingLines);
        }

        function getInitialPricingLineQuantity(metric: PricingMetricKey) {
            if (metric === "FLAT") {
                return "1.00";
            }

            if (!initialRealQuantities && !initialPlannedQuantities) {
                return "";
            }

            // @ts-ignore
            let initialPricingLineQuantity = getInitialRealQuantity(metric, initialRealQuantities);

            if (parseFloat(initialPricingLineQuantity) === 0) {
                // Use planned quantity data if there is no real quantity data for the metric.
                // NOTE: No real quantity data => parsed quantity === 0
                // If there is no planned quantity data, 0 will be returned.
                // @ts-ignore
                return getInitialPlannedQuantity(metric, initialPlannedQuantities);
            }

            return initialPricingLineQuantity;
        }

        function handleUpdatePricingLineInvoiceItem(
            invoiceItem: InvoiceItem,
            rowIndex: number,
            autocompleted: boolean,
            dismissedSuggestion?: boolean
        ) {
            formik.setFieldError(`lines[${rowIndex}].invoice_item`, undefined);
            formik.setFieldValue(`lines[${rowIndex}].invoice_item`, invoiceItem);
            formik.setFieldValue(
                `lines[${rowIndex}].dismissed_suggested_invoice_item`,
                dismissedSuggestion
            );

            if (autocompleted) {
                return;
            }
            // we set the description to the existing description + the invoice item description
            let previousDescription = formik.values.lines[rowIndex].description;
            let previousInvoiceItem = formik.values.lines[rowIndex].invoice_item;

            // take care to only keep the new invoice item description
            if (previousInvoiceItem) {
                previousDescription = previousDescription.replace(
                    ` - ${previousInvoiceItem.description}`,
                    ""
                );
            }

            let newDescription;

            if (invoiceItem && previousDescription !== "") {
                newDescription = `${previousDescription} - ${invoiceItem.description}`;
            } else if (invoiceItem) {
                newDescription = invoiceItem.description;
            } else {
                newDescription = previousDescription;
            }

            formik.setFieldValue(`lines[${rowIndex}].description`, newDescription);
        }

        function handleDeletePricingLine(lineIndex: number) {
            const newPricingLines = formik.values.lines.filter(
                (_, index: number) => index !== lineIndex
            );
            formik.setFieldValue("lines", newPricingLines);
        }

        function handleUpdateTariffGridLine(gridLine: TariffGridLineForm) {
            formik.setFieldValue("tariff_grid_line", gridLine);
            formik.setFieldValue("tariff_grid_line.changed", true);
        }

        function handleTariffGridSelect(uid: string | null) {
            let gridApplicationInfo: TariffGridApplicationInfo | null = null;
            if (uid !== null) {
                gridApplicationInfo =
                    matchingTariffGridInfos.find((grid) => grid.tariff_grid_version_uid === uid) ||
                    null;
            }
            if (gridApplicationInfo === null) {
                formik.setFieldValue("tariff_grid_line", null);
                return;
            }

            formik.setFieldValue(
                "tariff_grid_line",
                tariffGridMatchingService.gridApplicationInfoToGridLineForm(gridApplicationInfo)
            );
            formik.setFieldValue("tariff_grid_line.is_gas_indexed", true);
        }

        function handleDeleteTariffGridLine() {
            handleTariffGridSelect(null);
        }

        function handleAddGasIndex() {
            setHasGasIndex(true);

            handleDeleteFuelSurchargeLine();
        }

        function handleMatchingFuelSurchargeAgreementApply() {
            if (!matchingFuelSurchargeAgreement) {
                return;
            }
            handleDeactivateGasIndex();
            formik.setFieldValue("fuel_surcharge_line", {
                name: matchingFuelSurchargeAgreement.fuel_surcharge_agreement.name,
                created_by: matchingFuelSurchargeAgreement.fuel_surcharge_agreement.created_by,
                quantity: matchingFuelSurchargeAgreement.fuel_surcharge_item.computed_rate,
                invoice_item: matchingFuelSurchargeAgreement.fuel_surcharge_agreement.invoice_item,
            });
            formik.setFieldValue("dismissed_automatic_fuel_surcharge_application", false);
        }

        function handleUpdateGasIndexInvoiceItem(invoiceItem: InvoiceItem) {
            formik.setFieldValue("gas_index_invoice_item", invoiceItem);
        }

        function handleDeactivateGasIndex() {
            setHasGasIndex(false);
            formik.setFieldError("gas_index", undefined);
            formik.setFieldValue("gas_index", 0);
        }

        function handleDeleteFuelSurchargeLine() {
            formik.setFieldValue("fuel_surcharge_line", null);
            formik.setFieldValue("dismissed_automatic_fuel_surcharge_application", true);
        }
    }
);

PricingForm.displayName = "PricingForm";
