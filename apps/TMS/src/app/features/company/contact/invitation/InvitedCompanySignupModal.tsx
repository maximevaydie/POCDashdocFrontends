import {
    LocalizedPhoneNumberInput,
    fetchUpdateManager,
    getConnectedCompany,
    getConnectedManager,
    getErrorMessagesFromServerError,
    useDispatch,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    FiltersSelectOption,
    Modal,
    Select,
    SelectOption,
    SelectOptions,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {Settings, Persona, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {useMemo} from "react";
import {Value} from "react-phone-number-input";

import {useSelector} from "app/redux/hooks";

interface ManagerForm {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    personas: SelectOptions<Persona>;
    password: string;
    // acceptTerms: boolean; To add later as it will replace completely the sign up form for invited contacts
}

type Props = {
    onFinished: () => void;
};

const getManagerPersonasOptions = (role?: Settings["default_role"]) => {
    const CARRIER_MANAGER_PERSONA_OPTIONS: Array<{label: string; value: Persona}> = [
        {value: "create_orders", label: t("persona.createOrders")},
        {value: "planning", label: t("persona.planning")},
        {value: "send_orders", label: t("persona.sendOrders")},
        {value: "check_transports_progress", label: t("persona.checkTransportsProgress")},
        {value: "invoicing", label: t("persona.invoicing")},
        {value: "supervision", label: t("persona.supervision")},
    ];

    const SHIPPER_MANAGER_PERSONA_OPTIONS: Array<{label: string; value: Persona}> = [
        {value: "create_orders", label: t("persona.createOrders")},
        {value: "planning", label: t("persona.planning")},
        {value: "assigning_to_carriers", label: t("persona.assigningToCarriers")},
        {value: "check_transports_progress", label: t("persona.checkTransportsProgress")},
        {value: "pre_invoicing", label: t("persona.preInvoicing")},
        {value: "invoice_verification", label: t("persona.invoiceVerification")},
        {value: "supervision", label: t("persona.supervision")},
    ];

    const CARRIER_AND_SHIPPER_MANAGER_PERSONA_OPTIONS: Array<{label: string; value: Persona}> = [
        {value: "create_orders", label: t("persona.createOrders")},
        {value: "planning", label: t("persona.planning")},
        {value: "send_orders", label: t("persona.sendOrders")},
        {value: "assigning_to_carriers", label: t("persona.assigningToCarriers")},
        {value: "check_transports_progress", label: t("persona.checkTransportsProgress")},
        {value: "pre_invoicing", label: t("persona.preInvoicing")},
        {value: "invoicing", label: t("persona.invoicing")},
        {value: "invoice_verification", label: t("persona.invoiceVerification")},
        {value: "supervision", label: t("persona.supervision")},
    ];

    if (role === "shipper") {
        return SHIPPER_MANAGER_PERSONA_OPTIONS;
    }
    if (role === "carrier") {
        return CARRIER_MANAGER_PERSONA_OPTIONS;
    }
    return CARRIER_AND_SHIPPER_MANAGER_PERSONA_OPTIONS;
};

export function InvitedCompanySignupModal(props: Props) {
    const dispatch = useDispatch();
    const manager = useSelector(getConnectedManager);
    const company = useSelector(getConnectedCompany);

    const displayCommercialMessage = () => {
        const role = company?.settings?.default_role;
        let message = null;

        switch (role) {
            case "carrier":
                message = t("components.finishSignupCarrier");
                break;
            case "shipper":
                message = t("components.finishSignupShipper");
                break;
            case "carrier_and_shipper":
                message = t("components.finishSignupShipperAndCarrier");
                break;
            default:
                break;
        }
        return message;
    };

    const managerPersonasOptions = getManagerPersonasOptions(company?.settings?.default_role);

    const getInitialManagerPersonas = () => {
        if (!manager?.personas?.length) {
            return [];
        }

        return managerPersonasOptions.filter((option) => {
            // @ts-ignore
            return manager.personas.includes(option.value);
        });
    };

    const hasUsablePassword = useMemo(
        () => manager?.user.has_usable_password,
        [manager?.user.has_usable_password]
    );

    const formik = useFormik({
        initialValues: {
            first_name: manager?.user.first_name ?? "",
            last_name: manager?.user.last_name ?? "",
            email: manager?.user.email ?? "",
            phone_number: "",
            personas: getInitialManagerPersonas(),
            // @ts-ignore
            password: undefined,
            // acceptTerms: false, To add later as it will replace completely the sign up form for invited contacts
        },
        validateOnChange: false,
        validateOnBlur: false,
        validationSchema: yup.object().shape({
            first_name: yup.string(),
            last_name: yup.string().required(t("common.mandatoryField")),
            phone_number: yup.string().phone(t("common.invalidPhoneNumber")),
            personas: yup.array().min(1, t("common.mandatoryField")),
            // @ts-ignore
            password: !hasUsablePassword
                ? yup
                      .string()
                      .required(t("common.mandatoryField"))
                      .min(6, t("common.passwordLengthError"))
                      .matches(/(?!^\d+$)^.+$/, t("common.passwordOnlyDigitsError"))
                      .commonPassword(t("common.passwordCommonError"))
                : null,
            // acceptTerms: yup.boolean().isTrue(), To add later as it will replace completely the sign up form for invited contacts
        }),
        onSubmit: async (values: ManagerForm): Promise<void> => {
            if (!manager) {
                return;
            }
            try {
                const personas = values.personas.map(
                    (option: SelectOption<Persona>) => option.value
                ) as Persona[];
                const data = {
                    user: {
                        first_name: values.first_name,
                        last_name: values.last_name,
                        password: values.password,
                        email: values.email,
                    },
                    personas: personas,
                    phone_number: values.phone_number,
                };
                await dispatch(fetchUpdateManager(manager.pk, data));
                props.onFinished();
            } catch (errors) {
                const serverErrors = await getErrorMessagesFromServerError(errors);
                formik.setErrors(serverErrors);
            }
        },
    });

    const showPassword = useMemo(() => !hasUsablePassword, [hasUsablePassword]);

    const form = (
        <Box>
            <FormikProvider value={formik}>
                <Form data-testid="finish-signup-form">
                    <Box mb={2}>
                        <TextInput
                            type="text"
                            data-testid="input-first-name"
                            label={t("settings.firstNameLabel")}
                            {...formik.getFieldProps("first_name")}
                            containerProps={{mt: 3}}
                            onChange={(_value, e) => {
                                formik.handleChange(e);
                            }}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextInput
                            type="text"
                            data-testid="input-last-name"
                            label={t("settings.lastNameLabel")}
                            {...formik.getFieldProps("last_name")}
                            containerProps={{mt: 3}}
                            onChange={(_value, e) => {
                                formik.handleChange(e);
                            }}
                            error={formik.touched.last_name && formik.errors.last_name}
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <Select
                            isMulti
                            isSearchable={false}
                            closeMenuOnSelect={false}
                            hideSelectedOptions={false}
                            components={{
                                Option: FiltersSelectOption,
                            }}
                            value={formik.values.personas}
                            onChange={(values: SelectOptions<Persona>) => {
                                formik.setFieldValue("personas", values);
                            }}
                            onBlur={() => formik.setFieldTouched("personas")}
                            label={t("common.personas")}
                            placeholder={t("common.personasPlaceholder")}
                            options={managerPersonasOptions}
                            error={
                                formik.touched.personas &&
                                (formik.errors.personas as unknown as string)
                            }
                            data-testid="select-personas"
                            required
                            styles={{
                                menu: (base) => ({
                                    ...base,
                                    zIndex: 2,
                                }),
                            }}
                        />
                    </Box>
                    <Box mb={2}>
                        <LocalizedPhoneNumberInput
                            data-testid="input-phone-number"
                            value={formik.values.phone_number as Value}
                            onChange={(phoneNumber?: Value) =>
                                formik.setFieldValue("phone_number", phoneNumber)
                            }
                            error={formik.errors.phone_number}
                            country={company?.country}
                        />
                    </Box>
                    <Box mb={2}>
                        <TextInput
                            disabled
                            type="email"
                            data-testid="input-email"
                            label={t("common.email")}
                            {...formik.getFieldProps("email")}
                        />
                    </Box>
                    {showPassword && (
                        <TooltipWrapper content={t("common.passwordValidation")}>
                            <Box mb={2}>
                                <TextInput
                                    type="password"
                                    data-testid="input-password"
                                    label={t("common.password")}
                                    {...formik.getFieldProps("password")}
                                    onChange={(_value, e) => {
                                        formik.handleChange(e);
                                    }}
                                    error={formik.touched.password && formik.errors.password}
                                    required
                                />
                            </Box>
                        </TooltipWrapper>
                    )}
                    {/*  To add later as it will replace completely the sign up form for invited contacts
                    <Checkbox
                        id="checkbox"
                        data-testid="accept-terms-input"
                        label="J'accepte les conditions générales d'utilisation et la charte de confidentialité de Dashdoc." // TODO: Translate me + add links
                        {...formik.getFieldProps("acceptTerms")}
                        onChange={(_value, e) => formik.handleChange(e)}
                        required
                    /> */}
                    <Callout>{t("components.finishSignupSettingsMessage")}</Callout>
                </Form>
            </FormikProvider>
        </Box>
    );

    return (
        <Modal
            id="finish-signup-modal"
            title={t("components.finishSignup")}
            mainButton={{
                children: t("common.save"),
                variant: "primary",
                onClick: formik.submitForm,
                disabled: formik.isSubmitting || formik.isValidating,
                "data-testid": "finish-signup-modal-save",
            }}
            secondaryButton={null}
        >
            <Text>{t("components.finishSignupWelcome")}</Text>
            <Text>
                {t("components.finishSignupInvitation", {
                    inviter: company?.managed_by_name || company?.name,
                })}
            </Text>
            <Text>{displayCommercialMessage()}</Text>
            <Box mt={3}>{form}</Box>
        </Modal>
    );
}
