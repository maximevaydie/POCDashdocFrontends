import {
    Arrayify,
    companyService,
    fetchUpdateManager,
    fetchUsages,
    getConnectedManager,
    getTruckersUsage,
    managerService,
    TrackedLink,
    useBaseUrl,
    useQueryFromUrl,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Flex,
    FloatingPanel,
    FullHeightMinWidthScreen,
    Icon,
    IconButton,
    ScrollableTableFixedHeader,
    Table,
    TabTitle,
    Text,
    TableProps,
} from "@dashdoc/web-ui";
import {
    formatDate,
    formatNumber,
    Trucker,
    parseAndZoneDate,
    parseQueryString,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import createPersistedState from "use-persisted-state";

import {getTabTranslations} from "app/common/tabs";
import {TagTableCell} from "app/features/core/tags/tag-table-cell/TagTableCell";
import {Exports} from "app/features/export/Exports";
import {AddTruckerButton} from "app/features/fleet/trucker/action-buttons/AddTruckerButton";
import {DeleteTruckersButton} from "app/features/fleet/trucker/action-buttons/DeleteTruckersButton";
import {ExportTruckersButton} from "app/features/fleet/trucker/action-buttons/ExportTruckersButton";
import {SendInviteCodeButton} from "app/features/fleet/trucker/action-buttons/SendInviteCodeButton";
import {TruckerFilteringBar} from "app/features/fleet/trucker/filter/TruckerFilteringBar";
import {TruckerInviteCode} from "app/features/fleet/trucker/trucker-invite-code";
import TruckerVersionCell from "app/features/fleet/trucker/trucker-version-cell";
import {TruckersDashboard} from "app/features/fleet/trucker/TruckersDashboard";
import {TruckersUsageBadge} from "app/features/subscription/TruckersUsageBadge";
import {selectRows} from "app/redux/actions/selections";
import {fetchSearchTruckers} from "app/redux/actions/truckers";
import {useDispatch} from "app/redux/hooks";
import {getLastTruckerEvent} from "app/redux/selectors/realtime";
import {
    getTruckersCurrentQueryLoadingStatus,
    getTruckersForCurrentQuery,
} from "app/redux/selectors/searches";
import {getTruckersSelectionForCurrentQuery} from "app/redux/selectors/selections";
import {SidebarTabNames} from "app/types/constants";

import {ExportUnavailabilityButton} from "../../../features/fleet/unavailabilities/export/ExportUnavailabilityButton";
import {NuvoTruckerImporter} from "../NuvoTruckerImporter";

import {TruckerScreen} from "./TruckerScreen";
import {TruckersScreenContext} from "./TruckersScreenContext";

export enum View {
    Truckers = "truckers",
    Dashboard = "dashboard",
    Exports = "exports",
}

export type TruckersScreenQuery = {
    text: string[];
    carrier__in: string[];
    trucker__in: string[];
    trucker_tags__in?: string[];
    tags__in?: string[];
    view?: View;
    ordering?: string;
};

const parseQuery = (queryString: string): TruckersScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: false,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
        carrier__in: Arrayify(parsedParams.carrier__in || []),
        trucker__in: Arrayify(parsedParams.trucker__in || []),
        trucker_tags__in: Arrayify(parsedParams.trucker_tags__in || []),
        tags__in: Arrayify(parsedParams.tags__in || []),
    };
};

type TruckerColumn =
    | "name"
    | "linked_means"
    | "remote_id"
    | "invite_code"
    | "last_login"
    | "carrier"
    | "last_app_version"
    | "tags"
    | "occupational_health_visit_deadline"
    | "driving_license_deadline"
    | "driver_card_deadline"
    | "carrist_license_deadline"
    | "cqc_deadline"
    | "cqc_original_delivery_date"
    | "adr_license_deadline";

const sortableColumns: {[key in TruckerColumn]?: boolean} = {
    name: true,
    remote_id: true,
    last_login: true,
    occupational_health_visit_deadline: true,
    driving_license_deadline: true,
    driver_card_deadline: true,
    carrist_license_deadline: true,
    cqc_deadline: true,
    cqc_original_delivery_date: true,
    adr_license_deadline: true,
};

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "truckers.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

