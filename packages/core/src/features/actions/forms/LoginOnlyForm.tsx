import {t} from "@dashdoc/web-core";
import {Button, Flex, Link, Text, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {useState} from "react";

type Props = {
    onSubmit: (payload: {username: string; password: string}) => Promise<void>;
};

export function LoginOnlyForm({onSubmit}: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const form = useFormik({
        initialValues: {
            username: "",
            password: "",
        },
        validationSchema: yup.object().shape({
            username: yup
                .string()
                .required(t("login.errors.email.empty"))
                .email(t("errors.email.invalid")),
            password: yup.string().required(t("login.errors.password.empty")),
        }),
        onSubmit: async (payload) => {
            try {
                setIsLoading(true);
                await onSubmit(payload);
            } catch (e) {
                setIsLoading(false);
                setError(true);
            }
        },
    });

    return (
        <form onSubmit={form.handleSubmit} noValidate>
            <TextInput
                type="email"
                data-testid="login-email-input"
                label={t("common.email")}
                containerProps={{mt: 3}}
                {...form.getFieldProps("username")}
                onChange={(_value, e) => {
                    setError(false);
                    form.handleChange(e);
                }}
                error={(form.touched.username && form.errors.username) || error}
                required
            />
            <TextInput
                type="password"
                data-testid="login-password-input"
                label={t("common.password")}
                containerProps={{mt: 3}}
                {...form.getFieldProps("password")}
                onChange={(_value, e) => {
                    setError(false);
                    form.handleChange(e);
                }}
                error={(form.touched.password && form.errors.password) || error}
                required
            />
            {error && (
                <Text data-testid="login-error-message" color="red.default">
                    {t("login.errors.unauthorized")}
                </Text>
            )}
            <Flex mt={3} justifyContent="flex-end">
                <Link href={`${window.location.origin}/api/user/password/reset/`}>
                    {t("login.forgottenPassword")}
                </Link>
            </Flex>
            <Flex mt={3} justifyContent="flex-end">
                <Button type="submit" disabled={isLoading || !form.isValid}>
                    {t("common.login")}
                </Button>
            </Flex>
        </form>
    );
}
