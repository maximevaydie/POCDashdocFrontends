import {
    contactIsInvitable,
    LocalizedPhoneNumberInput,
    apiService,
    getConnectedCompany,
    PartnerContactOutput,
    getContactInvitationStatus,
} from "@dashdoc/web-common";
import {
    SUPPORTED_LOCALES_OPTIONS,
    getCountryValidLocale,
    localeService,
    t,
} from "@dashdoc/web-core";
import {
    AsyncSelect,
    Callout,
    Checkbox,
    Flex,
    FormGroup,
    Modal,
    Select,
    SelectOption,
    Text,
    TextInput,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {
    Company,
    Contact,
    ContactJobKey,
    SimpleContactJob,
    SlimCompanyForInvitation,
    yup,
} from "dashdoc-utils";
import {Form, Formik, FormikProps} from "formik";
import deepMerge from "lodash.merge";
import React, {useState} from "react";
import {Value} from "react-phone-number-input";

import {fetchAddContact, fetchInviteContact, fetchUpdateContact} from "app/redux/actions/contacts";
import {useDispatch, useSelector} from "app/redux/hooks";

import {ContactInvitationExplanation} from "./ContactInvitationExplanation";

export const getJobsSelectOptions: () => SelectOption<SimpleContactJob>[] = () => [
    {value: "dispatcher", label: t("contact.job.dispatcher")},
    {value: "company_manager", label: t("contact.job.companyManager")},
    {value: "biller", label: t("contact.job.biller")},
];

type Props = {
    contact?: Partial<Contact> | PartnerContactOutput;
    company?: SlimCompanyForInvitation;
    onSubmit?: (contact: Contact) => void;
    onClose: () => void;
};

export function AddContactModal(props: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inviteContactOnSave, setInviteContactOnSave] = useState(false);
    const connectedCompany = useSelector(getConnectedCompany);
    const dispatch = useDispatch();

    const handleSubmit = async (values: Contact) => {
        const submitFunction = props.contact?.uid
            ? fetchUpdateContact.bind(null, props.contact.uid)
            : fetchAddContact;
        setIsSubmitting(true);

        if (!values.jobs?.includes("biller")) {
            values.does_receive_reminder_emails = false;
            values.does_receive_share_emails = false;
        }

        let contact: Contact;
        try {
            contact = await dispatch(
                submitFunction({
                    ...values,
                    company: values.company.pk,
                })
            );
        } catch (error) {
            setIsSubmitting(false);
            return;
        }
        if (inviteContactOnSave) {
            await dispatch(fetchInviteContact(contact.uid));
        }
        props.onSubmit && props.onSubmit(contact);
        props.onClose();
        setIsSubmitting(false);
    };

    const searchCompanies = (input: string): Promise<Pick<Company, "pk" | "name">[]> =>
        new Promise((resolve, reject) => {
            apiService
                .get(`/companies/?text=${input}`, {apiVersion: "v4"})
                .then((response) => {
                    const options = response.results.map((company: Company) => {
                        return {pk: company.pk, name: company.name};
                    });
                    resolve(options);
                })
                .catch((error) => reject(error));
        });

    const getInitialValues = () => {
        const initialValues: any = {
            phone_number: "",
            does_receive_share_emails: true,
            does_receive_reminder_emails: true,
        };
        if (props.contact) {
            deepMerge(initialValues, props.contact, {
                company: props.contact?.company
                    ? {
                          pk: props.contact.company.pk,
                          name: props.contact.company.name,
                      }
                    : undefined,
            });
        }
        if (props.company) {
            deepMerge(initialValues, {
                company: {pk: props.company.pk, name: props.company.name},
            });
            if (props.company.country && !initialValues.language) {
                initialValues.language = getCountryValidLocale(props.company.country);
            }
        }
        return initialValues;
    };

    const _renderContent = () => {
        const validationSchema = yup.object().shape({
            company: yup.object().required(t("common.mandatoryField")),
            last_name: yup.string().required(t("common.mandatoryField")),
            phone_number: yup.string().phone(t("common.invalidPhoneNumber")),
        });

        const invitationStatus = getContactInvitationStatus(props.contact);

        return (
            <Formik
                validateOnChange={false}
                validateOnBlur={false}
                initialValues={getInitialValues()}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({errors, setFieldValue, values}: FormikProps<Contact>) => (
                    <Form id="add-contact-form">
                        <Text variant="h1" mb={2}>
                            {t("common.general")}
                        </Text>
                        {!props.company && (
                            <FormGroup noCols={true}>
                                <AsyncSelect<{pk: number; name: string}>
                                    required
                                    label={t("common.company")}
                                    error={errors.company as string}
                                    placeholder={t("components.enterCompanyPlaceholder")}
                                    loadOptions={searchCompanies}
                                    defaultOptions={true}
                                    value={values.company}
                                    onChange={(company: Company) =>
                                        setFieldValue("company", company)
                                    }
                                    getOptionValue={({pk}) => pk.toString()}
                                    getOptionLabel={({name}) => name}
                                />
                            </FormGroup>
                        )}

                        <FormGroup>
                            <TextInput
                                type="text"
                                placeholder="Ex: Jean"
                                label={t("settings.firstNameLabel")}
                                error={errors.first_name}
                                data-testid="input-first-name"
                                value={values.first_name}
                                onChange={(first_name: string) =>
                                    setFieldValue("first_name", first_name)
                                }
                            />
                        </FormGroup>
                        <FormGroup>
                            <TextInput
                                required
                                label={t("settings.lastNameLabel")}
                                error={errors.last_name}
                                type="text"
                                placeholder="Ex: Masson"
                                data-testid="input-last-name"
                                value={values.last_name}
                                onChange={(last_name: string) =>
                                    setFieldValue("last_name", last_name)
                                }
                            />
                        </FormGroup>
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
                            />
                        </FormGroup>
                        <Text variant="h1" mt={4} mb={2}>
                            {t("components.contact")}
                        </Text>

                        <FormGroup>
                            <TextInput
                                type="email"
                                error={errors.email}
                                label={t("common.email")}
                                placeholder="Ex: jean@exemple.com"
                                data-testid="input-email"
                                value={values.email}
                                disabled={invitationStatus === "registered"}
                                onChange={(email: string) => {
                                    setFieldValue("email", email);
                                    if (
                                        email &&
                                        props.company?.can_invite_to &&
                                        !inviteContactOnSave
                                    ) {
                                        setInviteContactOnSave(true);
                                    }
                                    if (
                                        !email &&
                                        props.company?.can_invite_to &&
                                        inviteContactOnSave
                                    ) {
                                        setInviteContactOnSave(false);
                                    }
                                }}
                            />
                        </FormGroup>

                        <FormGroup>
                            <LocalizedPhoneNumberInput
                                data-testid="input-phone-number"
                                value={values.phone_number as Value}
                                onChange={(phoneNumber?: Value) => {
                                    setFieldValue("phone_number", phoneNumber);
                                }}
                                error={errors.phone_number}
                                country={props.company?.country ?? connectedCompany?.country}
                            />
                        </FormGroup>
                        <Text variant="h1" mt={4} mb={2}>
                            {t("common.role")}
                        </Text>

                        <Select
                            label={t("contact.jobs")}
                            isMulti={true}
                            isSearchable={false}
                            options={getJobsSelectOptions()}
                            data-testid="select-jobs"
                            value={
                                values.jobs &&
                                getJobsSelectOptions().filter((option) =>
                                    // @ts-ignore
                                    values.jobs.includes(option.value)
                                )
                            }
                            onChange={(values: SelectOption<ContactJobKey>[]) => {
                                setFieldValue(
                                    "jobs",
                                    values.map((x) => x.value)
                                );
                            }}
                            error={errors.jobs ? String(errors.jobs) : false}
                        />
                        {values.jobs?.includes("biller") && (
                            <Flex flexDirection="column" css={{gap: "16px"}}>
                                <Text variant="h1" mt={4}>
                                    {t("components.notificationPreferences")}
                                </Text>
                                <Text color="grey.dark">
                                    {t("components.notificationPreferencesExplanation")}
                                </Text>
                                <Checkbox
                                    label={t("components.sharingContact")}
                                    checked={values.does_receive_share_emails}
                                    onChange={(checked: boolean) =>
                                        setFieldValue("does_receive_share_emails", checked)
                                    }
                                />
                                <Checkbox
                                    label={t("components.RemindingContact")}
                                    checked={values.does_receive_reminder_emails}
                                    onChange={(checked: boolean) =>
                                        setFieldValue("does_receive_reminder_emails", checked)
                                    }
                                />
                            </Flex>
                        )}

                        {(!props.contact?.uid ||
                            contactIsInvitable(props.contact, props.company)) && (
                            <>
                                <Text variant="h1" mt={4} mb={2}>
                                    {t("addContactModal.invitation")}
                                </Text>
                                {props.company && !props.company.can_invite_to && (
                                    <Callout>
                                        <Text variant="caption">
                                            <ContactInvitationExplanation
                                                company={props.company}
                                            />
                                        </Text>
                                    </Callout>
                                )}
                                {props.company?.can_invite_to && (
                                    <FormGroup>
                                        <TooltipWrapper
                                            hidden={!!values.email}
                                            content={t(
                                                "addContactModal.inviteContactOnSaveTooltip"
                                            )}
                                        >
                                            <Checkbox
                                                checked={inviteContactOnSave}
                                                label={t("addContactModal.inviteContactOnSave")}
                                                disabled={!values.email}
                                                data-testid="invite-contact-on-save-checkbox"
                                                onClick={() => {
                                                    setInviteContactOnSave(!inviteContactOnSave);
                                                }}
                                            />
                                        </TooltipWrapper>
                                    </FormGroup>
                                )}
                            </>
                        )}
                    </Form>
                )}
            </Formik>
        );
    };

    const getModalTitle = () => {
        if (props.contact?.uid) {
            return t("components.editContact");
        } else if (props.company) {
            return t("components.addContactCompany", {
                company: props.company.name,
            });
        }
        return t("transportsForm.addContact", undefined, {capitalize: true});
    };

    return (
        <Modal
            title={getModalTitle()}
            id="add-contact-modal"
            onClose={props.onClose}
            data-testid="add-contact-modal"
            secondaryButton={{
                disabled: isSubmitting,
                "data-testid": "contact-modal-cancel-button",
            }}
            mainButton={{
                children: inviteContactOnSave
                    ? t("addContactModal.saveAndInvite")
                    : t("common.save"),
                type: "submit",
                disabled: isSubmitting,
                "data-testid": "contact-modal-save-button",
                form: "add-contact-form",
            }}
        >
            {_renderContent()}
        </Modal>
    );
}
