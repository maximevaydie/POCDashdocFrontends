import {cookiesService, LocaleOption, t} from "@dashdoc/web-core";
import {Box, Button, Card, Flex, Link, Text, TextInput} from "@dashdoc/web-ui";
import {yup} from "dashdoc-utils";
import {useFormik} from "formik";
import React, {FunctionComponent, useState} from "react";
import {useSelector} from "react-redux";
import {Redirect, RouteComponentProps} from "react-router";

import {FLOW_ROOT_PATH, TMS_ROOT_PATH, WASTE_ROOT_PATH} from "../../../constants/constants";
import {ProductLogo} from "../../logo/ProductLogo";
import {isAuthenticated} from "../../../../../../react/Redux/authSelector";
import {authService} from "../../../services/auth.service";
import {LanguageSelect} from "../../navbar/components/LanguageSelect";

export const LoginScreen: FunctionComponent<
    // @ts-ignore
    RouteComponentProps<unknown, unknown, {from?: string}>
> = ({location}) => {
    const isAuth = useSelector(isAuthenticated);

    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
        onSubmit: async (data) => {
            try {
                setIsLoading(true);
                await authService.loginByForm(data);
            } catch (e) {
                setIsLoading(false);
                setError(true);
            }
        },
    });

    if (isAuth) {
        let next: string;

        if (location.state?.from) {
            next = location.state?.from;
        } else if (window.location.pathname.startsWith(FLOW_ROOT_PATH)) {
            next = FLOW_ROOT_PATH;
        } else if (window.location.pathname.startsWith(WASTE_ROOT_PATH)) {
            next = WASTE_ROOT_PATH;
        } else {
            next = TMS_ROOT_PATH;
        }

        return <Redirect to={next} />;
    }

    return (
        <>
            <Box position="absolute" top={1} right={1} width={70}>
                <LanguageSelect
                    onChange={(option: LocaleOption) => {
                        if (option.value) {
                            cookiesService.setLanguageCookieAndReload(option.value);
                        }
                    }}
                />
            </Box>
            <Flex alignItems="center" justifyContent="center" height="100%">
                <Flex flexDirection="column" flex={1} maxWidth={500} alignItems="center">
                    <ProductLogo />
                    <Card p={6} m={6} width="100%">
                        <Text variant="title">{t("common.login")}</Text>
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
                    </Card>
                </Flex>
            </Flex>
        </>
    );
};