const getTruckerColumns = (): {width: string; getLabel: () => string; name: TruckerColumn}[] => [
    {width: "12em", getLabel: () => t("common.name"), name: "name"},
    {
        width: "6em",
        getLabel: () => t("fleet.meansCombinations.linkedMeans"),
        name: "linked_means" as TruckerColumn,
    },
    {width: "8em", getLabel: () => t("components.remoteId"), name: "remote_id"},
    {width: "12em", getLabel: () => t("settings.inviteCode"), name: "invite_code"},
    {width: "10em", getLabel: () => t("truckersList.lastLogin"), name: "last_login"},
    {width: "12em", getLabel: () => t("dashboard.lastAppVersion"), name: "last_app_version"},
    {width: "10em", getLabel: () => t("common.carrier"), name: "carrier"},
    {width: "10em", getLabel: () => t("common.tags"), name: "tags"},
    {
        width: "10em",
        getLabel: () => t("truckersList.medicalVisitDeadline"),
        name: "occupational_health_visit_deadline",
    },
    {
        width: "10em",
        getLabel: () => t("truckersList.drivingLicenseDeadline"),
        name: "driving_license_deadline",
    },
    {
        width: "10em",
        getLabel: () => t("truckersList.driverCardDeadline"),
        name: "driver_card_deadline",
    },
    {
        width: "10em",
        getLabel: () => t("truckersList.carristDriverLicenseDeadline"),
        name: "carrist_license_deadline",
    },
    {width: "10em", getLabel: () => t("truckersList.cqcDeadline"), name: "cqc_deadline"},
    {
        width: "10em",
        getLabel: () => t("truckersList.cqcOriginalDelivery"),
        name: "cqc_original_delivery_date",
    },
    {
        width: "10em",
        getLabel: () => t("truckersList.adrTrainingDeadline"),
        name: "adr_license_deadline",
    },
];

