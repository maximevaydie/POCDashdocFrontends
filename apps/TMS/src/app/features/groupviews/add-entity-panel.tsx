import {
    LocalizedPhoneNumberInput,
    VAT_NUMBER_REGEX,
    getConnectedCompany,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    FileUploadInput,
    Flex,
    Icon,
    SelectCountry,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {yup} from "dashdoc-utils";
import {Field, Form, FormikProvider, useFormik} from "formik";
import padStart from "lodash.padstart";
import React, {FunctionComponent, useState} from "react";
import {Value} from "react-phone-number-input";
import {useDispatch} from "react-redux";

import {fetchAddCompanyFromGroupView} from "app/redux/actions";
import {useSelector} from "app/redux/hooks";

interface EntityAdd {
    name: string;
    primary_address: {
        address: string;
        postcode: string;
        city: string;
        country: string;
    };
    phone_number: string;
    trade_number: string;
    vat_number: string;
    website: string;
    email: string;
    logo: File;
}
const maxLogoSize = 500 * 1024;
const supportedLogoFormats = ["image/jpg", "image/jpeg", "image/gif", "image/png", "image/webp"];

type AddEntityPanelProps = {
    onSubmit: () => void;
    onClose: () => void;
};
const AddEntityPanel: FunctionComponent<AddEntityPanelProps> = ({onClose, onSubmit}) => {
    const company = useSelector(getConnectedCompany);
    const dispatch = useDispatch();
    const timezone = useTimezone();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values: EntityAdd) => {
        setIsSubmitting(true);
        await dispatch(
            fetchAddCompanyFromGroupView({...values, country: values.primary_address.country})
        );
        setIsSubmitting(false);
        onSubmit();
        onClose();
    };

    const formik = useFormik({
        initialValues: {
            name: "",
            primary_address: {
                address: "",
                postcode: "",
                city: "",
                country: "FR",
            },
            phone_number: "",
            trade_number: "",
            vat_number: "",
            website: "",
            email: "",
            // @ts-ignore
            logo: null,
        },
        validationSchema: yup.object().shape({
            name: yup.string().required(t("common.mandatoryField")),
            email: yup.string().required().email(t("errors.email.invalid")).nullable(true),
            phone_number: yup
                .string()
                .required()
                .phone(t("common.invalidPhoneNumber"))
                .nullable(true),
            vat_number: yup.string().matches(VAT_NUMBER_REGEX, t("common.invalidVatNumber")),
            trade_number: yup.string(),
            primary_address: yup.object().nullable(true).shape({
                address: yup.string(),
                postcode: yup.string(),
                city: yup.string(),
                country: yup.string(),
            }),
            website: yup.string().url().nullable(true),
            logo: yup
                .mixed()
                .test(
                    "fileSize",
                    t("settings.invalidLogoSize", {size: maxLogoSize / 1024 + "kB"}),
                    (value) => !value || (value && value.size <= maxLogoSize)
                )
                .test(
                    "fileFormat",
                    t("settings.invalidLogoFormat", {formats: supportedLogoFormats.join(", ")}),
                    (value) => !value || supportedLogoFormats.includes(value.type)
                ),
        }),
        onSubmit: handleSubmit,
        validateOnBlur: true,
        validateOnChange: false,
    });

    const handleTradeNumberChange = (tradeNumber: string) => {
        formik.setFieldValue("trade_number", tradeNumber);
        const cleanedTradeNumber = tradeNumber.split(" ").join("");
        if (cleanedTradeNumber.length >= 9 && /^\d+$/.test(cleanedTradeNumber)) {
            const siren = cleanedTradeNumber.slice(0, 9);
            const vatKey = padStart(String((12 + 3 * (Number(siren) % 97)) % 97), 2, "0");
            const vatNumber = `FR${vatKey}${siren}`;
            formik.setFieldValue("vat_number", vatNumber);
        }
    };
    return (
        <Flex flexDirection="column">
            <Flex backgroundColor="blue.default" justifyContent="space-between" p={4}>
                <Text
                    as="h4"
                    fontWeight="bold"
                    display="inline-block"
                    color="grey.white"
                    alignSelf="center"
                >
                    {t("components.addAnEntity")}
                </Text>
                <Icon
                    name="cancel"
                    color="grey.white"
                    onClick={onClose}
                    css={css`
                        cursor: pointer;
                    `}
                />
            </Flex>

            <FormikProvider value={formik}>
                <Form>
                    <Flex
                        flexDirection="column"
                        height="calc(100vh - 4em)"
                        justifyContent="space-between"
                    >
                        <Box mx={4} mt={8} mb={4}>
                            <TextInput
                                mb={4}
                                data-testid="input-entity-name"
                                required
                                name="name"
                                label={t("settings.entityNameLabel")}
                                value={formik.values.name}
                                error={formik.errors.name as string}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />
                            <TextInput
                                mb={4}
                                required
                                data-testid="input-entity-email"
                                name="email"
                                label={t("common.email")}
                                value={formik.values.email}
                                error={formik.errors.email as string}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />

                            <LocalizedPhoneNumberInput
                                mb={4}
                                label={t("common.phoneNumber")}
                                data-testid="input-entity-phone-number"
                                value={formik.values.phone_number as Value}
                                onChange={(phoneNumber?: Value) =>
                                    formik.setFieldValue("phone_number", phoneNumber)
                                }
                                error={formik.errors.phone_number}
                                country={company?.country}
                            />
                            <TextInput
                                mb={4}
                                name="trade_number"
                                data-testid="input-entity-trade-number"
                                label="SIRET"
                                value={formik.values.trade_number}
                                error={formik.errors.trade_number as string}
                                onChange={(value) => handleTradeNumberChange(value)}
                            />
                            <TextInput
                                mb={4}
                                label={t("settings.companyVATNumberLabel")}
                                placeholder={t("settings.enterTradeNumber")}
                                value={formik.values.vat_number}
                                error={formik.errors.vat_number as string}
                                disabled
                                onChange={() => {}}
                            />
                            <TextInput
                                mb={4}
                                name="website"
                                data-testid="input-entity-website"
                                label={t("common.website")}
                                value={formik.values.website}
                                error={formik.errors.website as string}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />
                            <Box mb={4}>
                                <FileUploadInput
                                    onFileChange={(files) =>
                                        formik.setFieldValue(
                                            "logo",
                                            files.length > 0 ? files[0] : undefined,
                                            true
                                        )
                                    }
                                    onRemoveFile={() => formik.setFieldValue("logo", "", true)}
                                    label={t("settings.logo")}
                                    supportedFileFormats={supportedLogoFormats}
                                    error={
                                        typeof formik.errors.logo === "string"
                                            ? formik.errors.logo
                                            : undefined
                                    }
                                />
                            </Box>
                            <TextInput
                                mb={4}
                                data-testid="input-entity-address"
                                name="primary_address.address"
                                label={t("common.address")}
                                value={formik.values.primary_address.address}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />
                            <TextInput
                                mb={4}
                                data-testid="input-entity-postcode"
                                name="primary_address.postcode"
                                label={t("common.postalCode")}
                                value={formik.values.primary_address.postcode}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />
                            <TextInput
                                mb={4}
                                data-testid="input-entity-city"
                                name="primary_address.city"
                                label={t("common.city")}
                                value={formik.values.primary_address.city}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />

                            <Field
                                mb={4}
                                name="primary_address.country"
                                label={t("common.country")}
                                component={SelectCountry}
                                value={formik.values.primary_address.country}
                                error={formik.errors.primary_address?.country}
                                onChange={(country: string) =>
                                    formik.setFieldValue("primary_address.country", country)
                                }
                            />
                            <TextInput
                                mb={4}
                                disabled={true}
                                value={timezone}
                                label={t("settings.timezoneLabel")}
                                // @ts-ignore
                                onChange={null}
                            />
                        </Box>

                        <Flex p={4} justifyContent="end" backgroundColor="blue.ultralight">
                            <Button
                                mr={1}
                                variant="secondary"
                                onClick={onClose}
                                type="button"
                                disabled={isSubmitting}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                ml={1}
                                type="submit"
                                data-testid="save-entity-button"
                                disabled={isSubmitting}
                            >
                                {t("common.save")}
                            </Button>
                        </Flex>
                    </Flex>
                </Form>
            </FormikProvider>
        </Flex>
    );
};

export default AddEntityPanel;
