import React, {Fragment} from "react";

import {AddressBookDelete} from "moderation/components/moderation-delete-address-book";

import {BootstrapPanel} from "./moderation-bootstrap-panel";

type AddressBookProps = {
    companyPk: number;
};

export const ModerationAddressBook: React.VFC<AddressBookProps> = ({companyPk}) => {
    return (
        <Fragment>
            <BootstrapPanel title="Delete address book">
                <AddressBookDelete companyPk={companyPk} />
            </BootstrapPanel>
        </Fragment>
    );
};
