import {Box, Button, LoadingWheel, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

export const ReinitializeDashdocInvoicing: React.VFC<{
    companyPk: number;
}> = ({companyPk}) => {
    const [loading, setLoading] = useState(false);
    const [hasFacedAKnownError, setHasFacedAKnownError] = useState(false);
    const [hasBeenReinitialized, setHasBeenReinitialized] = useState(false);

    const onReinitializeDashdocInvoicing = async () => {
        setLoading(true);

        try {
            await Api.post(
                `invoicing/reinitialize-dashdoc-invoicing/`,
                {company_pk: companyPk},
                {apiVersion: "moderation"}
            );
            setHasBeenReinitialized(true);
        } catch (error) {
            const jsonError = await error.json();
            let errorMessage = `Error: ${JSON.stringify(jsonError)}`;
            if (jsonError.error_code === "exists-non-bare-credit-notes") {
                setHasFacedAKnownError(true);
                errorMessage =
                    "Error: Some non bare credit notes exists (i.e. credit notes associated with invoices).";
            }
            if (jsonError.error_code === "exists-exported-invoices-or-credit-notes") {
                setHasFacedAKnownError(true);
                errorMessage =
                    "Error: Some invoices or credit notes have been exported to third parties.";
            }
            errorMessage += " Please create an OPE for this case.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingWheel />;
    }

    return (
        <>
            <Box>
                {!hasBeenReinitialized && (
                    <>
                        <Text>Reinitialize dashdoc invoicing by:</Text>
                        <ul>
                            <li>Unfinalize all invoices and bare credit notes</li>
                            <li>Delete all invoices pdf</li>
                            <li>Empty the invoice numbering information</li>
                        </ul>
                        <Text>You need to make sure that:</Text>
                        <ul>
                            <li>The company has not shared already some invoices</li>
                            <li>
                                The company has not generated any credit notes associated with
                                invoices
                            </li>
                            <li>The company is aware of this action</li>
                        </ul>
                        <Button
                            disabled={loading || hasFacedAKnownError}
                            mt={2}
                            onClick={() => {
                                if (
                                    !confirm(
                                        "Are you sure you want to reinitialize Dashdoc Invoicing. This action is irreversible and some data will be lost."
                                    )
                                ) {
                                    return;
                                }
                                onReinitializeDashdocInvoicing();
                            }}
                        >
                            {"Reinitialize Dashdoc Invoicing"}
                        </Button>
                    </>
                )}
                {hasBeenReinitialized && <Text>👍 Successfully reinitialized! 👍</Text>}
            </Box>
        </>
    );
};
