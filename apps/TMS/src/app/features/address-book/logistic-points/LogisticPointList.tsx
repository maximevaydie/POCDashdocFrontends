import {
    AddressModal,
    LogisticPoint,
    fetchUpdateManager,
    getConnectedManager,
    useTimezone,
} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    ColumnProps,
    BaseRowProps,
    Table,
    Text,
    type SortCriteriaOption,
    type ColumnDirection,
} from "@dashdoc/web-ui";
import {Address, useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Highlighter from "react-highlight-words";
import createPersistedState from "use-persisted-state";

import {getLogisticPointsQueryParamsFromFilterQuery} from "app/features/filters/deprecated/utils";
import {
    fetchDeleteLogisticPoint,
    fetchSearchLogisticPointsAddressBook,
} from "app/redux/actions/logisticPoints";
import {selectRows, unselectAllRows} from "app/redux/actions/selections";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getLogisticPointsCurrentQueryLoadingStatus,
    getLogisticPointsForCurrentQuery,
} from "app/redux/selectors/searches";
import {getLogisticPointsSelectionForCurrentQuery} from "app/redux/selectors/selections";
import {LOGISTIC_POINT_QUERY_NAME} from "app/types/constants";

import {BulkActions} from "./actions/BulkActions";
import {AddressesListAddressCell} from "./behavior/AddressesListAddressCell";
import {AddressesListCompanyCell} from "./behavior/AddressesListCompanyCell";
import {AddressesListCreationMethodCell} from "./behavior/AddressesListCreationMethodCell";
import {AddressesListSignatoriesCell} from "./behavior/AddressesListSignatoriesCell";
import {CoordinatesValidatedCell} from "./behavior/CoordinatesValidatedCell";
import {LastUsedCell} from "./behavior/LastUsedCell";
import {SecurityProtocolCell} from "./behavior/SecurityProtocolCell";
import {
    LogisticPointListColumnName,
    type LogisticPointsQuery,
    type LogisticPointsFilter,
    type LogisticPointSelection,
} from "./types";

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "logistic_points.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);
type ColumnsSizeByColumn = {[name: string]: number | string};

type LogisticPointColumn = {name: string; label: string; width: number | string};

