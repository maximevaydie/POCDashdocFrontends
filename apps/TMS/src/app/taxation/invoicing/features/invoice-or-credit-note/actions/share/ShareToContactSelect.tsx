import {utilsService} from "@dashdoc/web-common";
import {fetchCompany} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {AsyncCreatableSelect, Flex, Icon, SelectOption, Text} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Company, Contact} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {FormatOptionLabelMeta, StylesConfig} from "react-select";

import {useDispatch, useSelector} from "app/redux/hooks";

export type ContactSelectOption = SelectOption<string> & {
    isValidEmail: boolean;
    __isNew__?: boolean;
};

const emailValidityBasedStyle = (styles: any, {data}: {data: ContactSelectOption}) => {
    const color = data.isValidEmail ? theme.colors.blue : theme.colors.red;
    return {
        ...styles,
        color: color.default,
        backgroundColor: color.ultralight,
    };
};

const ContactAsyncCreatableSelectStyle: StylesConfig<ContactSelectOption, true> = {
    multiValue: emailValidityBasedStyle,
    multiValueLabel: emailValidityBasedStyle,
    multiValueRemove: (styles, {data}) => {
        const baseStyle = emailValidityBasedStyle(styles, {data});
        const color = data.isValidEmail ? theme.colors.blue : theme.colors.red;
        return {
            ...baseStyle,
            ":hover": {
                backgroundColor: color.dark,
                color: "white",
            },
        };
    },
};
const CircleIcon = styled(Icon)`
    border-radius: 999px;
    background-color: ${theme.colors.blue.default};
`;

const formatOptionLabel = (
    contactOption: ContactSelectOption,
    {context}: FormatOptionLabelMeta<ContactSelectOption, true>
) => {
    if (contactOption.__isNew__) {
        if (context === "value") {
            return contactOption.label;
        } else {
            return (
                <Flex alignItems="center" style={{gap: "8px"}}>
                    <CircleIcon name="add" color="white" strokeWidth={3} scale={0.5} />
                    <Text color="blue.default">
                        {t("shareInvoice.addEmail", {emailAddress: contactOption.label})}
                    </Text>
                </Flex>
            );
        }
    } else {
        const email = `(${contactOption.value || t("shareInvoice.contactWithoutEmail")})`;
        if (context === "value") {
            return `${contactOption.label} ${email}`;
        } else {
            return (
                <Text>
                    {contactOption.label}{" "}
                    <Text as="span" color="grey.dark">
                        {email}
                    </Text>
                </Text>
            );
        }
    }
};
export function ShareToContactsSelect({
    debtorCompanyId,
    emails,
    onChange,
    error,
    emailType,
}: {
    debtorCompanyId: number;
    emails: ContactSelectOption[];
    onChange: (emails: ContactSelectOption[] | null) => void;
    error: string | null;
    emailType: "share" | "reminder";
}) {
    const [isDefaultContact, setIsDefaultContact] = useState<boolean | null>(null);
    const dispatch = useDispatch();
    const debtorCompany: Company | undefined = useSelector(
        (state) => state.companies.items[debtorCompanyId]
    );
    useEffect(() => {
        if (!debtorCompany) {
            dispatch(fetchCompany(debtorCompanyId.toString()));
        }
        if (allDebtorContactSelectOptions?.length == 1 && !isDefaultContact) {
            onChange([
                {
                    ...allDebtorContactSelectOptions[0],
                },
            ]);
            setIsDefaultContact(true);
        }
    }, [debtorCompanyId, debtorCompany]);

    const allDebtorContacts: Contact[] | undefined = debtorCompany?.contacts?.filter(
        (contact: Contact) =>
            contact.jobs?.includes("biller") &&
            ((emailType == "share" && contact.does_receive_share_emails) ||
                (emailType == "reminder" && contact.does_receive_reminder_emails))
    );

    const allDebtorContactSelectOptions: ContactSelectOption[] | undefined =
        allDebtorContacts?.map((contact: Contact): ContactSelectOption => {
            const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
            const email = contact.email || t("shareInvoice.contactWithoutEmail");
            const isValidEmail = utilsService.validateEmail(email);
            return {label: name, value: contact.email, isValidEmail};
        });

    const searchDebtorContactSelectOptions = useCallback(
        (input: string): Promise<ContactSelectOption[]> =>
            new Promise((resolve) => {
                if (!allDebtorContactSelectOptions) {
                    resolve([]);
                    return;
                }

                const filteredOptions = input
                    ? allDebtorContactSelectOptions.filter((option) =>
                          option.value?.includes(input)
                      )
                    : allDebtorContactSelectOptions;
                resolve(filteredOptions);
            }),
        [allDebtorContactSelectOptions]
    );

    const selectedEmailsAreAllValid = emails.every((option: ContactSelectOption) =>
        utilsService.validateEmail(option.value?.trim() ?? "")
    );

    return (
        <>
            <AsyncCreatableSelect
                id="share-emails-input"
                placeholder={t("shareInvoice.emailPlaceholder")}
                data-testid="share-emails-input"
                onChange={(value) => onChange(value as ContactSelectOption[] | null)}
                // @ts-ignore
                styles={ContactAsyncCreatableSelectStyle}
                isMulti={true}
                closeMenuOnSelect={false}
                defaultOptions={allDebtorContactSelectOptions}
                defaultValue={
                    allDebtorContactSelectOptions?.length == 1
                        ? allDebtorContactSelectOptions[0]
                        : null
                }
                loadOptions={searchDebtorContactSelectOptions}
                isValidNewOption={utilsService.validateEmail}
                getNewOptionData={(inputValue: string): ContactSelectOption => ({
                    label: inputValue,
                    value: inputValue,
                    isValidEmail: true, // Already validated by isValidNewOption above.
                    __isNew__: true, // Replicate react-select behavior.
                })}
                formatOptionLabel={formatOptionLabel}
                noOptionsMessage={() => t("shareInvoice.noResultFound")}
            />
            {!selectedEmailsAreAllValid && (
                <Text variant="caption" color="red.default" mt={2}>
                    {t("shareInvoice.errors.someContactsWithoutEmail")}
                </Text>
            )}
            {error && (
                <Text variant="caption" color="red.default" mt={2}>
                    {error}
                </Text>
            )}
        </>
    );
}
