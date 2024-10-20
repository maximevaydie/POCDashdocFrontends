import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Text} from "@dashdoc/web-ui";
import {Connector} from "dashdoc-utils";
import React, {useState} from "react";

import {fetchSynchronizeWithThirdParty} from "app/redux/actions/invoices";
import {useDispatch} from "app/redux/hooks";

import {getExtension} from "../extensions.service";

import AbsencesMapper from "./absences-mapper";
import ShippersMapper from "./shippers-mapper";
import {ConnectorCategory, ExtensionDataSource} from "./types";

export const ExtensionMappings = ({
    dataSource,
    connectorCategory,
    connector,
}: {
    dataSource: ExtensionDataSource;
    connectorCategory: ConnectorCategory;
    connector: Connector | undefined;
}) => {
    const {name, isShipperBindingRequired} = getExtension(connectorCategory, dataSource);

    const MappingExternalTms = () => {
        return (
            <>
                {connector && isShipperBindingRequired && (
                    <ShippersMapper connectorUid={connector.uid} platformName={name} />
                )}
            </>
        );
    };
    const MappingAbsenceManager = () => {
        return (
            <>
                {connector && (
                    <AbsencesMapper
                        connectorParameters={connector.parameters}
                        connectorUid={connector.uid}
                        platformName={name}
                        dataSource={dataSource}
                    />
                )}
            </>
        );
    };

    const MappingInvoicing = () => {
        const dispatch = useDispatch();
        const [lastCatalogSynchronization, setLastCatalogSynchronization] = useState<
            string | undefined
        >(connector?.parameters?.last_catalog_synchronization);

        const synchronizeWithThirdParty = async () => {
            await dispatch(fetchSynchronizeWithThirdParty());
            setLastCatalogSynchronization(new Date().toString());
        };

        return (
            <>
                {dataSource !== "custom_invoicing" && (
                    <Box>
                        {lastCatalogSynchronization && (
                            <Text mt={4} data-testid="invoicing-last-catalog-synchronization-date">
                                {t("settings.invoicing.lastCatalogSynchronization", {
                                    synchronizationDate: lastCatalogSynchronization,
                                })}
                            </Text>
                        )}

                        <Button
                            variant="primary"
                            onClick={synchronizeWithThirdParty}
                            type="button"
                            maxWidth="fit-content"
                            mt={4}
                            data-testid="synchronize-with-third-party"
                        >
                            {t("settings.invoicing.synchronizeTaxCodesAndInvoiceItems")}
                        </Button>
                    </Box>
                )}
            </>
        );
    };

    return (
        <>
            <Flex flexDirection="column">
                {connectorCategory === "external_tms" && <MappingExternalTms />}
                {connectorCategory === "absence_manager" && <MappingAbsenceManager />}
                {connectorCategory === "invoicing" && <MappingInvoicing />}
            </Flex>
        </>
    );
};
