import {apiService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    AsyncCreatableSelect,
    AsyncSelect,
    Box,
    Flex,
    Icon,
    mergeSelectStyles,
    AsyncSelectProps,
} from "@dashdoc/web-ui";
import {Text} from "@dashdoc/web-ui";
import {Contact} from "dashdoc-utils";
import debounce from "debounce-promise";
import React, {FunctionComponent, useMemo} from "react";

type ContactSelectProps = Partial<AsyncSelectProps> & {
    companies: number[];
    autoSelectIfOnlyOne?: boolean;
    ignoreList?: string[];
    disabled?: boolean;
    onCreateContact?: (name: string) => void;
    wrap?: boolean;
};

const searchContacts = (
    input: string,
    {
        autoSelectIfOnlyOne,
        filteredCompanies,
        ignoreList,
        onChange,
    }: Partial<ContactSelectProps> & {filteredCompanies: number[]}
): Promise<Contact[]> =>
    new Promise((resolve, reject) => {
        if (!filteredCompanies.length) {
            resolve([]);
        }

        apiService
            .get(`/contacts/?text=${input}&company__id__in=${filteredCompanies.join(",")}`, {
                apiVersion: "v4",
            })
            .then((response: any) => {
                const results = ignoreList
                    ? response.results.filter((contact: Contact) => {
                          return !ignoreList.includes(contact.uid);
                      })
                    : response.results;
                const options = results;
                if (results.length === 1 && autoSelectIfOnlyOne) {
                    // auto select the contact if there is only one
                    onChange?.(results[0], {action: "select-option", option: results[0]});
                }
                resolve(options);
            })
            .catch((error) => reject(error));
    });

const ContactSelectOption = (
    contact: Contact & {__isNew__: boolean; label: string},
    wrap?: boolean
) =>
    contact.__isNew__ ? (
        contact.label
    ) : (
        <Box>
            <b>
                {contact.first_name} {contact.last_name}
            </b>
            {wrap ? <br /> : " "}
            {[contact.email, contact.phone_number].filter((s) => s !== "").join(", ")} (
            {contact.company?.name})
        </Box>
    );

const ContactSelect: FunctionComponent<ContactSelectProps> = (props) => {
    const {
        companies,
        autoSelectIfOnlyOne = true,
        ignoreList,
        onChange,
        onCreateContact,
        styles = {},
        wrap,
    } = props;
    let mergedStyles = styles;
    if (wrap) {
        mergedStyles = mergeSelectStyles(
            {
                valueContainer: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    height: label ? "5em" : "4em",
                }),
                singleValue: (provided, {selectProps: {label}}) => ({
                    ...provided,
                    ...(label && {top: "30%"}),
                }),
                menu: (provided) => ({
                    ...provided,
                    maxHeight: "400px",
                }),
            },
            styles
        );
    }

    const filteredCompanies = useMemo(() => companies.filter(Boolean), [companies]);

    const debouncedSearchContacts = useMemo(
        () =>
            debounce(
                (input) =>
                    searchContacts(input, {
                        filteredCompanies,
                        ignoreList,
                        autoSelectIfOnlyOne: onCreateContact
                            ? autoSelectIfOnlyOne && input.length === 0
                            : autoSelectIfOnlyOne,
                        onChange,
                    }),
                250,
                {
                    leading: true,
                }
            ),
        [filteredCompanies, ignoreList, onChange]
    );

    const SelectComponent = onCreateContact ? AsyncCreatableSelect : AsyncSelect;
    const creatableProps = onCreateContact
        ? {
              formatCreateLabel: (value: string) => (
                  <Flex alignItems="center">
                      <Icon name="add" mr={1} color="inherit" />
                      <Text color="inherit">
                          {value ? t("common.add") + " " + value : t("transportsForm.addContact")}
                      </Text>
                  </Flex>
              ),
              onCreateOption: onCreateContact,
              isValidNewOption: () => true,
          }
        : null;

    return (
        <SelectComponent
            key={JSON.stringify(companies)} // force component refresh on address change
            placeholder={t("common.contactPlaceholder")}
            loadOptions={debouncedSearchContacts}
            defaultOptions={true}
            getOptionValue={({uid}) => uid}
            getOptionLabel={({contact}) => contact}
            formatOptionLabel={(value) =>
                ContactSelectOption(value as Contact & {__isNew__: boolean; label: string}, wrap)
            }
            styles={mergedStyles}
            {...creatableProps}
            {...props}
        />
    );
};

export {ContactSelect};
