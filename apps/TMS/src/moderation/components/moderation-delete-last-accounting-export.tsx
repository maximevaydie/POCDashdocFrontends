import {Box, Button, Icon, LoadingWheel, Text} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {Api} from "../Api";

export function DeleteLastAccountingExport({companyPk}: {companyPk: number}) {
    const [loading, setLoading] = useState(false);
    const [hasEncounteredError, setHasEncounteredError] = useState(false);
    const [hasBeenDeleted, setHasBeenDeleted] = useState(false);

    if (loading) {
        return <LoadingWheel />;
    }

    return (
        <>
            <Box>
                {!hasBeenDeleted && (
                    <>
                        <Text>
                            Delete the last generated accounting export. All invoices that were
                            contained in the delete export will be added again in the next one.
                        </Text>
                        <Button
                            disabled={loading || hasEncounteredError}
                            mt={2}
                            onClick={handleDeleteLastAccountingExportWithConfirmation}
                            severity="danger"
                        >
                            <Icon name="bin" mr={2} /> Delete last accounting export
                        </Button>
                    </>
                )}
                {hasBeenDeleted && <Text>👍 Successfully deleted! 👍</Text>}
            </Box>
        </>
    );

    async function handleDeleteLastAccountingExportWithConfirmation() {
        if (
            !confirm(
                "Are you sure you want to delete the last accounting export? This action is irreversible and some data will be lost."
            )
        ) {
            return;
        }

        setLoading(true);

        try {
            await Api.post(
                `invoicing/delete-last-accounting-export/`,
                {company_pk: companyPk},
                {apiVersion: "moderation"}
            );
            setHasBeenDeleted(true);
        } catch (error) {
            const jsonError = await error.json();
            if (jsonError.error_code === "no-accounting-export-to-delete") {
                setHasEncounteredError(true);
                alert("Error: there's no accounting export to delete.");
            } else {
                alert(`Error: ${JSON.stringify(jsonError)}`);
            }
        } finally {
            setLoading(false);
        }
    }
}
