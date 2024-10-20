import {AsyncSelectProps} from "@dashdoc/web-ui";
import {SlimCompanyForInvitation, SimpleContact} from "dashdoc-utils";
import React, {FunctionComponent, useState} from "react";

import {AddContactModal} from "../AddContactModal";

import {ContactSelect} from "./ContactSelect";

type ContactCreatableSelectProps = Partial<AsyncSelectProps> & {
    company?: SlimCompanyForInvitation;
    autoSelectIfOnlyOne?: boolean;
    ignoreList?: string[];
    disabled?: boolean;
    wrap?: boolean;
    onContactCreated?: (contact: SimpleContact) => void;
};

const ContactCreatableSelect: FunctionComponent<ContactCreatableSelectProps> = ({
    company,
    autoSelectIfOnlyOne = true,
    isDisabled,
    onContactCreated,
    ...selectProps
}) => {
    const [addContactModalParam, setAddContactModalParam] = useState<{name: string} | null>();
    return (
        <>
            <ContactSelect
                {...selectProps}
                onCreateContact={(newContactName) =>
                    setAddContactModalParam({name: newContactName})
                }
                companies={company?.pk ? [company.pk] : []}
                isDisabled={isDisabled || !company}
                autoSelectIfOnlyOne={autoSelectIfOnlyOne}
            />
            {!!addContactModalParam && (
                <AddContactModal
                    contact={{last_name: addContactModalParam.name}}
                    company={company}
                    onClose={() => setAddContactModalParam(null)}
                    onSubmit={(contact: SimpleContact) => {
                        onContactCreated?.(contact);
                    }}
                />
            )}
        </>
    );
};

export {ContactCreatableSelect};
