import {t} from "@dashdoc/web-core";
import {Table, TableProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import createPersistedState from "use-persisted-state";

import {TariffGrid} from "app/features/pricing/tariff-grids/types";
import {
    TARIFF_GRID_SCREEN_COLUMNS,
    TARIFF_GRID_SCREEN_SORTABLE_COLUMNS,
    TariffGridsScreenColumn,
    TariffGridsScreenColumnName,
} from "app/screens/invoicing/TariffGridsScreenColumn";

type Props = {
    tariffGrids: TariffGrid[];
    allTariffGridsCount: number;
    isLoading: boolean;
    getRowCellIsClickable: TableProps["getRowCellIsClickable"];
    onClickOnTariffGrid: TableProps["onClickOnRow"];
    ordering: TableProps["ordering"];
    onOrderingChange: TableProps["onOrderingChange"];
    onEndReached: TableProps["onEndReached"];
    hasNextPage: TableProps["hasNextPage"];
    searchedTexts: string[];
    refreshList: () => void;
};

type ColumnsSize = Partial<Record<TariffGridsScreenColumnName, string>>;
const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "tariffGrids.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

const SORTABLE_COLUMNS = TARIFF_GRID_SCREEN_SORTABLE_COLUMNS.reduce(
    (acc, column) => ({...acc, [column]: true}),
    {}
);

export const TariffGridsList: FunctionComponent<Props> = ({
    tariffGrids = [],
    allTariffGridsCount,
    isLoading,
    getRowCellIsClickable,
    onClickOnTariffGrid,
    onEndReached,
    hasNextPage,
    ordering,
    onOrderingChange,
    searchedTexts,
    refreshList,
}) => {
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] =
        predefinedColumnsWidthState<ColumnsSize>({});

    return (
        <Table<TariffGridsScreenColumn, TariffGrid>
            key={"tariff_grids_list"}
            flexGrow={1}
            fontSize={1}
            columns={Object.values(TARIFF_GRID_SCREEN_COLUMNS)}
            sortableColumns={SORTABLE_COLUMNS}
            ordering={ordering}
            getColumnWidth={getColumnWidth}
            setColumnWidth={setColumnWidth}
            onOrderingChange={onOrderingChange}
            rows={tariffGrids}
            allVisibleRowsSelectedMessage={t("components.selectRelatedTariffGrids", {
                smart_count: tariffGrids.length,
            })}
            selectAllRowsMessage={t("components.selectAllRelatedTariffGrids", {
                smart_count: allTariffGridsCount,
            })}
            allRowsSelectedMessage={t("components.allTariffGridsSelected", {
                smart_count: allTariffGridsCount,
            })}
            getRowKey={(tariffGrid) => tariffGrid.uid}
            getRowId={(tariffGrid) => tariffGrid.uid}
            getRowTestId={() => "tariff-grid-row"}
            getRowCellContent={(tariffGrid, columnName) =>
                TARIFF_GRID_SCREEN_COLUMNS[
                    columnName as TariffGridsScreenColumnName
                ].getCellContent(tariffGrid, searchedTexts, refreshList)
            }
            getRowCellIsClickable={getRowCellIsClickable}
            onClickOnRow={onClickOnTariffGrid}
            isLoading={isLoading}
            onEndReached={onEndReached}
            hasNextPage={hasNextPage}
        />
    );

    function getColumnWidth(column: TariffGridsScreenColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }

    function setColumnWidth(column: TariffGridsScreenColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({
            ...prev,
            [column.name]: width,
        }));
    }
};
