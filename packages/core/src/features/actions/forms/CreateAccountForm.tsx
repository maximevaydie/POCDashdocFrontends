import {apiService, getMessageFromErrorCode} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Box, Button, Flex, Link, Text, TextInput} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

interface CreateAccountFormType {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface CreateAccountPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

type Props = {
    onSubmit: (payload: CreateAccountPayload) => void;
    onLoginRedirect: () => void;
};

export function CreateAccountForm({onSubmit, onLoginRedirect}: Props) {
    const validationSchema = z.object({
        first_name: z.string(),
        last_name: z.string().nonempty(t("errors.field_cannot_be_empty")),
        email: z
            .string()
            .email(t("errors.email.invalid"))
            .nonempty(t("errors.field_cannot_be_empty")),
        password: z.string(),
    });
    const methods = useForm<CreateAccountFormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
        },
        mode: "onChange",
    });

    const {
        control,
        handleSubmit,
        trigger,
        formState: {isValid, isSubmitting},
        clearErrors,
        setError,
    } = methods;
    const canSubmit = isValid && !isSubmitting;
    return (
        <Box>
            <Box maxWidth="400px" margin="auto">
                <Text variant="h1" textAlign="center" my={4}>
                    {t("common.createAccount")}
                </Text>
                <Box marginBottom={5} width="100%">
                    <Box
                        style={{gap: "16px", display: "grid", gridTemplateColumns: `1fr 1fr`}}
                        data-testid="form-create-account"
                    >
                        <Controller
                            name="last_name"
                            defaultValue=""
                            control={control}
                            render={({field, fieldState}) => (
                                <TextInput
                                    {...field}
                                    data-testid="user-last-name"
                                    label={t("settings.lastNameLabel")}
                                    required={true}
                                    error={fieldState.error?.message}
                                    onChange={(e) => {
                                        clearErrors(field.name);
                                        field.onChange(e);
                                        trigger(field.name);
                                    }}
                                />
                            )}
                        />
                        <Controller
                            name="first_name"
                            defaultValue=""
                            control={control}
                            render={({field, fieldState}) => (
                                <TextInput
                                    {...field}
                                    data-testid="user-first-name"
                                    label={t("settings.firstNameLabel")}
                                    flexGrow={1}
                                    error={fieldState.error?.message}
                                    onChange={(e) => {
                                        clearErrors(field.name);
                                        field.onChange(e);
                                        trigger(field.name);
                                    }}
                                />
                            )}
                        />
                    </Box>
                </Box>
                <Box marginBottom={5}>
                    <Controller
                        name="email"
                        defaultValue=""
                        control={control}
                        render={({field, fieldState}) => {
                            return (
                                <TextInput
                                    {...field}
                                    data-testid="user-email"
                                    label={t("common.email")}
                                    required={true}
                                    error={fieldState.error?.message}
                                    onChange={(e) => {
                                        clearErrors(field.name);
                                        field.onChange(e);
                                    }}
                                    onBlur={() => {
                                        field.onBlur();
                                        trigger(field.name);
                                    }}
                                />
                            );
                        }}
                    />
                </Box>
                <Box marginBottom={5}>
                    <Controller
                        name="password"
                        defaultValue=""
                        control={control}
                        render={({field, fieldState}) => (
                            <TextInput
                                type="password"
                                {...field}
                                data-testid="user-password"
                                label={t("common.password")}
                                required={true}
                                error={fieldState.error?.message}
                                onBlur={submitPreview}
                            />
                        )}
                    />
                    <Text mt={3} whiteSpace="pre-line" variant="caption" color="grey.dark">
                        {t("settings.password.yourPassword")}
                    </Text>
                    <Box as="ul" pl={4}>
                        <Box as="li">
                            <Text my={1} whiteSpace="pre-line" variant="caption" color="grey.dark">
                                {t("settings.password.validationRuleOne")}
                            </Text>
                        </Box>
                        <Box as="li">
                            <Text my={1} whiteSpace="pre-line" variant="caption" color="grey.dark">
                                {t("settings.password.validationRuleTwo")}
                            </Text>
                        </Box>
                        <Box as="li">
                            <Text my={1} whiteSpace="pre-line" variant="caption" color="grey.dark">
                                {t("settings.password.validationRuleThree")}
                            </Text>
                        </Box>
                        <Box as="li">
                            <Text my={1} whiteSpace="pre-line" variant="caption" color="grey.dark">
                                {t("settings.password.validationRuleFour")}
                            </Text>
                        </Box>
                    </Box>
                </Box>

                <HorizontalLine mt={6} />
                <Flex alignItems="center">
                    <Text flexGrow={1}>{t("flow.createAccountForm.alreadyHaveAnAccount")}</Text>
                    <Link onClick={onLoginRedirect} data-testid="flow-login-button">
                        {t("common.login")}
                    </Link>
                </Flex>
            </Box>

            <HorizontalLine mt={6} />
            <Flex mt={3} justifyContent="flex-end">
                <Button
                    type="button"
                    onClick={handleSubmit(submitFrom)}
                    loading={isSubmitting}
                    disabled={!canSubmit}
                    data-testid="create-account-continue"
                >
                    {t("common.continue")}
                </Button>
            </Flex>
        </Box>
    );

    async function submitPreview() {
        await submit(true);
    }

    async function submitFrom() {
        await submit(false);
    }

    async function submit(previewOnly: boolean) {
        clearErrors();
        const isValidForm = await trigger();
        if (!isValidForm) {
            return;
        }
        const formData = methods.getValues();
        try {
            await apiService.post(`/auth/registration-check/`, formData, {
                apiVersion: null,
                basePath: null,
            });
            if (previewOnly) {
                // We don't want to create the account, just check if it's possible
                return;
            }
            onSubmit(formData);
        } catch (httpError: unknown) {
            const responseJson =
                (typeof httpError === "object" &&
                    httpError &&
                    "json" in httpError &&
                    typeof httpError.json === "function" &&
                    (await httpError.json())) ||
                httpError;
            Object.keys(responseJson).forEach((key) => {
                if (key in formData) {
                    const data = responseJson[key];
                    if (
                        typeof data === "object" &&
                        data &&
                        "code" in data &&
                        Array.isArray(data.code)
                    ) {
                        const [firstCode] = data.code;
                        if (typeof firstCode === "string" && firstCode.length > 0) {
                            const type = firstCode;
                            setError(key as keyof CreateAccountPayload, {
                                type,
                                message: getMessageFromErrorCode(type) ?? t("common.unknownError"),
                            });
                            return;
                        }
                    }
                    setError(key as keyof CreateAccountPayload, {
                        type: "custom",
                        message: t("common.unknownError"),
                    });
                } else {
                    Logger.error(`Unknown error key ${key} in response`);
                }
            });
        }
    }
}
