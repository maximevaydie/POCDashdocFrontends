import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text, TextInput, toast} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {FormikHelpers, useFormik} from "formik";
import React, {useState} from "react";

import {apiService} from "../../services/api.service";
import {getErrorMessagesFromServerError} from "../../services/errors.service";

type PasswordValidationRuleText = {
    text: string;
};

const PasswordValidationRuleText: React.FC<PasswordValidationRuleText> = ({text}) => {
    return (
        <Text my={2} whiteSpace="pre-line" variant="caption" color="grey.dark">
            {text}
        </Text>
    );
};

type FormProps = {
    new_password: string;
    old_password: string;
    new_password_confirm: string;
};

export function SettingsPassword() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (
        formValues: FormProps,
        formikHelpers: FormikHelpers<FormProps>
    ) => {
        try {
            const data = {
                old_password: formValues.old_password,
                new_password: formValues.new_password,
            };

            setLoading(true);
            await apiService.Users.updatePassword(data, {apiVersion: "v4"});
            formik.setErrors({});
            toast.success(t("settings.password.updateSuccess"));
        } catch (error) {
            getErrorMessagesFromServerError(error).then(formikHelpers.setErrors);
        }
        setLoading(false);
    };

    const formik = useFormik({
        initialValues: {
            old_password: "",
            new_password: "",
            new_password_confirm: "",
        },
        validationSchema: yup.object().shape({
            old_password: yup.string().required(t("common.mandatoryField")),
            new_password: yup
                .string()
                .required(t("common.mandatoryField"))
                .min(6, t("common.passwordLengthError"))
                .matches(/(?!^\d+$)^.+$/, t("common.passwordOnlyDigitsError")),
            new_password_confirm: yup
                .string()
                .required(t("common.mandatoryField"))
                .oneOf([yup.ref("new_password")], t("settings.password.differentPasswords")),
        }),
        validateOnBlur: false,
        validateOnChange: false,
        onSubmit: handleSubmit,
    });

    return (
        <Box width={["100%", "100%", "50%"]}>
            <h4 className="panel-settings-heading">{t("common.password")}</h4>
            <form onSubmit={formik.handleSubmit} noValidate>
                <TextInput
                    type="password"
                    label={t("settings.oldPassword")}
                    placeholder="***"
                    autoComplete="current-password"
                    data-testid="settings-password-old"
                    {...formik.getFieldProps("old_password")}
                    onChange={(_value, e) => {
                        // @ts-ignore
                        formik.setFieldError("old_password", null);
                        formik.handleChange(e);
                    }}
                    error={formik.touched.old_password && formik.errors.old_password}
                    required
                />
                <TextInput
                    containerProps={{mt: 2}}
                    type="password"
                    label={t("settings.newPassword")}
                    placeholder="***"
                    autoComplete="new-password"
                    data-testid="settings-password-new"
                    {...formik.getFieldProps("new_password")}
                    onChange={(_value, e) => {
                        // @ts-ignore
                        formik.setFieldError("new_password", null);
                        formik.handleChange(e);
                    }}
                    error={formik.touched.new_password && formik.errors.new_password}
                    required
                />
                <PasswordValidationRuleText text={t("settings.password.yourPassword")} />
                <Box as="ul" pl={4}>
                    <Box as="li">
                        <PasswordValidationRuleText
                            text={t("settings.password.validationRuleOne")}
                        />
                    </Box>
                    <Box as="li">
                        <PasswordValidationRuleText
                            text={t("settings.password.validationRuleTwo")}
                        />
                    </Box>
                    <Box as="li">
                        <PasswordValidationRuleText
                            text={t("settings.password.validationRuleThree")}
                        />
                    </Box>
                    <Box as="li">
                        <PasswordValidationRuleText
                            text={t("settings.password.validationRuleFour")}
                        />
                    </Box>
                </Box>
                <TextInput
                    type="confirmationPassword"
                    label={t("settings.confirmPassword")}
                    placeholder="***"
                    data-testid="settings-password-confirm"
                    {...formik.getFieldProps("new_password_confirm")}
                    onChange={(_value, e) => {
                        // @ts-ignore
                        formik.setFieldError("new_password_confirm", null);
                        formik.handleChange(e);
                    }}
                    error={
                        formik.touched.new_password_confirm && formik.errors.new_password_confirm
                    }
                    required
                />
                <Flex mt={5} justifyContent="flex-end">
                    <Button type="submit" disabled={loading} data-testid="settings-password-save">
                        {t("common.save")}
                    </Button>
                </Flex>
            </form>
        </Box>
    );
}
