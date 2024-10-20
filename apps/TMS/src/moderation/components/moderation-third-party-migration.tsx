import {Box, Button, LoadingWheel, Select, SelectOption, Text} from "@dashdoc/web-ui";
import {InvoiceItem} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

import {Api} from "../Api";

type ThirdPartyMigrationToDashdocInvoicingProps = {
    companyPk: number;
    connectedUserEmail: string;
    dashdocInvoicingEnabled: boolean;
    invoiceConnectorToMigrate: "Pennylane" | "Billit";
};

type InvoiceItemSelectOptionValue = InvoiceItem["uid"];
type InvoiceItemSelectOption = SelectOption<InvoiceItemSelectOptionValue>;
const NO_DEFAULT_INVOICE_ITEM_OPTION = {value: null, label: "No default"};

export const ThirdPartyMigrationToDashdocInvoicing: React.VFC<
    ThirdPartyMigrationToDashdocInvoicingProps
> = ({companyPk, connectedUserEmail, dashdocInvoicingEnabled, invoiceConnectorToMigrate}) => {
    const [loading, setLoading] = useState(true);
    const [invoiceItemOptions, setInvoiceItemOptions] = useState<InvoiceItemSelectOption[]>([]);
    const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<InvoiceItemSelectOption>(
        NO_DEFAULT_INVOICE_ITEM_OPTION
    );

    useEffect(() => {
        async function fetchInvoiceItems() {
            const invoiceItems: InvoiceItem[] = await Api.get(
                `invoicing/invoice-items?company_pk=${companyPk}`,
                {apiVersion: "moderation"}
            );
            setInvoiceItemOptions(
                invoiceItems
                    .map((invoiceItem) => {
                        let label;
                        if (invoiceItem.tax_code) {
                            label = `${invoiceItem.description} (VAT ${invoiceItem.tax_code?.tax_rate}%)`;
                        } else {
                            label = `${invoiceItem.description} (Unknown VAT)`;
                        }
                        return {
                            value: invoiceItem.uid,
                            label,
                        };
                    })
                    .concat([NO_DEFAULT_INVOICE_ITEM_OPTION])
            );
            setLoading(false);
        }
        fetchInvoiceItems();
    }, []);

    const getThirdPartyCustomersExport = async () => {
        setLoading(true);

        try {
            await Api.post(
                `invoicing/export-third-party-customers/`,
                {company_pk: companyPk},
                {apiVersion: "moderation"}
            );
        } catch (error) {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        } finally {
            setLoading(false);
        }
    };

    const onMigrateThirdPartyToDashdocInvoicing = async (
        defaultInvoiceItemUid: InvoiceItem["uid"]
    ) => {
        setLoading(true);

        try {
            await Api.post(
                `invoicing/migrate-third-party-to-dashdoc-invoicing/`,
                {
                    company_pk: companyPk,
                    default_invoice_item_uid: defaultInvoiceItemUid,
                },
                {apiVersion: "moderation"}
            );
        } catch (error) {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingWheel />;
    }

    return (
        <>
            {invoiceConnectorToMigrate === "Pennylane" && (
                <Box>
                    <Text variant="h1">Customers export</Text>
                    <Text>The Excel export will be sent to you by email.</Text>
                    <Button
                        mt={2}
                        mb={4}
                        onClick={() => {
                            if (
                                !confirm(
                                    `You will receive an email confirmation when the file is completed at ${connectedUserEmail}.`
                                )
                            ) {
                                return;
                            }
                            getThirdPartyCustomersExport();
                        }}
                    >
                        Export {invoiceConnectorToMigrate} customers
                    </Button>
                </Box>
            )}
            <Box>
                <Text variant="h1">⚠️⚠️⚠️ Migration ⚠️⚠️⚠️</Text>
                <Text>The migration report will be sent to you by email.</Text>
                {!dashdocInvoicingEnabled && (
                    <Text mt={1} color="red.default">
                        <b>
                            ⚠️ The Feature Flag dashdocInvoicing is not enabled for this company,
                            migration is blocked.
                        </b>
                    </Text>
                )}
                <Text mt={1}>
                    Choose a default invoice item for transports / transport templates / tariff
                    grids / fuel surcharge agreements that have no invoice item set:
                </Text>
                <Select
                    options={invoiceItemOptions}
                    value={selectedInvoiceItem}
                    onChange={(option: InvoiceItemSelectOption) => {
                        setSelectedInvoiceItem(option);
                    }}
                />
                {invoiceConnectorToMigrate === "Billit" && (
                    <Text mt={1} color="red.default">
                        <b>
                            {`⚠️ Migration from Billit does not migrate shippers' account code/side account code, nor invoice items' account code. Please make sure to set them manually after the migration.`}
                        </b>
                    </Text>
                )}
                <Button
                    disabled={!dashdocInvoicingEnabled}
                    mt={2}
                    onClick={() => {
                        if (
                            !confirm(
                                `You will receive an email confirmation when the migration is completed at ${connectedUserEmail}.`
                            )
                        ) {
                            return;
                        }
                        onMigrateThirdPartyToDashdocInvoicing(selectedInvoiceItem.value || null);
                    }}
                >
                    {`Launch ${invoiceConnectorToMigrate} > Dashdoc Invoicing migration`}
                </Button>
            </Box>
        </>
    );
};
