import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Link, Text, TextInput} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {zodResolver} from "@hookform/resolvers/zod";
import React, {useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

export interface LoginPayload {
    username: string;
    password: string;
}

type Props = {
    onSubmit: (payload: LoginPayload) => Promise<void>;
    onCreateAccountRedirect: () => void;
};

export function LoginForm({onSubmit, onCreateAccountRedirect}: Props) {
    const validationSchema = z.object({
        username: z
            .string()
            .email(t("errors.email.invalid"))
            .nonempty(t("login.errors.email.empty")),
        password: z.string().nonempty(t("login.errors.password.empty")),
    });

    type InputFormType = z.infer<typeof validationSchema>;
    const [error, setError] = useState(false);

    const methods = useForm<InputFormType>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const {
        handleSubmit,
        control,
        trigger,
        formState: {isValid, isSubmitting},
    } = methods;

    return (
        <Box>
            <Flex
                flexDirection="column"
                justifyContent="space-between"
                maxWidth="400px"
                margin="auto"
            >
                <Box data-testid="flow-login-form">
                    <Text variant="h1" textAlign="center" my={4}>
                        {t("common.logIn")}
                    </Text>

                    <Controller
                        name="username"
                        control={control}
                        render={({field}) => (
                            <TextInput
                                type="email"
                                data-testid="login-email-input"
                                label={t("common.email")}
                                containerProps={{mt: 3}}
                                {...field}
                                required
                            />
                        )}
                    />

                    <Controller
                        name="password"
                        control={control}
                        render={({field}) => (
                            <TextInput
                                type="password"
                                data-testid="login-password-input"
                                label={t("common.password")}
                                containerProps={{mt: 3}}
                                {...field}
                                required
                            />
                        )}
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
                </Box>

                <HorizontalLine mt={6} />
                <Flex alignItems="center">
                    <Text flexGrow={1}>{t("flow.login.noExistingAccount")}</Text>
                    <Link onClick={onCreateAccountRedirect}>{t("common.createAccount")}</Link>
                </Flex>
            </Flex>

            <HorizontalLine mt={6} />
            <Flex mt={3} justifyContent="flex-end">
                <Button
                    type="button"
                    onClick={handleSubmit(submit)}
                    disabled={!isValid || isSubmitting}
                    data-testid="flow-login-form-validate"
                >
                    {t("common.login")}
                </Button>
            </Flex>
        </Box>
    );

    async function submit() {
        try {
            const isValidForm = await trigger(); // manually trigger validation
            if (!isValidForm) {
                return; // if the form is not valid, don't submit the form
            }
            let payload = methods.getValues();
            await onSubmit(payload);
        } catch (e) {
            setError(true);
        }
    }
}
