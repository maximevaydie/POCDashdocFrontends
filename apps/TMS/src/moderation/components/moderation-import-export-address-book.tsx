import {Box, toast, Button} from "@dashdoc/web-ui";
import {LoadingWheel} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

type AddressBookImportExport = {
    companyPk: number;
};

export const AddressBookImportExport: React.VFC<AddressBookImportExport> = ({companyPk}) => {
    const [loading, setLoading] = useState(false);

    const onImportAddressBook = async () => {
        setLoading(true);

        try {
            await Api.post(
                `invoicing/import-address-book-from-third-party/`,
                {company_pk: companyPk},
                {apiVersion: "moderation"}
            );
            toast.success("Address book imported");
        } catch (error) {
            toast.error("Failed to import the Address book");
        } finally {
            setLoading(false);
        }
    };

    const onExportAddressBook = async () => {
        // Alert to confirm the export
        if (
            !window.confirm(
                "You will receive the result of the export (success/failure) by email."
            )
        ) {
            return;
        }
        setLoading(true);

        try {
            await Api.post(
                `invoicing/export-address-book-to-third-party/`,
                {company_pk: companyPk},
                {apiVersion: "moderation"}
            );
            toast.success("Address book exported");
        } catch (error) {
            toast.error("Failed to export the Address book");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box>
                <p> Import/Export the address book from/to invoicing tools.</p>
                <Button mt={2} onClick={() => onImportAddressBook()}>
                    Import (Invoicing tool -{">"} Dashdoc)
                </Button>

                <Button mt={2} onClick={() => onExportAddressBook()}>
                    Export (Dashdoc -{">"} Invoicing tool)
                </Button>
            </Box>
            <Box display="flex">{loading ? <LoadingWheel /> : <></>}</Box>
        </>
    );
};
