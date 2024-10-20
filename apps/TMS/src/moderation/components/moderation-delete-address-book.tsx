import {Box, toast, Button, Icon} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

type AddressBookDeleteProps = {
    companyPk: number;
};

export const AddressBookDelete: React.VFC<AddressBookDeleteProps> = ({companyPk}) => {
    const [loading, setLoading] = useState(false);

    const onDeleteAddressBook = async () => {
        setLoading(true);
        try {
            await Api.patch(
                `/address-book/delete/`,
                {
                    company_pk: companyPk,
                },
                {apiVersion: "moderation"}
            );
            toast.success("Address book deleted");
        } catch (error) {
            toast.error("Failed to delete the Address book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <p> Delete the address book except the primary address</p>
            <Button disabled={loading} severity="danger" onClick={onDeleteAddressBook}>
                <Icon name="bin" mr={2} /> Delete address book
            </Button>
        </Box>
    );
};
