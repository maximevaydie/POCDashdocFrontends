import {Logger} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    Modal,
    Select,
    Text,
    theme,
    toast,
    SelectOption,
} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {AccountType} from "dashdoc-utils";
import {Field, Form, Formik, FormikErrors, FormikProps} from "formik";
import React, {FunctionComponent, useState} from "react";

import {Api} from "../Api";

import {ModerationSetAccountTypeProps} from "./moderation-set-account-type";

interface AccountTypeForm {
    account_type: AccountType;
}

type ModerationAccountTypeModalProps = ModerationSetAccountTypeProps & {onClose: () => void};

export const ModerationAccountTypeModal: FunctionComponent<ModerationAccountTypeModalProps> = ({
    companyPk,
    companyName,
    accountType,
    chargebeeStatus,
    onClose,
}) => {
    const [loading, setLoading] = useState<boolean>(false);

    const UNDEFINED_VALUE = "Undefined";

    const ACCOUNT_TYPE_DICT: {[key: string]: string} = {
        subscribed: "Subscribed",
        invited: "Invited",
        demo: "Demo",
    };

    const ACCOUNT_TYPE_OPTIONS = Object.keys(ACCOUNT_TYPE_DICT).map((key) => {
        return {label: ACCOUNT_TYPE_DICT[key], value: key};
    });

    const validateChargebee = (selectedAccountType: AccountType) => {
        if (
            (selectedAccountType === "subscribed" && chargebeeStatus !== "active") ||
            (selectedAccountType === "demo" && chargebeeStatus !== "test_account")
        ) {
            return false;
        }
        return true;
    };

    const handleFormSubmit = async (values: AccountTypeForm) => {
        try {
            setLoading(true);
            await Api.CompaniesAdmin.patch(companyPk, {data: values}, {apiVersion: "web"});
            setLoading(false);
            onClose();
            toast.success("Account type updated");
            window.location.reload();
        } catch (error) {
            Logger.error(error);
            toast.error("Couldn't update account type");
        }
    };

    const validateValues = (values: AccountTypeForm) => {
        let errors: FormikErrors<AccountTypeForm> = {};

        if (!values.account_type) {
            errors.account_type = "This field is mandatory";
        }

        return errors;
    };

    return (
        <Modal
            title={companyName}
            id="account_type_modal"
            data-testid="account-type-modal"
            onClose={onClose}
            mainButton={null}
            secondaryButton={null}
        >
            <Formik
                initialValues={{account_type: accountType} as AccountTypeForm}
                onSubmit={handleFormSubmit}
                validate={validateValues}
                validateOnBlur={false}
                validateOnChange={false}
                render={(formikProps: FormikProps<AccountTypeForm>) => {
                    return (
                        <Form>
                            <Box className="row">
                                <FormGroup
                                    mandatory
                                    label={"Account type"}
                                    error={formikProps.errors.account_type}
                                >
                                    <Field
                                        isClearable={false}
                                        isSearchable={false}
                                        name="account_type"
                                        component={Select}
                                        value={
                                            formikProps.values.account_type
                                                ? {
                                                      value: formikProps.values.account_type,
                                                      label: ACCOUNT_TYPE_DICT[
                                                          formikProps.values.account_type
                                                      ],
                                                  }
                                                : null
                                        }
                                        onChange={(option: SelectOption) =>
                                            formikProps.setFieldValue(
                                                "account_type",
                                                option?.value ?? null
                                            )
                                        }
                                        options={ACCOUNT_TYPE_OPTIONS}
                                    />
                                </FormGroup>
                            </Box>
                            {accountType !== formikProps.values.account_type && (
                                <Flex flex={1} flexDirection="column">
                                    <Box flex={1} my={3} px={3}>
                                        <Text theme={theme}>
                                            Chargebee status:
                                            <b>&nbsp;{chargebeeStatus || UNDEFINED_VALUE}</b>
                                            &nbsp;
                                            {validateChargebee(formikProps.values.account_type) ? (
                                                <Icon
                                                    name={"check"}
                                                    color={theme.colors.blue.default}
                                                />
                                            ) : (
                                                <Icon
                                                    name={"close"}
                                                    color={theme.colors.yellow.dark}
                                                />
                                            )}
                                        </Text>
                                    </Box>
                                </Flex>
                            )}
                            <Button
                                css={{float: "right"}}
                                type="submit"
                                disabled={loading}
                                data-testid="edit-account-type-modal"
                            >
                                Save
                            </Button>
                        </Form>
                    );
                }}
            />
        </Modal>
    );
};