type Props = {
    currentQuery: LogisticPointsFilter;
    updateQuery: (newQuery: Partial<LogisticPointsFilter>) => void;
    onRefresh: () => void;
};
export function LogisticPointList({currentQuery, updateQuery, onRefresh}: Props) {
    const dispatch = useDispatch();
    const timezone = useTimezone();
    const isLoading = useSelector(getLogisticPointsCurrentQueryLoadingStatus);
    const {
        addresses = [],
        page: lastFetchedPage = 1,
        hasNextPage,
        totalCount: allAddressesCount,
    } = useSelector(getLogisticPointsForCurrentQuery);
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] =
        predefinedColumnsWidthState<ColumnsSizeByColumn>({});

    const [addressToEdit, setAddressToEdit] = useState<LogisticPoint | null>(null);
    const currentSelection = useSelector(getLogisticPointsSelectionForCurrentQuery);
    const [allAddressesSelected, selectAllAddresses, unselectAllAddresses] = useToggle();
    const manager = useSelector(getConnectedManager);

    const query: LogisticPointsQuery = useMemo(() => {
        return getLogisticPointsQueryParamsFromFilterQuery(currentQuery, timezone);
    }, [currentQuery, timezone]);

    const selection: LogisticPointSelection = useMemo(() => {
        const allCount = allAddressesCount ?? 0;
        if (allAddressesSelected) {
            return {...query, allCount};
        }
        return {pk__in: currentSelection, allCount};
    }, [allAddressesSelected, query, allAddressesCount, currentSelection]);

    const onSelectAddress = useCallback(
        (address: BaseRowProps, selected: boolean) => {
            dispatch(selectRows(selected, "addresses", [address.pk]));
            unselectAllAddresses();
        },
        [dispatch, unselectAllAddresses]
    );
    const onSelectAllVisibleAddresses = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "addresses", addresses?.map(({pk}) => pk) ?? []));
            unselectAllAddresses();
        },
        [addresses, dispatch, unselectAllAddresses]
    );
    const fetchAddresses = useCallback(
        (page = 1) => {
            dispatch(fetchSearchLogisticPointsAddressBook(LOGISTIC_POINT_QUERY_NAME, query, page));
        },
        [dispatch, query]
    );

    const onEndReached = useCallback(
        () => hasNextPage && fetchAddresses(lastFetchedPage + 1),
        [hasNextPage, fetchAddresses, lastFetchedPage]
    );

    // fetch first page of addresses on mount and as soon as the query change
    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const columns: LogisticPointColumn[] = [
        {name: "name", label: t("common.name"), width: "132px"},
        {name: "address", label: t("common.address"), width: "134px"},
        {name: "company", label: t("common.associatedPartner"), width: "160px"},
        {name: "coords_validated", label: t("components.gpsCoordinates"), width: "162px"},
        {
            name: "signatories",
            label: t("signatories.signatories"),
            width: "150px",
        },
        {
            name: "instructions",
            label: t("common.siteInstructions"),
            width: "157px",
        },
        {
            name: "security_protocol",
            label: t("common.securityProtocol"),
            width: "173px",
        },
        {
            name: "last_used",
            label: t("common.lastUsed"),
            width: "164px",
        },
        {
            name: "creation_method",
            label: t("addressFilter.creationMethod"),
            width: "148px",
        },
    ];

    const sortableColumns: Record<string, false | SortCriteriaOption<string>[]> = {
        last_used: [{value: "last_used", label: t("common.lastUsed")}],
        creation_method: [
            {value: "created", label: t("common.creationDate")},
            {value: "creation_method", label: t("addressFilter.creationMethod")},
        ],
        name: [{value: "name", label: t("common.name")}],
        company: [{value: "company_view__name", label: t("common.associatedPartner")}],
        coords_validated: [{value: "coords_validated", label: t("components.gpsCoordinates")}],
        instructions: [{value: "instructions", label: t("common.siteInstructions")}],
        security_protocol: [
            {value: "security_protocol__document_title", label: t("common.documentTitle")},
            {value: "security_protocol__created", label: t("common.creationDate")},
        ],
    };

    const currentOrdering = useMemo<Record<string, ColumnDirection> | null>(
        () =>
            currentQuery.ordering
                ? {
                      [currentQuery.ordering.replace("-", "")]: currentQuery.ordering.includes("-")
                          ? "desc"
                          : "asc",
                  }
                : null,
        [currentQuery]
    );

    const selectedColumnNames =
        manager?.address_book_columns?.logistic_points ?? columns.map((column) => column.name);

    let overrideHeader: React.ReactNode | null = null;
    if (currentSelection.length > 0) {
        overrideHeader = (
            <Flex alignItems="center">
                <Text>
                    {t("newBulkActions.countSelectedLogisticPoints", {
                        smart_count: currentSelection.length,
                    })}
                </Text>
                <Box
                    ml={3}
                    height="2em"
                    borderLeftWidth={1}
                    borderLeftStyle="solid"
                    borderLeftColor="grey.dark"
                />
                <BulkActions selection={selection} onActionFinished={handleActionFinished} />
            </Flex>
        );
    }

    return (
        <>
            <Table
                data-testid="addresses-list"
                mt={3}
                fontSize={1}
                isLoading={isLoading}
                onEndReached={onEndReached}
                withSelectableRows={true}
                onSelectRow={onSelectAddress}
                onSelectAllVisibleRows={onSelectAllVisibleAddresses}
                onSelectAllRows={selectAllAddresses}
                allRowsSelected={allAddressesSelected}
                hasNextPage={hasNextPage}
                allVisibleRowsSelectedMessage={t("components.relatedSelectedAddresses", {
                    number: addresses.length,
                })}
                selectAllRowsMessage={t("components.selectAllRelatedAddresses", {
                    number: allAddressesCount,
                })}
                allRowsSelectedMessage={t("components.allAddressesSelectedCount", {
                    count: allAddressesCount,
                })}
                selectedRows={currentSelection.reduce(
                    (acc, pk) => {
                        acc[pk] = true;
                        return acc;
                    },
                    {} as Record<string, boolean>
                )}
                columns={columns}
                sortableColumns={sortableColumns}
                ordering={currentOrdering}
                rows={addresses}
                getRowId={(logisticPoint: LogisticPoint) => logisticPoint.pk.toString()}
                getRowTestId={() => "address-row"}
                getRowCellContent={(
                    logisticPoint: LogisticPoint,
                    columnName: LogisticPointListColumnName
                ) => {
                    const searchWords: string[] = currentQuery.text ?? [];
                    switch (columnName) {
                        case "company":
                            return (
                                <AddressesListCompanyCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "address":
                            return (
                                <AddressesListAddressCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "security_protocol":
                            return (
                                <SecurityProtocolCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "coords_validated":
                            return (
                                <CoordinatesValidatedCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "signatories":
                            return (
                                <AddressesListSignatoriesCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "creation_method":
                            return (
                                <AddressesListCreationMethodCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                        case "last_used":
                            return (
                                <LastUsedCell
                                    logisticPoint={logisticPoint}
                                    searchWords={searchWords}
                                />
                            );
                    }
                    return (
                        <Text variant="caption" lineHeight={0} ellipsis>
                            <Highlighter
                                autoEscape={true}
                                searchWords={searchWords}
                                textToHighlight={
                                    logisticPoint[columnName as keyof LogisticPoint] as string
                                }
                            />
                        </Text>
                    );
                }}
                onClickOnRow={(address: LogisticPoint) => {
                    return setAddressToEdit(address);
                }}
                getRowCellIsClickable={(_, columnName) => columnName !== "signatories"}
                getColumnWidth={getColumnWidth}
                setColumnWidth={setColumnWidth}
                onOrderingChange={handleOrderingChange}
                withSelectableColumns
                selectedColumnNames={selectedColumnNames}
                onSelectColumns={handleSelectColumns}
                overrideHeader={overrideHeader}
            />
            {addressToEdit && (
                <AddressModal
                    companyBrowsable
                    // TODO: rework the expected type of the address prop
                    address={addressToEdit as any as Address}
                    onClose={() => {
                        setAddressToEdit(null);
                    }}
                    onDelete={async () => {
                        if (addressToEdit?.pk) {
                            await dispatch(fetchDeleteLogisticPoint(addressToEdit));
                            setAddressToEdit(null);
                            handleActionFinished({unselect: true});
                        } else {
                            Logger.error("Missing 'addressToEdit' in the onDelete event");
                        }
                    }}
                    onSave={() => {
                        setAddressToEdit(null);
                        handleActionFinished();
                    }}
                />
            )}
        </>
    );

    function handleActionFinished(options?: {unselect: true}) {
        if (options?.unselect) {
            unselectAllAddresses();
            dispatch(unselectAllRows("addresses"));
        }
        onRefresh();
    }

    function getColumnWidth(column: LogisticPointColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: LogisticPointColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({
            ...(prev ?? {}),
            [column.name]: width,
        }));
    }

    function handleOrderingChange(
        newOrdering: Record<string, ColumnProps<LogisticPointColumn>["direction"]> | null
    ) {
        updateQuery({
            ordering: !newOrdering
                ? undefined
                : `${Object.values(newOrdering)[0] === "desc" ? "-" : ""}${
                      Object.keys(newOrdering)[0]
                  }`,
        });
    }

    function handleSelectColumns(newSelection: string[]) {
        if (!manager) {
            Logger.error("No manager found");
            return;
        }
        dispatch(
            fetchUpdateManager(
                manager.pk,
                {
                    address_book_columns: {
                        ...manager.address_book_columns,
                        logistic_points: newSelection,
                    },
                },
                t("components.updatedColumns")
            )
        );
    }
}
