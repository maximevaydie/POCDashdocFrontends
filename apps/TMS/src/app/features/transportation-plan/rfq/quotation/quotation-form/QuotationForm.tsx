import {t} from "@dashdoc/web-core";
import {Badge, Box, DatePicker, Flex, Icon, Required, Text, TextArea} from "@dashdoc/web-ui";
import {SlimCompany, formatNumber} from "dashdoc-utils";
import {Form, Formik} from "formik";
import React, {FunctionComponent} from "react";

import {InvoiceItemSuggestionArguments} from "app/features/pricing/invoices/invoice-item/invoice-item-suggestion";
import {PricingForm} from "app/features/pricing/pricing-form/PricingForm";
import {Quotation} from "app/types/rfq";

import {QuotationFormData} from "../types";

type QuotationFormProps = {
    initialValues: QuotationFormData;
    commandNumber: number;
    authorCompany: SlimCompany;
    quotation: Quotation;
    readOnly: boolean;
    acceptedQuotationPercentage: string | null;
    surveyedCarriersCount: number;
    onSubmit: (values: QuotationFormData) => void;
};

export const QuotationForm: FunctionComponent<QuotationFormProps> = ({
    initialValues,
    commandNumber,
    quotation,
    authorCompany,
    readOnly,
    acceptedQuotationPercentage,
    surveyedCarriersCount,
    onSubmit,
}) => {
    const {carrier} = quotation;
    const invoiceItemSuggestionArguments: InvoiceItemSuggestionArguments = {
        shipperId: authorCompany.pk,
    };
    return (
        <Flex mt={4} flexGrow={1} flexDirection="column">
            <Text variant="title">
                {t("components.switchDemoModalHello", {
                    name: carrier.name,
                })}
            </Text>
            <Flex my={4}>
                <Text>
                    <Text variant="h1" as="span">
                        {authorCompany.name}
                    </Text>
                    &nbsp;
                    {t("rfq.quotationForm.sendYouAQuotation", {smart_count: commandNumber})}
                </Text>
            </Flex>

            <Flex
                flexWrap="wrap"
                style={{gap: "16px"}}
                pb={6}
                mb={2}
                borderBottom="1px solid"
                borderColor="grey.light"
            >
                <Badge shape="squared">
                    <Icon name="interrogates" mr={2} />
                    <Text>
                        {t("rfq.quotationForm.surveyedCarriers", {
                            smart_count: surveyedCarriersCount,
                        })}
                    </Text>
                </Badge>
                {acceptedQuotationPercentage && (
                    <Badge shape="squared">
                        <Icon name="cart" mr={2} />
                        <Text>
                            {t("rfq.quotationForm.acceptedQuotationPercentage", {
                                percent: formatNumber(acceptedQuotationPercentage, {
                                    style: "percent",
                                    maximumFractionDigits: 2,
                                }),
                                name: authorCompany.name,
                            })}
                        </Text>
                    </Badge>
                )}
            </Flex>
            <Formik initialValues={initialValues} onSubmit={onSubmit}>
                {(formik) => (
                    <Form id="carrier-quotation-form">
                        <Flex flexDirection="column">
                            <Text variant="h1" fontWeight={600} mt={4} mb={3}>
                                {t("common.unloadingCompleteDate")}
                                <Required />
                            </Text>
                            <Text>
                                {t("rfq.quotationForm.deliveryDateExplanation")}
                                {t("common.colon")}
                            </Text>
                            <Box zIndex="level2" mr="auto">
                                <DatePicker
                                    required
                                    date={formik.values.expected_delivery_date as Date}
                                    placeholder={t("common.unloadingCompleteDate")}
                                    onChange={(date) => {
                                        formik.setFieldValue("expected_delivery_date", date);
                                    }}
                                    disabled={readOnly}
                                />
                            </Box>
                            <Text variant="h1" fontWeight={600} mt={4} mb={3}>
                                {t("rfq.quotationForm.quotationPrice")}
                                <Required />
                            </Text>
                            <Text mb={3}>
                                {t("rfq.quotationForm.quotationPriceExplanation")}
                                {t("common.colon")}
                            </Text>
                            <PricingForm
                                hideHeaderInformation
                                isCarrierOfTransport={
                                    false /* We don't want to display vat for a carrier quotation */
                                }
                                isOwnerOfCurrentFuelSurchargeAgreement={true}
                                canAddOrRemoveLine={false}
                                formId="carrier-quotation-subform"
                                initialPricing={formik.values.quotation}
                                submitOnChange
                                onSubmit={(value) => {
                                    formik.setFieldValue("quotation", value);
                                }}
                                matchingTariffGridInfos={[]}
                                matchingFuelSurchargeAgreement={null}
                                invoiceItemSuggestionArguments={invoiceItemSuggestionArguments}
                                displayTariffGrids={false} //No tariff grids for quotation
                                readOnly={readOnly}
                            />
                            <Text variant="h1" fontWeight={600} mt={4} mb={3}>
                                {t("common.comment")}
                            </Text>
                            <TextArea
                                height={100}
                                maxLength={1000}
                                name="unavailability-note"
                                aria-label={t("common.comment")}
                                label={t("common.comment")}
                                data-testid="unavailability-note"
                                value={formik.values.comment}
                                error={formik.errors.comment}
                                disabled={readOnly}
                                onChange={(value) => formik.setFieldValue("comment", value)}
                            />
                        </Flex>
                    </Form>
                )}
            </Formik>
        </Flex>
    );
};
