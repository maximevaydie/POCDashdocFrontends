import {
    fetchDeleteManager,
    fetchInviteManager,
    fetchUpdateManager,
    getErrorMessagesFromServerError,
    managerService,
} from "@dashdoc/web-common";
import {
    SUPPORTED_LOCALES_OPTIONS,
    getCountryValidLocale,
    localeService,
    t,
} from "@dashdoc/web-core";
import {Flex, Icon, Modal, Select, SelectOption, Text, TextInput} from "@dashdoc/web-ui";
import {FormGroup} from "@dashdoc/web-ui";
import {Usage, ManagerRole} from "dashdoc-utils";
import {Field, Form, Formik, FormikErrors, FormikHelpers, FormikProps} from "formik";
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {ImpactOnBillingCallout} from "app/features/settings/ImpactOnBillingCallout";
import {RootState} from "app/redux/reducers/index";

interface ManagerInvite {
    first_name: string;
    last_name: string;
    email: string;
    language: string;
    role: ManagerRole;
}

type Props = {
    companyCountry: string;
    onClose: () => void;
    usage: Usage | null;
    managerPk: number | null; // null if invite
};

export function AddEditManagerModal({managerPk, companyCountry, onClose, usage}: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();
    const invite = managerPk === null;

    const manager = useSelector((state: RootState) =>
        invite ? undefined : state.entities.managers?.[managerPk]
    );

    const handleSubmit = async (
        values: ManagerInvite,
        {setErrors}: FormikHelpers<ManagerInvite>
    ) => {
        try {
            setIsSubmitting(true);
            if (invite) {
                await dispatch(fetchInviteManager(values));
            } else {
                await dispatch(fetchUpdateManager(managerPk, values));
            }
            setIsSubmitting(false);
            onClose();
        } catch (errors) {
            getErrorMessagesFromServerError(errors).then(setErrors);
            setIsSubmitting(false);
        }
    };

    const handleRemoveManagerClick = async () => {
        if (invite) {
            return;
        }
        const yes = confirm(t("settings.confirmDeleteUser"));
        if (!yes) {
            return;
        }
        setIsDeleting(true);

        try {
            await dispatch(fetchDeleteManager(managerPk));
            setIsDeleting(false);
            onClose();
        } catch (e) {
            setIsDeleting(false);
        }
    };

    const getRoleOptions = () => {
        return Object.entries(managerService.getRoleLabels(false /* includeGroupViewAdmin */)).map(
            (entry) => ({
                label: entry[1],
                value: entry[0],
            })
        );
    };

    const _renderContent = () => {
        return (
            <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={{
                    email: "",
                    first_name: "",
                    last_name: "",
                    language: getCountryValidLocale(companyCountry),
                    role: manager?.role ?? ManagerRole.User,
                }}
                validate={(values: ManagerInvite) => {
                    let errors: FormikErrors<ManagerInvite> = {};

                    if (invite) {
                        if (!values.email) {
                            errors.email = t("common.mandatoryField");
                        }
                        if (!values.last_name) {
                            errors.last_name = t("common.mandatoryField");
                        }
                    }

                    return errors;
                }}
                onSubmit={handleSubmit}
            >
                {({errors, values, setFieldValue}: FormikProps<ManagerInvite>) => (
                    <Form id="add-edit-manager-form">
                        {invite && (
                            <>
                                <ImpactOnBillingCallout usage={usage} />
                                <TextInput
                                    name="first_name"
                                    value={values.first_name}
                                    onChange={(value: string) => {
                                        setFieldValue("first_name", value);
                                    }}
                                    label={t("settings.firstNameLabel")}
                                    error={errors.first_name}
                                    placeholder="Ex: Jean"
                                    data-testid="add-edit-manager-modal-first-name"
                                    mb={2}
                                />
                                <TextInput
                                    mb={2}
                                    name="last_name"
                                    value={values.last_name}
                                    onChange={(value: string) => {
                                        setFieldValue("last_name", value);
                                    }}
                                    label={t("settings.lastNameLabel")}
                                    error={errors.last_name}
                                    required
                                    placeholder="Ex: Martin"
                                    data-testid="add-edit-manager-modal-last-name"
                                />
                                <TextInput
                                    mb={2}
                                    type="email"
                                    name="email"
                                    value={values.email}
                                    onChange={(value: string) => {
                                        setFieldValue("email", value);
                                    }}
                                    label={t("common.email")}
                                    error={errors.email}
                                    required
                                    placeholder="Ex: email@example.com"
                                    data-testid="add-edit-manager-modal-email"
                                />
                                <FormGroup>
                                    <Select
                                        label={t("settings.language")}
                                        error={errors.language}
                                        isSearchable={true}
                                        options={SUPPORTED_LOCALES_OPTIONS}
                                        value={localeService.getLocaleOption(values.language)}
                                        onChange={(language: SelectOption<string>) => {
                                            setFieldValue("language", language.value);
                                        }}
                                        data-testid="add-edit-manager-modal-language"
                                    />
                                </FormGroup>
                            </>
                        )}
                        <Field
                            data-testid="add-edit-manager-modal-role"
                            component={Select}
                            label={t("settings.roleLabel")}
                            onChange={(role: {value: ManagerRole; label: string}) =>
                                setFieldValue("role", role.value)
                            }
                            value={{
                                value: values.role,
                                label: managerService.getRoleLabels()[values.role],
                            }}
                            options={getRoleOptions()}
                            placeholder={t("settings.chooseRolePlaceholder")}
                            isClearable={false}
                        />
                        <Flex mt={2}>
                            {values.role === "admin" && (
                                <Text>
                                    <b>{t("settings.adminRole")}</b> :{" "}
                                    {t("settings.adminRoleDescription")}
                                </Text>
                            )}
                            {values.role === "user" && (
                                <Text>
                                    <b>{t("common.user")}</b> : {t("settings.userRoleDescription")}
                                </Text>
                            )}
                            {values.role === "readonly" && (
                                <Text>
                                    <b>{t("settings.readOnlyRole")}</b> :{" "}
                                    {t("settings.readOnlyRoleDescription")}
                                </Text>
                            )}
                        </Flex>
                    </Form>
                )}
            </Formik>
        );
    };

    let title = t("common.loading");
    if (invite) {
        title = t("settings.inviteUser");
    } else if (manager) {
        title = `${t("common.user")} : ${manager.user.first_name} ${manager.user.last_name}`;
    }

    return (
        <Modal
            title={title}
            onClose={onClose}
            id="add-edit-manager-modal"
            data-testid="add-edit-manager-modal"
            secondaryButton={
                invite
                    ? undefined
                    : {
                          children: (
                              <>
                                  <Icon name="bin" />
                                  &nbsp;{t("settings.deleteUser")}
                              </>
                          ),
                          onClick: handleRemoveManagerClick,
                          severity: "danger",
                          disabled: isDeleting,
                          "data-testid": "add-edit-manager-modal-delete",
                      }
            }
            mainButton={{
                children: invite ? t("common.send") : t("common.save"),
                type: "submit",
                disabled: isSubmitting,
                "data-testid": "add-edit-manager-modal-save",
                form: "add-edit-manager-form",
            }}
        >
            {_renderContent()}
        </Modal>
    );
}
