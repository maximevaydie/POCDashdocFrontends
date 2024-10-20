import {Logger, t} from "@dashdoc/web-core";
import {Badge, Box, Callout, Flex, Table, Text} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import Helmet from "react-helmet";

import {InvoiceItemCatalogUpdateModal} from "app/taxation/invoicing/features/InvoiceItemCatalogUpdateModal";

import {InvoiceItemCatalogCreateAction} from "../features/InvoiceItemCatalogCreateAction";
import {ItemAccountCodeSuggestionsProvider} from "../hooks/useAccountCodeSuggestions";
import {formatTaxCode, formatTaxRate} from "../services/formatTaxRate";
import {
    useDashdocTaxCodes,
    usePaginatedInvoiceItemForCatalog,
} from "../services/invoiceItemCatalogApiHooks";
import {InvoiceItemForCatalog} from "../types/invoiceItemCatalogTypes";

const generateAccountCodeSuggestionsFromInvoiceItems = (
    invoiceItems: InvoiceItemForCatalog[]
): string[] => {
    const accountCodeSet = new Set(invoiceItems.map((item) => item.account_code));
    accountCodeSet.delete("");
    if (accountCodeSet.size === 0) {
        accountCodeSet.add("706");
    }
    return [...accountCodeSet].sort();
};

type InvoiceItemsColumnName = "name" | "account_code" | "vat_rate" | "status";

type InvoiceItemsColumn = {name: InvoiceItemsColumnName; width: string; getLabel: () => string};

export const InvoiceItemCatalogScreen: FunctionComponent = () => {
    const {
        items: invoiceItems,
        hasNext: hasNextInvoiceItems,
        isLoading: isLoadingInvoiceItems,
        loadNext: onInvoiceItemEndReached,
        reload: refresh,
    } = usePaginatedInvoiceItemForCatalog();
    const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);
    const [selectedInvoiceItem, setSelectedInvoiceItem] =
        React.useState<InvoiceItemForCatalog | null>(null);
    const {taxCodes, loading: taxCodeLoading} = useDashdocTaxCodes();

    const invoiceItemsColumns: InvoiceItemsColumn[] = [
        {width: "auto", getLabel: () => t("invoiceItemCatalog.Name"), name: "name"},
        {
            width: "auto",
            getLabel: () => t("invoiceItemCatalog.AccountCode"),
            name: "account_code",
        },
        {
            width: "auto",
            getLabel: () => t("invoiceItemCatalog.VatRate"),
            name: "vat_rate",
        },
        {
            width: "auto",
            getLabel: () => t("invoiceItemCatalog.Status"),
            name: "status",
        },
    ];

    const getRowCellContent = (
        invoiceItem: InvoiceItemForCatalog,
        columnName: InvoiceItemsColumnName
    ) => {
        switch (columnName) {
            case "name":
                return (
                    <Flex>
                        <Text>{invoiceItem.description}</Text>
                    </Flex>
                );
            case "account_code":
                return (
                    <Flex>
                        <Text>{invoiceItem.account_code}</Text>
                    </Flex>
                );
            case "vat_rate": {
                if (taxCodeLoading) {
                    return (
                        <Flex>
                            <Text>{formatTaxRate(invoiceItem.tax_code.tax_rate)}</Text>
                        </Flex>
                    );
                }

                const taxCode = taxCodes.find((taxCode) => taxCode.id === invoiceItem.tax_code.id);
                if (taxCode === undefined) {
                    // This should never happen, but we want to be sure, and be warned if it does
                    Logger.error(
                        `Unable to find dahsdoc tax code with id ${invoiceItem.tax_code.id} (invoice item uid: ${invoiceItem.uid}, tax rate: ${invoiceItem.tax_code.tax_rate})`
                    );
                    return (
                        <Flex>
                            <Text>{formatTaxRate(invoiceItem.tax_code.tax_rate)}</Text>
                        </Flex>
                    );
                }
                return (
                    <Flex>
                        <Text>{formatTaxCode(taxCode)}</Text>
                    </Flex>
                );
            }
            case "status": {
                return (
                    <Flex>
                        {invoiceItem.enabled ? (
                            <Badge
                                variant="success"
                                data-testid={`${invoiceItem.description}-active`}
                            >
                                {t("invoiceItemCatalog.Active")}
                            </Badge>
                        ) : (
                            <Badge
                                variant="error"
                                data-testid={`${invoiceItem.description}-inactive`}
                            >
                                {t("invoiceItemCatalog.Inactive")}
                            </Badge>
                        )}
                    </Flex>
                );
            }
        }
    };

    return (
        <ItemAccountCodeSuggestionsProvider
            value={generateAccountCodeSuggestionsFromInvoiceItems(invoiceItems)}
        >
            <Box
                height="100%"
                style={{
                    display: "grid",
                    gridTemplateRows: "min-content 1fr",
                }}
            >
                <ScrollableTableFixedHeader>
                    <Flex justifyContent="space-between" mb={3}>
                        <Helmet>
                            <title>{t("settings.invoiceItemCatalog")}</title>
                        </Helmet>
                        <Text
                            as="h3"
                            variant="title"
                            display="inline-block"
                            data-testid="invoice-item-catalog-screen-title"
                        >
                            {t("settings.invoiceItemCatalog")}
                        </Text>
                    </Flex>
                    <Box mb={3}>
                        <Callout>
                            <Text>{t("settings.invoiceItemCatalogInformation")}</Text>
                        </Callout>
                    </Box>
                    <Flex flexDirection={"row"} mb={3}>
                        <Flex flexGrow={1}></Flex>
                        <InvoiceItemCatalogCreateAction
                            creationCallback={() => {
                                refresh();
                            }}
                        />
                    </Flex>
                </ScrollableTableFixedHeader>
                <Table
                    height="auto"
                    flexGrow={1}
                    columns={invoiceItemsColumns}
                    rows={invoiceItems}
                    getRowId={(invoiceItem) => invoiceItem.uid}
                    getRowTestId={(invoiceItem) => `invoice-item-${invoiceItem.description}`}
                    getRowKey={(invoiceItem) => invoiceItem.uid}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoadingInvoiceItems}
                    hasNextPage={hasNextInvoiceItems}
                    onClickOnRow={(row) => {
                        setSelectedInvoiceItem(row);
                        setIsUpdateModalOpen(true);
                    }}
                    getRowCellIsClickable={() => true}
                    onEndReached={() => {
                        hasNextInvoiceItems && onInvoiceItemEndReached();
                    }}
                    data-testid="invoice-item-catalog-table"
                />
                {isUpdateModalOpen && selectedInvoiceItem !== null && (
                    <InvoiceItemCatalogUpdateModal
                        invoiceItem={selectedInvoiceItem}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                        }}
                        updateCallback={refresh}
                    />
                )}
            </Box>
        </ItemAccountCodeSuggestionsProvider>
    );
};
