import {
    PlaceAutocompleteInputWithFormik,
    getConnectedCompany,
    getErrorMessagesFromServerError,
    type AdministrativeAddressOutput,
} from "@dashdoc/web-common";
import {getReadableAddress, t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    Checkbox,
    Flex,
    Icon,
    Link,
    Modal,
    SelectCountry,
    SwitchInput,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Address, InvoicingAddress, getLocale, yup} from "dashdoc-utils";
import {Field, FormikProvider, useFormik} from "formik";
import isEqual from "lodash.isequal";
import React, {useState} from "react";
import {useHistory} from "react-router";

import {loadInvoicingConnectorAuthenticated} from "app/redux/actions";
import {fetchUpdateCompanyInvoicingData} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {AVAILABLE_INVOICING_CONNECTORS, InvoicingDataSource} from "app/services/invoicing";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";

interface Props {
    companyPk: number;
    invoiceable: boolean;
    primaryAddress: AdministrativeAddressOutput | Address | null | undefined;
    invoicingAddress?: InvoicingAddress;
    accountCode?: string;
    sideAccountCode?: string;
    hasInvoicingRemoteId: boolean;
    onClose: () => void;
}

interface InvoiceForm {
    invoiceable: boolean;
    usePrimaryAddressAsInvoicingAddress: boolean;
    invoicing_address?: InvoicingAddress;
    account_code: string;
    side_account_code: string;
    isConfirmed: boolean;
}

