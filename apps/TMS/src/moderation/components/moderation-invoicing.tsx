import React, {Fragment, useCallback, useEffect, useState} from "react";

import {DeleteLastAccountingExport} from "moderation/components/moderation-delete-last-accounting-export";
import {AddressBookImportExport} from "moderation/components/moderation-import-export-address-book";
import {ReinitializeDashdocInvoicing} from "moderation/components/moderation-reinitialize-dashdoc-invoicing";
import {ThirdPartyMigrationToDashdocInvoicing} from "moderation/components/moderation-third-party-migration";

import {Api} from "../Api";

import {BootstrapPanel} from "./moderation-bootstrap-panel";

const COMPANY_ADMIN_FEATURE_FLAGS_URL = "/companies-admin/{pk}/feature-flags/";

type AddressBookProps = {
    companyPk: number;
    connectedUserEmail: string;
};

type InvoiceConnectorToMigrate = "Pennylane" | "Billit" | undefined;

export const ModerationInvoicing: React.VFC<AddressBookProps> = ({
    companyPk,
    connectedUserEmail,
}) => {
    const [enableImportExport, setEnableImportExport] = useState(false);
    const [invoiceConnectorToMigrate, setInvoiceConnectorToMigrate] =
        useState<InvoiceConnectorToMigrate>(undefined);
    const [dashdocInvoicingEnabled, setDashdocInvoicingEnabled] = useState<boolean | undefined>(
        undefined
    );

    const fetchInvoiceConnectors = useCallback(async (companyPk: number) => {
        try {
            const response = await Api.post(
                "invoicing/connectors/",
                {source_company_pk: companyPk},
                {apiVersion: "moderation"}
            );

            if (response.length > 0) {
                response.filter((object: {data_source: string}) => {
                    if (object.data_source === "pennylane" || object.data_source === "billit") {
                        setEnableImportExport(true);
                    }

                    if (object.data_source === "pennylane") {
                        setInvoiceConnectorToMigrate("Pennylane");
                    } else if (object.data_source === "billit") {
                        setInvoiceConnectorToMigrate("Billit");
                    }
                });
            }
        } catch (error) {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        }
    }, []);

    const fetchCompanyFeatureFlags = useCallback(async (companyPk: string) => {
        try {
            const response = await Api.get(
                COMPANY_ADMIN_FEATURE_FLAGS_URL.replace("{pk}", companyPk),
                {apiVersion: "web"}
            );

            if (response.length > 0) {
                // Update state accordingly
                for (const item of response) {
                    if (item.key === "dashdocInvoicing") {
                        setDashdocInvoicingEnabled(item.value);
                    }
                }
            }
        } catch (error) {
            const jsonError = await error.json();
            alert(`Error: ${JSON.stringify(jsonError)}`);
        }
    }, []);

    useEffect(() => {
        fetchInvoiceConnectors(companyPk);
        fetchCompanyFeatureFlags(companyPk.toString());
    }, [companyPk, fetchInvoiceConnectors, fetchCompanyFeatureFlags]);

    return (
        <Fragment>
            {enableImportExport && (
                <BootstrapPanel title="Import/Export Third Party">
                    <AddressBookImportExport companyPk={companyPk} />
                </BootstrapPanel>
            )}

            {dashdocInvoicingEnabled && (
                <BootstrapPanel title="Delete last accounting export">
                    <DeleteLastAccountingExport companyPk={companyPk} />
                </BootstrapPanel>
            )}

            {invoiceConnectorToMigrate && dashdocInvoicingEnabled !== undefined && (
                <BootstrapPanel
                    title={`${invoiceConnectorToMigrate} migration to Dashdoc Invoicing 🚀🚀🚀`}
                >
                    <ThirdPartyMigrationToDashdocInvoicing
                        invoiceConnectorToMigrate={invoiceConnectorToMigrate}
                        companyPk={companyPk}
                        connectedUserEmail={connectedUserEmail}
                        dashdocInvoicingEnabled={dashdocInvoicingEnabled}
                    />
                </BootstrapPanel>
            )}

            {dashdocInvoicingEnabled && (
                <BootstrapPanel title={`☢️ Dangerously reinitialize  Dashdoc Invoicing ☢️`}>
                    <ReinitializeDashdocInvoicing companyPk={companyPk} />
                </BootstrapPanel>
            )}
        </Fragment>
    );
};
