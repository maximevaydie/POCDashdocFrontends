import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    FiltersAsyncPaginatedSelect,
    Text,
    FiltersSelectAsyncPaginatedProps,
    toast,
} from "@dashdoc/web-ui";
import {SimpleContact} from "dashdoc-utils";
import React, {FunctionComponent, useCallback} from "react";

const ContactName: FunctionComponent<{
    contact: SimpleContact;
}> = ({contact}) => (
    <Text display="inline">
        <Text as="b">
            {contact.first_name} {contact.last_name}
        </Text>{" "}
        ({contact.email})
    </Text>
);

const searchContacts = (
    input: string,
    {filteredCompanies}: Partial<ContactSelectNewProps> & {filteredCompanies: number[]}
): Promise<{
    results: SimpleContact[];
    next: string | null;
}> =>
    new Promise((resolve, reject) => {
        if (!filteredCompanies.length) {
            // this code will be ignored by the UI
            return reject({code: "empty_company_list"});
        }

        apiService
            .get(`/contacts/?text=${input}&company__id__in=${filteredCompanies.join(",")}`, {
                apiVersion: "v4",
            })
            .then(({results, next}: {results: SimpleContact[]; next: string | null}) => {
                resolve({results, next});
            })
            .catch((error) => reject(error));
    });

type ContactSelectNewProps = {
    filteredCompanies: number[];
    selectedContacts: SimpleContact[];
    contactsToHide?: SimpleContact[];
    label?: string;
    onChange: (contact: SimpleContact[]) => void;
};
export default function ContactSelectNew({
    filteredCompanies,
    selectedContacts = [],
    contactsToHide = [],
    label = t("trackingContactsModal.selectContact"),
    onChange,
}: ContactSelectNewProps) {
    // declare loadOptions function for FiltersAsyncPaginatedSelect
    const loadOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = useCallback(
        async (text: string, _: any, {page}: {page: number}) => {
            try {
                const {results, next} = await searchContacts(text, {
                    filteredCompanies,
                });

                return {
                    options: results,
                    hasMore: !!next,
                    additional: {
                        page: page + 1,
                    },
                };
            } catch (error) {
                if (error.code !== "empty_company_list") {
                    Logger.error(error);
                    toast.error(t("contact.error.couldNotFetch"));
                }
                return {
                    options: [],
                    hasMore: undefined,
                };
            }
        },
        [filteredCompanies]
    );

    // handle select/unselect carrier
    const handleContactChange = useCallback(
        (selectedContacts: SimpleContact[]) => {
            onChange(
                selectedContacts.filter(
                    ({uid}) => !contactsToHide.find((contact) => contact.uid === uid)
                )
            );
        },
        [contactsToHide, onChange]
    );

    return (
        <FiltersAsyncPaginatedSelect
            data-testid="contact-select-new"
            label={label}
            loadOptions={loadOptions}
            isOptionDisabled={(contact) => !!contactsToHide.find(({uid}) => uid === contact.uid)}
            defaultOptions={true}
            getOptionValue={({uid}) => uid}
            getOptionLabel={({first_name, last_name}) => `${first_name} ${last_name}`}
            formatOptionLabel={(contact: SimpleContact) => <ContactName contact={contact} />}
            value={[...selectedContacts, ...contactsToHide]}
            onChange={handleContactChange}
        />
    );
}
