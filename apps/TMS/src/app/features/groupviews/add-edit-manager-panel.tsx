import {apiService, getConnectedCompany} from "@dashdoc/web-common";
import {
    SUPPORTED_LOCALES_OPTIONS,
    getCountryValidLocale,
    localeService,
    t,
} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    ClickableUpdateRegion,
    Flex,
    FloatingPanelWithValidationButtons,
    Select,
    SwitchInput,
    SelectOption,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import {ManagerRole, useToggle, yup} from "dashdoc-utils";
import {Form, FormikProvider, useFormik} from "formik";
import React, {FunctionComponent, useState} from "react";
import {useSelector} from "react-redux";

import {ManagerRoleBadge} from "app/features/groupviews/badges";
import {EditManagerRolesModal} from "app/features/groupviews/edit-manager-roles-modal";
import {CompanyRole, RowManager} from "app/screens/group-views/ManagersScreen";

interface ManagerInvite {
    first_name: string;
    last_name: string;
    email: string;
    language: string;
    is_group_admin: boolean;
    company_roles: CompanyRole[];
}

type AddEditManagerPanelProps = {
    manager: RowManager | null;
    defaultCompanyRoles: CompanyRole[];
    onSubmit: () => void;
    onClose: () => void;
};

export const AddEditManagerPanel: FunctionComponent<AddEditManagerPanelProps> = ({
    manager,
    defaultCompanyRoles,
    onSubmit,
    onClose,
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const connectedCompany = useSelector(getConnectedCompany);
    const [isEditRolesModalOpen, openEditRolesModal, closeEditRolesModal] = useToggle();

    const handleSubmit = async (values: ManagerInvite) => {
        setIsSubmitting(true);
        if (!manager) {
            await apiService.post("/groupviews/managers/invite/", values, {
                apiVersion: "web",
            });
        } else {
            await apiService.patch(`/groupviews/managers/${manager.pk}/`, values, {
                apiVersion: "web",
            });
        }
        setIsSubmitting(false);
        onSubmit();
        onClose();
    };

    const formik = useFormik({
        initialValues: {
            first_name: manager?.first_name ?? "",
            last_name: manager?.last_name ?? "",
            email: manager?.email ?? "",
            language:
                manager?.language ?? getCountryValidLocale(connectedCompany?.country ?? "EN"),
            is_group_admin: manager?.is_group_admin ?? false,
            company_roles: manager ? manager.company_roles : defaultCompanyRoles,
        },
        onSubmit: handleSubmit,
        validationSchema: yup.object().shape({
            first_name: yup.string().required(t("common.mandatoryField")),
            last_name: yup.string().required(t("common.mandatoryField")),
            email: yup.string().required(t("common.mandatoryField")),
            language: yup.string().required(t("common.mandatoryField")),
            is_group_admin: yup.bool(),
            company_roles: yup
                .array()
                .of(
                    yup.object().shape({
                        company_pk: yup.number().required(),
                        company_name: yup.string(),
                        role: yup.string().nullable(),
                    })
                )
                .when("is_group_admin", {
                    is: (is_group_admin: boolean) => is_group_admin === false,
                    then: yup
                        .array()
                        .compact((cr) => cr.role == null)
                        .min(1, t("common.mandatoryField")),
                    otherwise: undefined,
                }),
        }),
        validateOnBlur: false,
        validateOnChange: false,
    });

    const getAccessDetails = () => {
        if (formik.values.is_group_admin == true) {
            return <ManagerRoleBadge role={ManagerRole.GroupViewAdmin} />;
        }

        let badgesPerAccessLevel = {
            admin: [],
            user: [],
            readonly: [],
        };

        const rolesNotNull = formik.values.company_roles.filter((cr) => cr.role != null);
        for (const companyRole of rolesNotNull) {
            // @ts-ignore because `null` roles are filtered just above
            badgesPerAccessLevel[companyRole.role].push(
                <ManagerRoleBadge
                    key={companyRole.company_pk}
                    // @ts-ignore because `null` roles are filtered just above
                    role={companyRole.role}
                    companyName={companyRole.company_name}
                    mb={2}
                />
            );
        }

        return (
            <ClickableUpdateRegion
                clickable
                onClick={openEditRolesModal}
                data-testid="company-roles-update-region"
            >
                <Text fontWeight="bold">{t("settings.adminRole")}</Text>
                {badgesPerAccessLevel.admin}
                <Text fontWeight="bold">{t("settings.userRole")}</Text>
                {badgesPerAccessLevel.user}
                <Text fontWeight="bold">{t("settings.readOnlyRole")}</Text>
                {badgesPerAccessLevel.readonly}
            </ClickableUpdateRegion>
        );
    };

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={manager ? t("users.modifyInformation") : t("users.invite")}
            mainButton={{
                type: "submit",
                form: "add-edit-manager-from-groupview-form",
                disabled: isSubmitting,
            }}
        >
            <FormikProvider value={formik}>
                <Form id="add-edit-manager-from-groupview-form">
                    <Flex flexDirection="column" justifyContent="space-between">
                        <Box>
                            <TextInput
                                mb={4}
                                required
                                autoFocus
                                data-testid="input-manager-first-name"
                                label={t("settings.firstNameLabel")}
                                name="first_name"
                                value={formik.values.first_name}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                            />
                            <TextInput
                                mb={4}
                                required
                                data-testid="input-manager-last-name"
                                label={t("settings.lastNameLabel")}
                                name="last_name"
                                value={formik.values.last_name}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                                error={formik.errors.last_name as string}
                            />
                            <TextInput
                                mb={4}
                                required
                                data-testid="input-manager-email"
                                type="email"
                                label={t("common.email")}
                                name="email"
                                value={formik.values.email}
                                onChange={(_, e) => {
                                    formik.handleChange(e);
                                }}
                                error={formik.errors.email as string}
                            />

                            <Select
                                label={t("settings.language")}
                                error={formik.errors.language as string}
                                isSearchable={true}
                                options={SUPPORTED_LOCALES_OPTIONS}
                                value={localeService.getLocaleOption(formik.values.language)}
                                onChange={(language: SelectOption<string>) => {
                                    formik.setFieldValue("language", language.value);
                                }}
                                data-testid="input-manager-language"
                            />

                            <Box>
                                <Text variant="captionBold" mt={5} mb={3}>
                                    {t("settings.groupAdminRole")}
                                </Text>

                                <SwitchInput
                                    data-testid="input-manager-is-group-admin"
                                    value={formik.values.is_group_admin}
                                    onChange={(value) => {
                                        formik.setFieldValue("is_group_admin", value);
                                        formik.setFieldTouched("is_group_admin");
                                    }}
                                    labelRight={t("settings.groupAdminRole")}
                                />
                                <Callout variant="informative" mt={2}>
                                    <Flex alignItems="center">
                                        {t("settings.groupAdminRoleDescription")}
                                    </Flex>
                                </Callout>
                            </Box>

                            <Box>
                                <Text variant="captionBold" mt={5} mb={3}>
                                    {t("common.access")}
                                </Text>
                                {formik.errors.company_roles &&
                                    typeof formik.errors.company_roles === "string" && (
                                        <Text color="red.default">
                                            {formik.errors.company_roles}
                                        </Text>
                                    )}
                                {getAccessDetails()}
                            </Box>
                        </Box>
                    </Flex>
                </Form>

                {isEditRolesModalOpen && (
                    <EditManagerRolesModal
                        roles={formik.values.company_roles}
                        onClose={closeEditRolesModal}
                        onClick={(company_roles) => {
                            formik.setFieldValue("company_roles", company_roles);
                            formik.setFieldTouched("company_roles");
                            closeEditRolesModal();
                        }}
                    />
                )}
            </FormikProvider>
        </FloatingPanelWithValidationButtons>
    );
};