export function TruckersScreen() {
    const dispatch = useDispatch();
    const timezone = useTimezone();

    //#region State props
    const [ordering, setOrdering] = useState<TableProps["ordering"] | null>({name: "asc"});
    // @ts-ignore
    const [previewedTrucker, setPreviewTrucker] = useState<Trucker["pk"]>(null);
    const {currentQuery, updateQuery} = useQueryFromUrl<TruckersScreenQuery>(parseQuery);
    const [allTruckersSelected, selectAllTruckers, unselectAllTruckers] = useToggle();

    const currentView: View = currentQuery.view || View.Truckers;
    //#endregion

    //#region Selectors
    const {
        truckers = [],
        page = 1,
        hasNextPage,
        totalCount,
        pageCount,
    } = useSelector(getTruckersForCurrentQuery);
    const currentSelection = useSelector(getTruckersSelectionForCurrentQuery);
    const isLoading = useSelector(getTruckersCurrentQueryLoadingStatus);
    const lastRealtimeTruckerEvent = useSelector(getLastTruckerEvent);
    const truckersUsage = useSelector(getTruckersUsage);
    //#endregion

    const manager = useSelector(getConnectedManager);
    const canDisplayActionButtons: boolean = currentView === View.Truckers;

    const onSelectTrucker = useCallback(
        (trucker: Trucker, selected: boolean) => {
            dispatch(selectRows(selected, "truckers", [trucker.pk]));
            unselectAllTruckers();
        },
        [dispatch, unselectAllTruckers]
    );

    const onSelectAllVisibleTruckers = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "truckers", truckers?.map(({pk}) => pk) ?? []));
            unselectAllTruckers();
        },
        [dispatch, truckers, unselectAllTruckers]
    );

    //#region Effects
    useEffect(() => {
        dispatch(fetchUsages());
    }, []);

    useEffect(() => {
        if (ordering && Object.keys(ordering).length) {
            const [columnName, direction] = Object.entries(ordering)[0];
            const queryParameter = getQueryParameterForColumn(columnName as TruckerColumn);
            updateQuery({
                ordering:
                    // We need to have this in order to order by name,
                    // because the API can't order by `display_name` directly
                    queryParameter === "display_name"
                        ? direction === "desc"
                            ? "-user__last_name,-user__first_name,-pk"
                            : "user__last_name,user__first_name,pk"
                        : (direction === "desc" ? "-" : "") + queryParameter,
            });
        } else {
            updateQuery({
                ordering: undefined,
            });
        }
    }, [ordering]);
    useEffect(() => {
        fetchTruckers(currentQuery);
    }, [currentQuery]);
    useEffect(() => {
        fetchTruckers(currentQuery, page);
    }, [lastRealtimeTruckerEvent]);
    //#endregion

    //#region Query related methods
    const fetchTruckers = useCallback(
        async (
            query: TruckersScreenQuery,
            page:
                | number
                | {
                      fromPage: number;
                      toPage: number;
                  } = 1
        ) =>
            await dispatch(
                fetchSearchTruckers("truckers", {...query, id__in: query.trucker__in}, page)
            ),
        [dispatch]
    );

    //#endregion

    //#region Render methods

    const listActionButton = useMemo(() => {
        if (!canDisplayActionButtons) {
            return null;
        }

        const buttons = [
            <NuvoTruckerImporter
                key="truckerImporter"
                onImportDone={() => fetchTruckers(currentQuery)}
            />,
            <AddTruckerButton
                key="add-button"
                onSubmitTrucker={fetchTruckers.bind(undefined, currentQuery, page)}
                usage={truckersUsage}
            />,
        ];
        return buttons;
    }, [canDisplayActionButtons, currentQuery, fetchTruckers, page, truckersUsage]);

    //#endregion

    //#region Table Column
    const getQueryParameterForColumn = (column: TruckerColumn) => {
        switch (column) {
            case "name":
                return "display_name";
            case "remote_id":
                return "remote_id";
            case "last_login":
                return "user__last_login";
            case "occupational_health_visit_deadline":
            case "driving_license_deadline":
            case "driver_card_deadline":
            case "carrist_license_deadline":
            case "cqc_deadline":
            case "cqc_original_delivery_date":
            case "adr_license_deadline":
                return column;
            default:
                return "";
        }
    };

    // @ts-ignore
    const managerPk = manager.pk;
    // @ts-ignore
    const managerSelectedColumns: string[] = manager.fleet_columns?.truckers ?? [
        // Use default values in the front-end
        // until the column is made non-nullable in a future migration
        "name",
        "linked_means",
        "remote_id",
        "invite_code",
        "last_login",
        "last_app_version",
        "carrier",
        "tags",
        "occupational_health_visit_deadline",
    ];

    const [predefinedColumnsWidth, setPredefinedColumnsWidth] = predefinedColumnsWidthState<
        Partial<Record<TruckerColumn, string>>
    >({});

    const getSelectedColumnNames = (): TableProps["selectedColumnNames"] =>
        managerSelectedColumns.filter((columnName: string) =>
            getTruckerColumns().some((c) => c.name === columnName)
        );

    const onSelectColumns = (newSelection: TableProps["selectedColumnNames"]) => {
        dispatch(
            fetchUpdateManager(
                managerPk,
                {
                    fleet_columns: {
                        // @ts-ignore
                        ...manager.fleet_columns,
                        truckers: newSelection,
                    },
                },
                t("components.updatedColumns")
            )
        );
    };
    //#endregion

    //#region Table Cells & Rows
    const getRowId = (row: Trucker) => row.pk.toString();
    const getRowKey = (row: Trucker) => row.pk.toString();
    const getRowTestId = useCallback(() => "trucker-row", []);
    const baseUrl = useBaseUrl();
    const getRowCellContent = useCallback(
        (trucker: Trucker, columnName: string) => {
            switch (columnName) {
                case "name":
                    return (
                        <Box>
                            <Flex>
                                <Icon color="grey.dark" name="user" mr={2} />
                                <Text
                                    variant="h2"
                                    lineHeight={0}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                >
                                    {trucker.user.last_name + " " + trucker.user.first_name}
                                    {trucker.is_disabled && (
                                        <Badge
                                            fontWeight="normal"
                                            data-testid="trucker-list-disabled"
                                            mx={2}
                                            variant="error"
                                        >
                                            {t("common.disabled")}
                                        </Badge>
                                    )}
                                </Text>
                            </Flex>
                            {trucker.user.email && (
                                <Flex mt={1}>
                                    <Icon color="grey.dark" name="envelope" mr={2} />
                                    <Text
                                        variant="h2"
                                        lineHeight={0}
                                        overflow="hidden"
                                        textOverflow="ellipsis"
                                    >
                                        {trucker.user.email}
                                    </Text>
                                </Flex>
                            )}
                            {trucker.phone_number && (
                                <Flex mt={1}>
                                    <Icon color="grey.dark" name="phone" mr={2} />
                                    <Text>{trucker.phone_number}</Text>
                                </Flex>
                            )}
                        </Box>
                    );
                case "linked_means":
                    return (
                        <Box>
                            {trucker.means_combination?.vehicle ? (
                                <Flex>
                                    <Icon color="grey.dark" name="truck" mr={2} />
                                    <Text>{trucker.means_combination.vehicle.license_plate}</Text>
                                </Flex>
                            ) : null}
                            {trucker.means_combination?.trailer ? (
                                <Flex mt={1}>
                                    <Icon color="grey.dark" name="trailer" mr={2} />
                                    <Text>{trucker.means_combination.trailer.license_plate}</Text>
                                </Flex>
                            ) : null}
                        </Box>
                    );
                case "tags":
                    return (
                        <TagTableCell
                            // @ts-ignore
                            tags={trucker.tags}
                            numberOfItemsToDisplay={2}
                        />
                    );
                case "carrier":
                    return (
                        <TrackedLink to={companyService.getPartnerLink(baseUrl, trucker.carrier)}>
                            {trucker.carrier.name}
                        </TrackedLink>
                    );

                case "invite_code":
                    return <TruckerInviteCode truckerPk={trucker.pk} />;
                case "last_app_version":
                    return trucker && <TruckerVersionCell trucker={trucker} />;
                case "last_login":
                    return trucker.user.last_login ? (
                        <Text>
                            {formatDate(
                                parseAndZoneDate(trucker.user.last_login, timezone),
                                "dd/MM/yy HH:mm"
                            )}
                        </Text>
                    ) : (
                        ""
                    );
                case "occupational_health_visit_deadline":
                case "driving_license_deadline":
                case "driver_card_deadline":
                case "carrist_license_deadline":
                case "cqc_deadline":
                case "cqc_original_delivery_date":
                case "adr_license_deadline":
                    return (
                        !!trucker[columnName] && (
                            <Text>{formatDate(trucker[columnName], "P")}</Text>
                        )
                    );
                default:
                    return (
                        <Text>
                            {
                                trucker[columnName as keyof Trucker] as
                                    | string
                                    | number
                                    | boolean
                                    | null
                                    | undefined
                            }
                        </Text>
                    );
            }
        },
        [timezone]
    );
    //#endregion

    const onEndReached = useCallback(
        () => hasNextPage && !isLoading && fetchTruckers(currentQuery, page + 1),
        [currentQuery, fetchTruckers, hasNextPage, isLoading, page]
    );

    return (
        <TruckersScreenContext.Provider
            value={{
                currentQuery,
                currentPage: page,
                fetchTruckers,
            }}
        >
            <FullHeightMinWidthScreen>
                <ScrollableTableFixedHeader>
                    <Flex
                        justifyContent="space-between"
                        mb={currentView !== "exports" ? 3 : 1}
                        alignItems="center"
                    >
                        <Flex mb={3} mt={3}>
                            <TabTitle
                                title={getTabTranslations(SidebarTabNames.TRUCKERS)}
                                detailText={`- ${
                                    formatNumber(totalCount) +
                                    " " +
                                    t(
                                        "common.truckers",
                                        {smart_count: totalCount ?? 2},
                                        {capitalize: true}
                                    )
                                }`}
                            />
                            <Box ml={3}>
                                {truckersUsage !== null && (
                                    <TruckersUsageBadge
                                        truckers={truckersUsage.used}
                                        truckersSoftLimit={truckersUsage.soft_limit}
                                        periodStartDate={truckersUsage.period_start_date}
                                        periodEndDate={truckersUsage.period_end_date}
                                    />
                                )}
                            </Box>
                        </Flex>
                        <Box>
                            <Flex alignItems="baseline" justifyContent="flex-end">
                                <IconButton
                                    data-testid="truckers-screen-list-view-button"
                                    name="list"
                                    label={t("common.list")}
                                    onClick={updateQuery.bind(
                                        undefined,
                                        {view: View.Truckers},
                                        "push"
                                    )}
                                    color={
                                        currentView === View.Truckers ? "blue.default" : undefined
                                    }
                                />
                                {managerService.hasAtLeastUserRole(manager) && (
                                    <IconButton
                                        data-testid="truckers-screen-dashboard-view-button"
                                        name="pieLineGraph"
                                        label={t("common.dashboard")}
                                        onClick={updateQuery.bind(
                                            undefined,
                                            {view: View.Dashboard},
                                            "push"
                                        )}
                                        mx={2}
                                        color={
                                            currentView === View.Dashboard
                                                ? "blue.default"
                                                : undefined
                                        }
                                    />
                                )}
                                <IconButton
                                    data-testid="truckers-screen-exports-view-button"
                                    name="exports"
                                    label={t("common.exports")}
                                    onClick={updateQuery.bind(
                                        undefined,
                                        {view: View.Exports},
                                        "replace"
                                    )}
                                    color={
                                        currentView === View.Exports ? "blue.default" : undefined
                                    }
                                />
                            </Flex>
                        </Box>
                    </Flex>
                </ScrollableTableFixedHeader>
                {currentView === View.Truckers && (
                    <Flex overflow="hidden" px={3} pb={3} flexDirection="column">
                        <Flex alignItems="center" flexWrap="wrap" pb={2} style={{gap: "8px"}}>
                            <TruckerFilteringBar
                                currentQuery={currentQuery}
                                updateQuery={updateQuery}
                            />
                            <Flex alignItems="center" justifyContent="flex-end">
                                <ExportUnavailabilityButton type="truckers" />
                                {listActionButton}
                            </Flex>
                        </Flex>

                        <Table
                            height="auto"
                            mb={1}
                            columns={getTruckerColumns()}
                            withSelectableColumns={true}
                            selectedColumnNames={getSelectedColumnNames()}
                            onSelectColumns={onSelectColumns}
                            sortableColumns={sortableColumns}
                            isLoading={isLoading}
                            rows={truckers}
                            getRowId={getRowId}
                            getRowKey={getRowKey}
                            getRowTestId={getRowTestId}
                            getRowCellContent={getRowCellContent}
                            getColumnWidth={getColumnWidth}
                            setColumnWidth={setColumnWidth}
                            ordering={ordering}
                            onOrderingChange={setOrdering}
                            withSelectableRows
                            selectedRows={currentSelection.reduce(
                                (acc, uid) => {
                                    acc[uid] = true;
                                    return acc;
                                },
                                {} as Record<string, boolean>
                            )}
                            onSelectRow={onSelectTrucker}
                            onSelectAllVisibleRows={onSelectAllVisibleTruckers}
                            onSelectAllRows={selectAllTruckers}
                            allRowsSelected={allTruckersSelected}
                            allVisibleRowsSelectedMessage={t("components.selectedTruckersCount", {
                                smart_count: pageCount,
                            })}
                            selectAllRowsMessage={t("components.selectAllTruckersCount", {
                                smart_count: totalCount,
                            })}
                            allRowsSelectedMessage={t("components.allTruckersSelectedCount", {
                                smart_count: totalCount,
                            })}
                            onClickOnRow={({pk}) => setPreviewTrucker(pk)}
                            hasNextPage={hasNextPage}
                            onEndReached={onEndReached}
                            data-testid="settings-truckers-table"
                            overrideHeader={renderTableHeader()}
                        />
                    </Flex>
                )}
                {currentView === View.Dashboard && (
                    <Flex overflow="hidden" flex={1} px={3} pb={3} flexDirection="column">
                        <TruckersDashboard />
                    </Flex>
                )}
                {currentView === View.Exports && (
                    <Flex overflow="hidden" px={3} pb={3} flexDirection="column">
                        <Exports
                            dataTypes={[
                                "truckers_stats",
                                "truckers",
                                "truckers_unavailabilities",
                                "truckers_planning",
                            ]}
                            height="100%"
                            pt={3}
                        />
                    </Flex>
                )}

                {previewedTrucker && (
                    <FloatingPanel
                        width={0.4}
                        minWidth={600}
                        onClose={setPreviewTrucker.bind(undefined, null)}
                        data-testid="preview-trucker-panel"
                    >
                        <Flex pt={2} pr={2} justifyContent="flex-end" mb={-3}>
                            <IconButton
                                name="openInNewTab"
                                onClick={() =>
                                    window.open(
                                        `/app/fleet/truckers/details/${previewedTrucker}`,
                                        "_blank"
                                    )
                                }
                            />
                        </Flex>
                        <TruckerScreen
                            truckerPk={previewedTrucker}
                            onDelete={setPreviewTrucker.bind(undefined, null)}
                        />
                    </FloatingPanel>
                )}
            </FullHeightMinWidthScreen>
        </TruckersScreenContext.Provider>
    );

    function getColumnWidth(column: ReturnType<typeof getTruckerColumns>[0]) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: ReturnType<typeof getTruckerColumns>[0], width: string) {
        setPredefinedColumnsWidth((prev) => ({...prev, [column.name]: width}));
    }

    function renderTableHeader() {
        return currentSelection.length > 0 ? (
            <Flex alignItems="center">
                <Text>
                    {t("bulkActions.countSelectedTruckers", {
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
                <SendInviteCodeButton
                    onInviteSent={() => {
                        unselectAllTruckers();
                        onSelectAllVisibleTruckers(false);
                        fetchTruckers(currentQuery);
                    }}
                    truckers={truckers}
                    allTruckersSelected={allTruckersSelected}
                    currentSelection={currentSelection}
                    totalCount={totalCount ?? 0}
                />
                <ExportTruckersButton
                    currentSelection={currentSelection}
                    currentQuery={currentQuery}
                    allTruckersSelected={allTruckersSelected}
                />
                <DeleteTruckersButton
                    currentSelection={currentSelection}
                    currentQuery={currentQuery}
                    fetchTruckers={fetchTruckers}
                />
            </Flex>
        ) : null;
    }
}
