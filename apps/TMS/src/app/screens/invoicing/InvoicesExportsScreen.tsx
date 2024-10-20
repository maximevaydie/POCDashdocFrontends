import {useBaseUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Flex, Icon, Link, ScrollableTableFixedHeader, TabTitle} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {RouteComponentProps} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {Exports} from "app/features/export/Exports";
import {SidebarTabNames} from "app/types/constants";

const INVOICE_EXPORTS_DATA_TYPES = ["invoices", "invoices_documents", "accounting"] as const;

type InvoicesExportScreenProps = RouteComponentProps & {};

export const InvoicesExportScreen: FunctionComponent<InvoicesExportScreenProps> = ({history}) => {
    const baseUrl = useBaseUrl();

    return (
        <Flex flexDirection="column" height="100%" pt={3}>
            <ScrollableTableFixedHeader my={3}>
                <Flex>
                    <Flex flexDirection="column" flexGrow={1} style={{gap: "12px"}}>
                        <Flex justifyContent="space-between">
                            <Link
                                fontWeight={600}
                                onClick={() => history.push(`${baseUrl}/invoices/`)}
                                display="flex"
                                alignItems="center"
                            >
                                <Icon name={"arrowLeftFull"} pr={2} />
                                <Box mb="2px">{t("components.backToInvoices")}</Box>
                            </Link>
                        </Flex>
                        <TabTitle title={getTabTranslations(SidebarTabNames.INVOICES_EXPORTS)} />
                    </Flex>
                </Flex>
            </ScrollableTableFixedHeader>
            <Exports dataTypes={INVOICE_EXPORTS_DATA_TYPES} overflow="hidden" px={3} pb={3} />
        </Flex>
    );
};
