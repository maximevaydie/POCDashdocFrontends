import {
    getConnectedCompany,
    HasFeatureFlag,
    HasNotFeatureFlag,
    useSelector,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    Flex,
    Header,
    Icon,
    Link,
    Modal,
    NumberInput,
    Required,
    Text,
    TextInput,
    toast,
} from "@dashdoc/web-ui";
import {useToggle, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useCallback} from "react";

import {CarriersAndContactsPicker} from "app/features/company/contact/contacts-picker/CarriersAndContactsPicker";
import {CompaniesAndContactsPicker} from "app/features/company/contact/contacts-picker/CompaniesAndContactsPicker";
import {
    computePricingBeforeSubmit,
    getInitialPricingForm,
    type PricingFormLine,
} from "app/services/invoicing/pricing.service";

import type {QuotationRequestPost, RequestReceiver} from "../types";
import type {Transport} from "app/types/transport";

type TypeForm = {
    askedPrice: number | null;
    comment: string;
    carrier_quotations: RequestReceiver[];
};

type CreateQuotationRequestActionProps = {
    transport: Transport;
    onCreate: (values: QuotationRequestPost) => Promise<void>;
};

export const CreateQuotationRequestAction: FunctionComponent<
    CreateQuotationRequestActionProps
> = ({transport, onCreate}) => {
    const [isModalOpen, openModal, closeModal] = useToggle();
    const connectedCompany = useSelector(getConnectedCompany);

    const onSubmit = useCallback(
        async (values: TypeForm) => {
            let askedPricing;
            if (values.askedPrice) {
                const pricingLine: PricingFormLine = {
                    description: t("pricingMetrics.flat"),
                    invoice_item: null,
                    metric: "FLAT",
                    quantity: "1.00",
                    unit_price: values.askedPrice.toFixed(2),
                    is_gas_indexed: false,
                    isOverridden: true,
                    currency: "EUR",
                };
                askedPricing = getInitialPricingForm(null, connectedCompany);
                askedPricing.lines.push(pricingLine);
                askedPricing = computePricingBeforeSubmit(askedPricing, false);
            }

            try {
                await onCreate({
                    transport_uid: transport.uid,
                    comment: values.comment,
                    asked_pricing: askedPricing,
                    carrier_quotations: values.carrier_quotations,
                });
            } catch (error) {
                toast.error(t("common.error"));
            }
            closeModal();
        },
        [closeModal, onCreate, transport.uid]
    );

    const formik = useFormik<TypeForm>({
        initialValues: {
            askedPrice: null,
            comment: "",
            carrier_quotations: [] as RequestReceiver[],
        },
        validationSchema: yup.object().shape({
            askedPrice: yup.string().nullable(),
            comment: yup.string(),
            carrier_quotations: yup
                .array()
                .of(
                    yup.object().shape({
                        carrier_id: yup.number().required(t("common.mandatoryField")),
                        contact_uid: yup.string().required(t("common.mandatoryField")),
                    })
                )
                .min(1)
                .required(t("common.mandatoryField")),
        }),
        validateOnMount: true,
        onSubmit: onSubmit,
    });

    const onUpdateAskedPricing = (value: number | null) => {
        formik.setFieldError("askedPrice", undefined);
        formik.setFieldValue("askedPrice", isNil(value) ? "" : value);
    };

    return (
        <Box data-testid="rfq-action">
            <Header title={t("rfq.create.header")} icon="requestForQuotations">
                <Box>
                    <Text>
                        {t("rfq.create.explanation")}
                        <Link href={t("rfq.create.explanation.moreUrl")}>
                            {t("common.learnMore")}
                        </Link>
                    </Text>
                </Box>
            </Header>
            <Button
                mt={4}
                type="button"
                variant="plain"
                onClick={openModal}
                data-testid="rfq-create"
            >
                <Icon name="plusSign" mr={2} />
                {t("rfq.create.new")}
            </Button>
            {isModalOpen && (
                <Modal
                    title={t("rfq.create.new")}
                    data-testid="rfq-create-modal"
                    mainButton={{
                        children: t("rfq.create.send"),
                        disabled: !formik.isValid || formik.isSubmitting,
                        form: "quotation-request-form",
                        type: "submit",
                        "data-testid": "rfq-send",
                    }}
                    size="large"
                    secondaryButton={{}}
                    onClose={closeModal}
                >
                    <FormikProvider value={formik}>
                        <Form id="quotation-request-form">
                            <Callout variant="neutral" iconDisabled p={0} mb={6}>
                                {t("rfq.create.form.explanation")}
                                <Link href={t("rfq.create.form.explanation.moreUrl")}>
                                    {t("common.learnMore")}
                                </Link>
                            </Callout>

                            <Callout p={4} iconDisabled flexGrow={1}>
                                <HasFeatureFlag flagName="betterCompanyRoles">
                                    <CarriersAndContactsPicker
                                        title={
                                            <>
                                                {t("common.carrier")}
                                                <Required />
                                            </>
                                        }
                                        addContactLabel={
                                            <>
                                                <Icon name="plusSign" mr={2} />
                                                {t("components.addCarrier")}
                                            </>
                                        }
                                        onChange={(requestReceivers) => {
                                            formik.setFieldValue(
                                                "carrier_quotations",
                                                requestReceivers
                                            );
                                        }}
                                    />
                                </HasFeatureFlag>
                                <HasNotFeatureFlag flagName="betterCompanyRoles">
                                    <CompaniesAndContactsPicker
                                        title={
                                            <>
                                                {t("common.carrier")}
                                                <Required />
                                            </>
                                        }
                                        addContactLabel={
                                            <>
                                                <Icon name="plusSign" mr={2} />
                                                {t("components.addCarrier")}
                                            </>
                                        }
                                        onChange={(requestReceivers) => {
                                            formik.setFieldValue(
                                                "carrier_quotations",
                                                requestReceivers
                                            );
                                        }}
                                    />
                                </HasNotFeatureFlag>
                                <Callout mt={4} p={0} variant="neutral">
                                    {t("rfq.create.form.emailPolicy")}
                                </Callout>
                            </Callout>

                            <Flex justifyContent="space-between" flexGrow={1}>
                                <Box width="48%">
                                    <Text variant="h1" fontWeight={600} mt={4} mb={3}>
                                        {t("rfq.create.form.proposedPrice")}
                                    </Text>
                                    <NumberInput
                                        height={50}
                                        name="askedPrice"
                                        value={formik.values.askedPrice}
                                        onChange={onUpdateAskedPricing}
                                        onTransientChange={onUpdateAskedPricing} // Update the UI as the user types
                                        maxDecimals={2}
                                        units={"€"}
                                        error={formik.errors.askedPrice as string}
                                        data-testid="quotation-request-form-asked-price"
                                    />
                                </Box>
                                <Box width="48%">
                                    <Text variant="h1" fontWeight={600} mt={4} mb={3}>
                                        {t("common.comment")}
                                    </Text>
                                    <TextInput
                                        maxLength={1000}
                                        name="comment"
                                        aria-label={t("common.comment")}
                                        label={t("common.comment")}
                                        value={formik.values.comment}
                                        error={!!formik.errors.comment}
                                        onChange={(value) =>
                                            formik.setFieldValue("comment", value)
                                        }
                                        data-testid="quotation-request-form-comment"
                                    />
                                </Box>
                            </Flex>
                        </Form>
                    </FormikProvider>
                </Modal>
            )}
        </Box>
    );
};
