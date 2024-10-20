import {
    fetchUpdateManager,
    getConnectedCompany,
    getConnectedManager,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {ORDERS_BUSINESS_STATUSES} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";
import {Box, TableProps, Table} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import createPersistedState from "use-persisted-state";

import {TabName} from "app/common/tabs";
import {useDispatch, useSelector} from "app/redux/hooks";

import {
    TransportColumn,
    getTransportSortCriteriaByColumnName,
    transportColumns,
} from "./TransportColumns";

import type {TransportListWeb} from "app/types/transport_list_web";

type Props = {
    transports: TransportListWeb[];
    allTransportsCount: number;
    isLoading: boolean;
    renderLoading: TableProps["ListLoadingComponent"];
    renderNoResults: TableProps["ListEmptyComponent"];
    onClickOnRow: TableProps["onClickOnRow"];
    editingTransport?: string;
    ordering: TableProps["ordering"];
    onOrderingChange: TableProps["onOrderingChange"];
    onEndReached: TableProps["onEndReached"];
    hasNextPage: TableProps["hasNextPage"];
    selectedTransports: TableProps["selectedRows"];
    onSelectTransport: TableProps["onSelectRow"];
    onSelectAllVisibleTransports: TableProps["onSelectAllVisibleRows"];
    onSelectAllTransports: TableProps["onSelectAllRows"];
    allTransportsSelected: TableProps["allRowsSelected"];
    searchedTexts: string[];
    currentTab: TabName;
    overrideHeader: TableProps["overrideHeader"];
};

type ColumnsSize = Partial<Record<TransportColumn["name"], string>>;
type ColumnsSizeByTransportTab = {[tab: string]: ColumnsSize};
const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "transports.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

export const TransportsList: FunctionComponent<Props> = ({
    transports = [],
    allTransportsCount,
    isLoading,
    renderLoading,
    renderNoResults,
    onClickOnRow,
    editingTransport,
    onEndReached,
    hasNextPage,
    selectedTransports,
    onSelectTransport,
    onSelectAllVisibleTransports,
    onSelectAllTransports,
    allTransportsSelected,
    ordering,
    onOrderingChange,
    searchedTexts,
    currentTab,
    overrideHeader,
}) => {
    const dispatch = useDispatch();

    const hasImproveSubcontractingEnabled = useFeatureFlag("improveSubcontracting");
    const company = useSelector(getConnectedCompany);

    //#region handle columns selection
    const manager = useSelector(getConnectedManager);
    // @ts-ignore
    const managerPk = manager.pk;

    const snakeCaseCurrentTab = currentTab.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
    );
    const isOrderTab = (ORDERS_BUSINESS_STATUSES as Readonly<string[]>).includes(
        snakeCaseCurrentTab
    );

    const managerSelectedColumns: TransportColumn["name"][] =
        // @ts-ignore
        manager.transport_columns[snakeCaseCurrentTab] || manager.shipment_columns;

    const [predefinedColumnsWidth, setPredefinedColumnsWidth] =
        predefinedColumnsWidthState<ColumnsSizeByTransportTab>({});

    const getSelectedColumnNames = (): TableProps["selectedColumnNames"] => {
        let selectedColumns: TableProps["selectedColumnNames"] = managerSelectedColumns.filter(
            (columnName: string) => Object.keys(transportColumns).includes(columnName)
        );
        // Force the RFQ column to be displayed if the feature flag is enabled
        if (
            Object.keys(transportColumns).includes("rfq") &&
            !selectedColumns.includes("rfq") &&
            currentTab === "orders_to_assign_or_declined"
        ) {
            selectedColumns.push("rfq"); // add at the end
        }
        return selectedColumns;
    };

    const onSelectColumns = (newSelection: TableProps["selectedColumnNames"]) => {
        dispatch(
            fetchUpdateManager(
                managerPk,
                {
                    transport_columns: {
                        // @ts-ignore
                        ...manager.transport_columns,
                        [snakeCaseCurrentTab]: newSelection,
                    },
                },
                t("components.updatedColumns")
            )
        );
    };
    //#endregion

    const getColumns = (): TransportColumn[] => {
        const columns = Object.values(transportColumns);

        // Updating carrier_address column name dynamically based on the tab
        const carrierAddressColumn = columns.find((column) => column.name == "carrier_address");
        if (carrierAddressColumn) {
            if (isOrderTab) {
                carrierAddressColumn.getLabel = () => t("charteredCarrier.title");
            } else {
                carrierAddressColumn.getLabel = () => t("common.carrier");
            }
        }

        const orderTabColumns = [
            "parent_shipper_address",
            "margin",
            "parent_prices",
            "shipper_invoicing_status",
            "original_transport",
        ];
        const nonOrderTabColumns = [
            "purchase_cost_total",
            "purchase_cost_unit_price",
            "chartered_carrier_address",
            "chartering",
        ];

        let filteredColumns = [...columns];

        if (!hasImproveSubcontractingEnabled) {
            filteredColumns = columns.filter(
                (column) =>
                    !["original_transport", "chartered_carrier_address", "chartering"].includes(
                        column.name
                    )
            );
        }

        const columnsToRemove = isOrderTab ? nonOrderTabColumns : orderTabColumns;

        return filteredColumns.filter((column) => !columnsToRemove.includes(column.name));
    };

    return (
        <Table
            key={snakeCaseCurrentTab}
            flexGrow={1}
            data-testid="transports-list"
            fontSize={1}
            columns={getColumns()}
            withSelectableColumns={true}
            selectedColumnNames={getSelectedColumnNames()}
            onSelectColumns={onSelectColumns}
            sortableColumns={getTransportSortCriteriaByColumnName()}
            ordering={ordering}
            getColumnWidth={getColumnWidth}
            setColumnWidth={setColumnWidth}
            onOrderingChange={onOrderingChange}
            rows={transports}
            withSelectableRows={true}
            selectedRows={selectedTransports}
            onSelectRow={onSelectTransport}
            onSelectAllVisibleRows={onSelectAllVisibleTransports}
            onSelectAllRows={onSelectAllTransports}
            allRowsSelected={allTransportsSelected}
            allVisibleRowsSelectedMessage={t("components.relatedSelectedTransports", {
                number: transports.length,
            })}
            selectAllRowsMessage={t("components.selectAllRelatedTransports", {
                number: allTransportsCount || "",
            })}
            allRowsSelectedMessage={t("components.allTransportsSelected", {
                number: allTransportsCount || "",
            })}
            getRowKey={(transport) => transport.uid}
            getRowId={(transport) => transport.uid}
            getRowTestId={() => "transport-row"}
            getRowCellContent={(transport, columnName) => {
                const column = transportColumns[columnName];
                return (
                    <Box height="55px" overflow="hidden">
                        {column.getButtonCellContent
                            ? column.getButtonCellContent(transport)
                            : column.getCellContent?.(transport, searchedTexts, company)}
                    </Box>
                );
            }}
            onClickOnRow={onClickOnRow}
            editingRowId={editingTransport}
            getRowCellIsClickable={(_, columnName) => {
                const column = transportColumns[columnName];
                return !column.getButtonCellContent;
            }}
            isLoading={isLoading}
            ListLoadingComponent={renderLoading}
            ListEmptyComponent={renderNoResults}
            onEndReached={onEndReached}
            hasNextPage={hasNextPage}
            overrideHeader={overrideHeader}
        />
    );

    function getColumnWidth(column: TransportColumn) {
        return (
            predefinedColumnsWidth[snakeCaseCurrentTab]?.[column.name] ?? column.width ?? "auto"
        );
    }
    function setColumnWidth(column: TransportColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({
            ...prev,
            [snakeCaseCurrentTab]: {...(prev[snakeCaseCurrentTab] ?? {}), [column.name]: width},
        }));
    }
};
