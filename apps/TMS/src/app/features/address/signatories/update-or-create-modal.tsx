import {
    apiService,
    getConnectedCompany,
    getErrorMessagesFromServerError,
    LocalizedPhoneNumberInput,
} from "@dashdoc/web-common";
import {LOCALES_OPTIONS, t} from "@dashdoc/web-core";
import {Box, Callout, Modal, Select, SelectOption, TextInput} from "@dashdoc/web-ui";
import {CountryCode, NewSignatory, yup} from "dashdoc-utils";
import {FormikProps, FormikProvider, useFormik} from "formik";
import React from "react";
import {Value} from "react-phone-number-input";

import {useSelector} from "app/redux/hooks";
interface Values {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    site: string;
    language: string;
}

export const UpdateOrCreateSignatoryModal = ({
    onConfirm,
    onCancel,
    signatory,
    siteUID,
    default_language,
    country,
}: {
    onConfirm: (signatory?: NewSignatory) => void;
    onCancel: () => void;
    signatory?: NewSignatory;
    siteUID?: string;
    default_language?: string;
    country?: CountryCode;
}) => {
    const initialValues: Values = {
        first_name: signatory?.first_name || "",
        last_name: signatory?.last_name || "",
        email: signatory?.email || "",
        phone_number: signatory?.phone_number || "",
        // @ts-ignore
        site: siteUID,
        language: signatory?.language || default_language || "",
    };

    const connectedCompany = useSelector(getConnectedCompany);

    const submit = async (values: Values, formik: FormikProps<Values>) => {
        try {
            let freshSignatory: NewSignatory;
            if (signatory) {
                freshSignatory = await apiService.TransportSignatories.patch(
                    signatory.uid,
                    {
                        data: values,
                    },
                    {
                        apiVersion: "web",
                    }
                );
            } else {
                freshSignatory = await apiService.TransportSignatories.post(
                    {
                        data: values,
                    },
                    {
                        apiVersion: "web",
                    }
                );
            }
            onConfirm(freshSignatory);
        } catch (error) {
            const messages = await getErrorMessagesFromServerError(error);
            formik.setErrors(messages);
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        onSubmit: submit,
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object().shape({
            phone_number: yup.string().phone(t("common.invalidPhoneNumber")),
        }),
    });

    return (
        <Modal
            title={signatory ? t("signatories.update") : t("signatories.create")}
            id="add-signatory-modal"
            data-testid="add-signatory-modal"
            onClose={onCancel}
            mainButton={{
                "data-testid": "add-signatory-modal-save",
                children: t("common.save"),
                onClick: formik.submitForm,
            }}
            secondaryButton={{
                "data-testid": "add-signatory-modal-close",
                onClick: () => onCancel(),
            }}
        >
            <FormikProvider value={formik}>
                <Box mb={2}>
                    <TextInput
                        data-testid="add-signatory-modal-first-name"
                        {...formik.getFieldProps("first_name")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        label={t("settings.firstNameLabel")}
                        error={formik.errors.first_name}
                    />
                </Box>
                <Box mb={2}>
                    <TextInput
                        required
                        data-testid="add-signatory-modal-last-name"
                        {...formik.getFieldProps("last_name")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        label={t("settings.lastNameLabel")}
                        error={formik.errors.last_name}
                    />
                </Box>
                <Box mb={2}>
                    <TextInput
                        data-testid="add-email-modal"
                        {...formik.getFieldProps("email")}
                        onChange={(_, e) => {
                            formik.handleChange(e);
                        }}
                        label={t("common.email")}
                        error={formik.errors.email}
                    />
                </Box>
                <Box mb={2}>
                    <LocalizedPhoneNumberInput
                        data-testid="add-phone-number-modal"
                        value={formik.values.phone_number as Value}
                        onChange={(phoneNumber?: Value) =>
                            formik.setFieldValue("phone_number", phoneNumber)
                        }
                        error={formik.errors.phone_number}
                        country={country || connectedCompany?.country}
                    />
                </Box>
                <Box mb={2}>
                    <Select
                        label={t("settings.language")}
                        error={formik.errors.language}
                        isSearchable={true}
                        options={LOCALES_OPTIONS}
                        // @ts-ignore
                        value={
                            formik.values.language && {
                                value: formik.values.language,
                                label: LOCALES_OPTIONS.filter(
                                    (option: SelectOption) =>
                                        option.value === formik.values.language
                                )[0].label,
                            }
                        }
                        onChange={(language: SelectOption<string>) => {
                            formik.setFieldValue("language", language ? language.value : "");
                        }}
                    />
                </Box>
            </FormikProvider>
            <Callout>{t("signatories.signatoryContactInfo")}</Callout>
        </Modal>
    );
};
