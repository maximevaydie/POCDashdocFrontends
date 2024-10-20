import {PartnerDetailOutput} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Icon} from "@dashdoc/web-ui";
import {Company, useToggle} from "dashdoc-utils";
import React from "react";

import {AddContactModal} from "app/features/company/contact/AddContactModal";
import {useSlimCompany} from "app/hooks/useSlimCompany";

type Props = {
    company: Company | PartnerDetailOutput;
};

export function AddContact(props: Props) {
    const [show, setShow, setHide] = useToggle(false);
    const company = useSlimCompany(props.company);
    return (
        <>
            <Button data-testid={"add-contact-button"} variant="primary" onClick={setShow}>
                <Icon name="add" mr={3} />
                {t("transportsForm.addContact", undefined, {capitalize: true})}
            </Button>
            {show && <AddContactModal company={company} onClose={setHide} />}
        </>
    );
}