export const CompanyInvoicingModal = ({
    companyPk,
    invoiceable,
    primaryAddress,
    invoicingAddress,
    accountCode,
    sideAccountCode,
    hasInvoicingRemoteId,
    onClose,
}: Props) => {
    const dispatch = useDispatch();
    const hasDashdocInvoicing = useHasDashdocInvoicingEnabled();
    const lang = getLocale();
    const connectedCompany = useSelector(getConnectedCompany);
    const [errorCannotMakeNotInvoiceable, setErrorCannotMakeNotInvoiceable] =
        useState<boolean>(false);

    // Check invoicing connector
    dispatch(loadInvoicingConnectorAuthenticated()); // aborted in the action if already loading/loaded
    const invoicingConnector = useSelector((state) => state.invoicingConnector);
    let invoicingConnectorLabel;
    if (invoicingConnector) {
        if (invoicingConnector.data_source === "custom_invoicing") {
            invoicingConnectorLabel = t("settings.invoicing.customIntegration");
        } else {
            invoicingConnectorLabel =
                AVAILABLE_INVOICING_CONNECTORS[
                    invoicingConnector.data_source as InvoicingDataSource
                ]?.name || "";
        }
    }

    const isPrimaryAddressValid = Boolean(
        primaryAddress && primaryAddress.postcode && primaryAddress.city && primaryAddress.country
    );

    const validationSchema = yup.object().shape({
        invoiceable: yup.boolean(),
        usePrimaryAddressAsInvoicingAddress: yup.boolean(),
        invoicing_address: yup
            .object()
            .nullable()
            .when(["invoiceable", "usePrimaryAddressAsInvoicingAddress"], {
                is: (invoiceable: boolean, usePrimaryAddressAsInvoicingAddress: boolean) =>
                    invoiceable && !usePrimaryAddressAsInvoicingAddress,
                then: yup.object().shape({
                    address: yup.string(),
                    postcode: yup.string().required(t("common.mandatoryField")),
                    city: yup.string().required(t("common.mandatoryField")),
                    country: yup.string().required(t("common.mandatoryField")),
                }),
            }),
        account_code: yup.string(),
        side_account_code: yup.string(),
        isConfirmed: yup.boolean().oneOf([true], t("common.mandatoryField")),
    });

    const formik = useFormik<InvoiceForm>({
        initialValues: {
            invoiceable: invoiceable,
            usePrimaryAddressAsInvoicingAddress:
                isPrimaryAddressValid &&
                (!invoicingAddress ||
                    getReadableAddress(invoicingAddress) === getReadableAddress(primaryAddress)),
            invoicing_address: invoicingAddress ?? {
                address: "",
                postcode: "",
                city: "",
                country: primaryAddress?.country ?? connectedCompany?.country ?? "",
            },
            account_code: accountCode || "",
            side_account_code: sideAccountCode || "",
            isConfirmed: true,
        },
        validateOnChange: false,
        validateOnBlur: true,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
    });

    const makeAsNotInvoiceable = !formik.values.invoiceable && invoiceable;
    const [validateMakeAsNotInvoiceable, setValidateMakeAsNotInvoiceable] = useState(false);

    const addressUpdateNeededOnExternalTool =
        invoicingConnectorLabel &&
        (invoicingConnector?.data_source === "custom_invoicing" || hasInvoicingRemoteId) && // On Winbook it also uses the name to match companies
        formik.values.invoiceable &&
        !isEqual(formik.initialValues, formik.values);

    return (
        <>
            {errorCannotMakeNotInvoiceable ? (
                <ErrorCannotMakeCompanyNotInvoiceableModal
                    companyPk={companyPk}
                    onClose={onClose}
                />
            ) : (
                <FormikProvider value={formik}>
                    <Modal
                        size="large"
                        title={t("company.invoicing.modalTitle")}
                        id="company-modal"
                        data-testid="company-modal"
                        onClose={onClose}
                        mainButton={{
                            disabled: formik.isSubmitting,
                            loading: formik.isSubmitting,
                            onClick: () =>
                                makeAsNotInvoiceable && !validateMakeAsNotInvoiceable
                                    ? setValidateMakeAsNotInvoiceable(true)
                                    : formik.submitForm(),
                            "data-testid": "invoicing-company-modal-save",
                            children: t("common.save"),
                        }}
                        secondaryButton={{
                            disabled: formik.isSubmitting,
                            "data-testid": "invoicing-company-modal-cancel-button",
                        }}
                    >
                        {validateMakeAsNotInvoiceable ? (
                            <WarningConfirmationSetCompanyNotInvoiceable
                                isConfirmed={formik.values.isConfirmed}
                                setConfirmed={(value) =>
                                    formik.setFieldValue("isConfirmed", value)
                                }
                                error={formik.errors.isConfirmed as string}
                            />
                        ) : (
                            <>
                                <SwitchInput
                                    value={formik.values.invoiceable}
                                    onChange={(value) => {
                                        formik.setFieldValue("invoiceable", value);
                                        if (value) {
                                            formik.setFieldValue("isConfirmed", true);
                                        } else if (invoiceable) {
                                            formik.setFieldValue("isConfirmed", false);
                                        }
                                    }}
                                    data-testid="invoiceable-switch"
                                    labelRight={t("company.invoicing.invoiceableSwitchLabel")}
                                />

                                {formik.values.invoiceable ? (
                                    <>
                                        <Text color="grey.dark">
                                            {t("company.invoicing.invoiceableHint")}
                                        </Text>
                                        <Text variant="h1" mt={5} mb={3}>
                                            {t("common.billing")}
                                        </Text>

                                        {isPrimaryAddressValid && (
                                            <SwitchInput
                                                value={
                                                    formik.values
                                                        .usePrimaryAddressAsInvoicingAddress
                                                }
                                                onChange={(value) => {
                                                    formik.setFieldValue(
                                                        "usePrimaryAddressAsInvoicingAddress",
                                                        value
                                                    );
                                                    if (!value) {
                                                        formik.setFieldValue("invoicing_address", {
                                                            address: "",
                                                            city: "",
                                                            postcode: "",
                                                            country: primaryAddress?.country,
                                                        });
                                                    }
                                                }}
                                                labelRight={t(
                                                    "company.invoicing.usePrimaryAddressAsInvoicingAddress"
                                                )}
                                                data-testid="use-primary-address-switch"
                                            />
                                        )}

                                        {formik.values.usePrimaryAddressAsInvoicingAddress && (
                                            <Callout variant="informative" iconDisabled mt={2}>
                                                <Flex alignItems="center">
                                                    <Icon name="address" mr={2} />
                                                    {getReadableAddress(primaryAddress)}
                                                </Flex>
                                            </Callout>
                                        )}
                                        {!formik.values.usePrimaryAddressAsInvoicingAddress && (
                                            <Flex mt={2} flexDirection={["column", "row"]}>
                                                <Box mr={[0, 2]} mb={[2, 0]} flex={4}>
                                                    <Field
                                                        component={
                                                            PlaceAutocompleteInputWithFormik
                                                        }
                                                        name="invoicing_address.address"
                                                        placeholder={t("common.address")}
                                                        data-testid="invoicing-address"
                                                        complementaryDataAutocomplete={{
                                                            postcode:
                                                                formik.values.invoicing_address
                                                                    ?.postcode,
                                                            city: formik.values.invoicing_address
                                                                ?.city,
                                                        }}
                                                        error={
                                                            (
                                                                formik.errors
                                                                    .invoicing_address as unknown as InvoicingAddress
                                                            )?.address
                                                        }
                                                        label={t("common.address")}
                                                    />
                                                </Box>
                                                <Box mr={[0, 2]} mb={[2, 0]} flex={2}>
                                                    <Field
                                                        component={
                                                            PlaceAutocompleteInputWithFormik
                                                        }
                                                        error={
                                                            (
                                                                formik.errors
                                                                    .invoicing_address as unknown as InvoicingAddress
                                                            )?.postcode
                                                        }
                                                        label={t("common.postalCode")}
                                                        required
                                                        name="invoicing_address.postcode"
                                                        placeholder={t("common.postalCode")}
                                                        data-testid="invoicing-postcode"
                                                        complementaryDataAutocomplete={{
                                                            address:
                                                                formik.values.invoicing_address
                                                                    ?.address,
                                                            city: formik.values.invoicing_address
                                                                ?.city,
                                                        }}
                                                    />
                                                </Box>
                                                <Box mr={[0, 2]} mb={[2, 0]} flex={3}>
                                                    <Field
                                                        component={
                                                            PlaceAutocompleteInputWithFormik
                                                        }
                                                        error={
                                                            (
                                                                formik.errors
                                                                    .invoicing_address as unknown as InvoicingAddress
                                                            )?.city
                                                        }
                                                        label={t("common.city")}
                                                        required
                                                        name="invoicing_address.city"
                                                        placeholder={t("common.city")}
                                                        data-testid="invoicing-city"
                                                        complementaryDataAutocomplete={{
                                                            address:
                                                                formik.values.invoicing_address
                                                                    ?.address,
                                                            postcode:
                                                                formik.values.invoicing_address
                                                                    ?.postcode,
                                                        }}
                                                    />
                                                </Box>
                                                <Box flex={3}>
                                                    <Field
                                                        name="invoicing_address.country"
                                                        placeHolder={t("common.country")}
                                                        component={SelectCountry}
                                                        error={
                                                            (
                                                                formik.errors
                                                                    .invoicing_address as unknown as InvoicingAddress
                                                            )?.country
                                                        }
                                                        label={t("common.country")}
                                                        required
                                                        onChange={(country: string) =>
                                                            formik.setFieldValue(
                                                                "invoicing_address.country",
                                                                country
                                                            )
                                                        }
                                                        value={
                                                            formik.values.invoicing_address
                                                                ?.country
                                                        }
                                                        data-testid="invoicing-country"
                                                    />
                                                </Box>
                                            </Flex>
                                        )}
                                        {addressUpdateNeededOnExternalTool && (
                                            <Callout
                                                variant="warning"
                                                mt={2}
                                                data-testid="invoicing-connector"
                                            >
                                                {t("company.invoicingEdition.noSyncWarning", {
                                                    connectorName: invoicingConnectorLabel,
                                                })}
                                            </Callout>
                                        )}
                                        {hasDashdocInvoicing && (
                                            <>
                                                <Text variant="h1" mt={5} mb={3}>
                                                    {t("common.accounting")}
                                                </Text>
                                                <Flex style={{gap: "12px"}}>
                                                    <Box flex={1}>
                                                        <TextInput
                                                            value={formik.values.account_code}
                                                            onChange={(value) =>
                                                                formik.setFieldValue(
                                                                    "account_code",
                                                                    value
                                                                )
                                                            }
                                                            error={formik.errors.account_code}
                                                            label={t("invoicing.accountCode")}
                                                            data-testid="account-code-input"
                                                        />
                                                        <TooltipWrapper
                                                            content={
                                                                <Box width="400px" py={3}>
                                                                    <Text color="grey.dark">
                                                                        {t(
                                                                            "invoicing.accountCode.explanation"
                                                                        )}
                                                                    </Text>
                                                                    {lang === "fr" && (
                                                                        <Callout
                                                                            variant="secondary"
                                                                            iconDisabled
                                                                            mt={4}
                                                                        >
                                                                            <Text>
                                                                                {t(
                                                                                    "invoicing.accountCode.explanation.frExample"
                                                                                )}
                                                                            </Text>
                                                                            <Text
                                                                                mt={2}
                                                                                fontWeight={600}
                                                                            >
                                                                                {t(
                                                                                    "invoicing.accountCode.explanation.frCodes"
                                                                                )}
                                                                            </Text>
                                                                        </Callout>
                                                                    )}
                                                                </Box>
                                                            }
                                                        >
                                                            <Text
                                                                color="grey.dark"
                                                                variant="caption"
                                                                display="flex"
                                                                alignItems="center"
                                                                mt={1}
                                                            >
                                                                <Icon
                                                                    name="info"
                                                                    color="grey.dark"
                                                                    mr={1}
                                                                />
                                                                {t(
                                                                    "invoicing.accountCode.whatIsIt"
                                                                )}
                                                            </Text>
                                                        </TooltipWrapper>
                                                    </Box>
                                                    <Box flex={1}>
                                                        <TextInput
                                                            value={formik.values.side_account_code}
                                                            onChange={(value) =>
                                                                formik.setFieldValue(
                                                                    "side_account_code",
                                                                    value
                                                                )
                                                            }
                                                            error={formik.errors.side_account_code}
                                                            label={t("invoicing.sideAccountCode")}
                                                            data-testid="side-account-code-input"
                                                        />

                                                        <TooltipWrapper
                                                            content={
                                                                <Box width="400px" py={3}>
                                                                    <Text color="grey.dark">
                                                                        {t(
                                                                            "invoicing.sideAccountCode.explanation"
                                                                        )}
                                                                    </Text>
                                                                </Box>
                                                            }
                                                        >
                                                            <Text
                                                                color="grey.dark"
                                                                variant="caption"
                                                                display="flex"
                                                                alignItems="center"
                                                                mt={1}
                                                            >
                                                                <Icon
                                                                    name="info"
                                                                    color="grey.dark"
                                                                    mr={1}
                                                                />
                                                                {t(
                                                                    "invoicing.sideAccountCode.whatIsIt"
                                                                )}
                                                            </Text>
                                                        </TooltipWrapper>
                                                    </Box>
                                                </Flex>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <Callout variant="warning" mt={2}>
                                        {t("company.notInvoiceable")}
                                    </Callout>
                                )}
                            </>
                        )}
                    </Modal>
                </FormikProvider>
            )}
        </>
    );

    async function handleSubmit(values: InvoiceForm) {
        let invoicingAddress = null;
        if (values.invoiceable) {
            if (values.usePrimaryAddressAsInvoicingAddress) {
                invoicingAddress = primaryAddress;
            } else {
                invoicingAddress = values.invoicing_address;
            }
        }
        const payload = {
            invoicing_address: invoicingAddress,
            account_code: values.invoiceable ? values.account_code : "",
            side_account_code: values.invoiceable ? values.side_account_code : "",
        };
        try {
            await dispatch(fetchUpdateCompanyInvoicingData(companyPk, payload)).then(() => {
                onClose();
                formik.setSubmitting(false);
            });
        } catch (error) {
            const responseJson = await error.json();
            if (
                error.status === 403 &&
                responseJson?.["non_field_errors"]?.["code"]?.[0] ===
                    "cannot_make_company_debtor_of_draft_invoice_non_invoiceable"
            ) {
                setErrorCannotMakeNotInvoiceable(true);
            } else {
                getErrorMessagesFromServerError(error).then(formik.setErrors);
            }
            formik.setSubmitting(false);
        }
    }
};

const WarningConfirmationSetCompanyNotInvoiceable = ({
    isConfirmed,
    setConfirmed,
    error,
}: {
    isConfirmed: boolean;
    setConfirmed: (value: boolean) => void;
    error: string | undefined;
}) => {
    return (
        <>
            <Callout variant="warning" mt={3}>
                {t("company.invoicing.makeNotInvoiceableWarningMessage")}
            </Callout>
            <Text mt={4}>{t("common.validatingAction")}</Text>
            <Box ml={3} mt={2}>
                <Flex>
                    <Icon mr={2} name="removeCircle" color="red.default" alignSelf="center" />
                    <Text>
                        {t("company.invoicing.makeNotInvoiceable.warningNotInvoiceableTransports")}
                    </Text>
                </Flex>
                <Flex>
                    <Icon mr={2} name="removeCircle" color="red.default" alignSelf="center" />
                    <Text>
                        {t("company.invoicing.makeNotInvoiceable.warningNotInvoiceableTemplate")}
                    </Text>
                </Flex>
                <Flex>
                    <Icon mr={2} name="checkCircle" color="green.default" alignSelf="center" />
                    <Text>
                        {t("company.invoicing.makeNotInvoiceable.warningInvoicedTransports")}
                    </Text>
                </Flex>
            </Box>

            <Box mt={6} pt={4} borderTop="1px solid" borderTopColor="grey.light">
                <Text mb={4}>{t("common.readAndUnderstood")}</Text>
                <Box mt={2} ml={3}>
                    <Checkbox
                        label={t("company.invoicing.makeNotInvoiceableConfirmation")}
                        checked={isConfirmed}
                        onChange={setConfirmed}
                        error={error}
                        data-testid={`company-invoicing-make-not-invoiceable-confirmation-checkbox`}
                    />
                </Box>
            </Box>
        </>
    );
};
const ErrorCannotMakeCompanyNotInvoiceableModal = ({
    companyPk,
    onClose,
}: {
    companyPk: number;
    onClose: () => void;
}) => {
    const history = useHistory();
    const link = `/app/invoices/?customer__in=${companyPk}&status__in=draft`;
    return (
        <Modal
            title={t(
                "errors.cannot_make_company_debtor_of_draft_invoice_non_invoiceable.modalTitle"
            )}
            data-testid="cannot_make_company_debtor_of_draft_invoice_non_invoiceable"
            onClose={onClose}
            mainButton={{
                onClick: onClose,
                "data-testid":
                    "cannot_make_company_debtor_of_draft_invoice_non_invoiceable-modal-save",
                children: t("common.close"),
            }}
            secondaryButton={null}
        >
            <Callout variant="danger">
                {t("errors.cannot_make_company_debtor_of_draft_invoice_non_invoiceable")}
            </Callout>
            <Link mt={3} onClick={() => history.push(link)} width="fit-content">
                {t("company.invoicing.draftInvoiceLink")}
            </Link>
        </Modal>
    );
};
