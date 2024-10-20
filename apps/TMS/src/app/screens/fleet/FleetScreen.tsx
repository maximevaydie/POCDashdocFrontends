import {Arrayify, useQueryFromUrl} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    FloatingPanel,
    FullHeightMinWidthScreen,
    Icon,
    IconButton,
    ScrollableTableFixedHeader,
    Table,
    ColumnDirection,
    Text,
} from "@dashdoc/web-ui";
import {
    formatNumber,
    parseQueryString,
    FleetItem,
    FuelType,
    UnifiedFleetQuery,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

import {TagTableCell} from "app/features/core/tags/tag-table-cell/TagTableCell";
import {Exports} from "app/features/export/Exports";
import IDTFBadge from "app/features/fleet/IDTFBadge";
import {ExportUnavailabilityButton} from "app/features/fleet/unavailabilities/export/ExportUnavailabilityButton";
import {fetchSearchFleetItems} from "app/redux/actions/fleet-items";
import {selectRows} from "app/redux/actions/selections";
import {useDispatch} from "app/redux/hooks";
import {
    getFleetItemsCurrentQueryLoadingStatus,
    getFleetItemsForCurrentQuery,
} from "app/redux/selectors/searches";
import {getFleetItemsSelectionForCurrentQuery} from "app/redux/selectors/selections";
import {AddFleetButton} from "app/screens/fleet/filter/AddFleetButton";
import {BulkDeleteFleetButton} from "app/screens/fleet/filter/BulkDeleteFleetButton";
import {FleetFilteringBar} from "app/screens/fleet/filter/FleetFilteringBar";
import {FleetScreenContext} from "app/screens/fleet/FleetScreenContext";
import {fuelTypeService} from "app/services/transport/fuelType.service";
import {FLEET_ITEMS_QUERY_NAME} from "app/types/constants";

import {FleetUnitScreen} from "./FleetUnitScreen";
import {NuvoFleetImporter} from "./NuvoFleetImporter";

enum View {
    Fleet = "fleet",
    Exports = "exports",
}

export type FleetScreenQuery = {
    text?: string[];
    fleet_tags__in?: string[];
    tags__in?: string[];
    license_plate__in?: string[];
    ordering?: UnifiedFleetQuery["ordering"];
    fuel_type__in?: FuelType[];
    view?: View;
};

const getFleetItemId = (fleetItem: FleetItem, overrideType?: "vehicle" | "trailer") =>
    `${overrideType || fleetItem.type}-${fleetItem.pk}`;

const parseQuery = (queryString: string): FleetScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: false,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
        fleet_tags__in: Arrayify(parsedParams.fleet_tags__in || []).map((t) => t.toString()),
        tags__in: Arrayify(parsedParams.tags__in || []).map((t) => t.toString()),
        license_plate__in: Arrayify(parsedParams.license_plate__in || []).map((t) => t.toString()),
        fuel_type__in: Arrayify(parsedParams.fuel_type__in || []).map(
            (t) => t.toString() as FuelType
        ),
    };
};

type FleetColumn =
    | "license_plate"
    | "linked_means"
    | "fleet_number"
    | "type"
    | "remote_id"
    | "details"
    | "tags"
    | "fuel_type"
    | "gross_combination_weight_in_tons";

const getFleetColumns = (): {name: FleetColumn; width: string; getLabel: () => string}[] => [
    {width: "4em", getLabel: () => t("common.type"), name: "type"},
    {
        width: "6em",
        getLabel: () => t("fleet.meansCombinations.linkedMeans"),
        name: "linked_means",
    },
    {width: "6em", getLabel: () => t("common.licensePlate"), name: "license_plate"},
    {width: "6em", getLabel: () => t("common.fleetNumber"), name: "fleet_number"},
    {width: "6em", getLabel: () => t("components.remoteId"), name: "remote_id"},
    {width: "6em", getLabel: () => t("common.fuel_type"), name: "fuel_type"},
    {
        width: "4em",
        getLabel: () => t("common.gross_combination_weight.acronym"),
        name: "gross_combination_weight_in_tons",
    },
    {width: "8em", getLabel: () => t("settingsPlates.details"), name: "details"},
    {width: "6em", getLabel: () => t("common.tags"), name: "tags"},
];

export function FleetScreen() {
    const dispatch = useDispatch();

    //#region State props
    // @ts-ignore
    const [previewedFleetItem, setPreviewFleetItem] = useState<FleetItem>(null);
    const {currentQuery, updateQuery} = useQueryFromUrl<FleetScreenQuery>(parseQuery);
    const [allFleetItemsSelected, selectAllFleetItems, unselectAllFleetItems] = useToggle();

    const currentView: View = currentQuery.view || View.Fleet;
    //#endregion

    //#region Selectors
    const {
        fleetItems = [],
        page = 1,
        hasNextPage,
        totalCount: totalFleetItemsCount,
        pageCount: pageFleetItemsCount,
    } = useSelector(getFleetItemsForCurrentQuery);
    const currentSelection = useSelector(getFleetItemsSelectionForCurrentQuery);
    const isLoading = useSelector(getFleetItemsCurrentQueryLoadingStatus);
    //#endregion

    const onSelectFleetItem = useCallback(
        (fleetItem: FleetItem, selected: boolean) => {
            dispatch(selectRows(selected, "fleet-items", [`${fleetItem.type}-${fleetItem.pk}`]));
            unselectAllFleetItems();
        },
        [dispatch, unselectAllFleetItems]
    );

    const onSelectAllVisibleFleetItems = useCallback(
        (selected: boolean) => {
            dispatch(
                selectRows(
                    selected,
                    "fleet-items",
                    fleetItems?.map(({type, pk}) => `${type}-${pk}`) ?? []
                )
            );
            unselectAllFleetItems();
        },
        [dispatch, fleetItems, unselectAllFleetItems]
    );

    const searchFleetItems = useCallback(
        async (
            currentQuery: FleetScreenQuery,
            page:
                | number
                | {
                      fromPage: number;
                      toPage: number;
                  } = 1
        ) => {
            const query: UnifiedFleetQuery = {
                license_plate__in: currentQuery.license_plate__in,
                fuel_type__in: currentQuery.fuel_type__in,
                tags__in: currentQuery.tags__in,
                text: currentQuery.text,
            };
            if (currentQuery.ordering) {
                query.ordering = currentQuery.ordering;
            }
            dispatch(fetchSearchFleetItems(FLEET_ITEMS_QUERY_NAME, query, page));
        },
        [dispatch]
    );

    //#region Effects
    useEffect(() => {
        searchFleetItems(currentQuery);
    }, [currentQuery, searchFleetItems]);
    //#endregion

    //#region Column related methods
    // @ts-ignore
    const sortableColumns: {[column in UnifiedFleetQuery["ordering"]]?: boolean} = useMemo(
        () => ({
            license_plate: true,
            fleet_number: true,
            remote_id: true,
            fuel_type: true,
            gross_combination_weight_in_tons: true,
        }),
        []
    );

    const onOrderingChange = useCallback(
        (newOrdering: Record<string, ColumnDirection> | null) => {
            if (!newOrdering) {
                updateQuery({
                    ordering: undefined,
                });
            } else {
                const orderField = Object.keys(newOrdering)[0];
                const descendingOrder = Object.values(newOrdering)[0] === "desc";
                updateQuery({
                    ordering: `${
                        descendingOrder ? "-" : ""
                    }${orderField}` as UnifiedFleetQuery["ordering"],
                });
            }
        },
        [updateQuery]
    );

    const getRowCellContent = useCallback((item: FleetItem, columnName: FleetColumn) => {
        switch (columnName) {
            case "type":
                return (
                    <Flex>
                        {item.type === "vehicle" ? t("common.engine") : t("common.trailer")}
                    </Flex>
                );

            case "linked_means":
                return (
                    <Box>
                        {item.means_combination?.trucker ? (
                            <Flex mt={1}>
                                <Icon color="grey.dark" name="user" mr={2} />
                                <Text>{item.means_combination.trucker.display_name}</Text>
                            </Flex>
                        ) : null}

                        {item.type === "trailer" && item.means_combination?.vehicle ? (
                            <Flex mt={1}>
                                <Icon color="grey.dark" name="truck" mr={2} />
                                <Text>{item.means_combination.vehicle.license_plate}</Text>
                            </Flex>
                        ) : null}

                        {item.type === "vehicle" && item.means_combination?.trailer ? (
                            <Flex mt={1}>
                                <Icon color="grey.dark" name="trailer" mr={2} />
                                <Text>{item.means_combination.trailer.license_plate}</Text>
                            </Flex>
                        ) : null}
                    </Box>
                );

            case "fuel_type":
                // @ts-ignore
                return <Flex>{fuelTypeService.translateFuelType(item.fuel_type)}</Flex>;

            case "gross_combination_weight_in_tons":
                return item.gross_combination_weight_in_tons ? (
                    <Flex>
                        {t("common.metric_tons_formatted", {
                            weight: item.gross_combination_weight_in_tons,
                        })}
                    </Flex>
                ) : null;

            case "tags":
                return (
                    <TagTableCell
                        // @ts-ignore
                        tags={item.tags}
                        numberOfItemsToDisplay={2}
                    />
                );
            case "details":
                return (
                    <Flex alignItems="center" flexWrap="wrap">
                        {item.used_for_qualimat_transports && <IDTFBadge mr={1} />}
                        {item?.telematic_vehicle && (
                            <Link
                                to={{
                                    pathname: "/app/traces",
                                    state: {
                                        id: item.telematic_vehicle,
                                        plate: item.license_plate,
                                    },
                                }}
                                style={{textDecoration: "none", display: "inline-block"}}
                            >
                                <Button
                                    paddingX={1}
                                    paddingY={1}
                                    marginX={1}
                                    variant="secondary"
                                    onClick={() => {}}
                                >
                                    <Icon name="telematicConnection" mr={3} mt={0} mb={0} />
                                    <Text>{t("common.traces")}</Text>
                                </Button>
                            </Link>
                        )}
                    </Flex>
                );

            default:
                return item[columnName];
        }
    }, []);
    //#endregion

    const onEndReached = useCallback(
        () => hasNextPage && !isLoading && searchFleetItems(currentQuery, page + 1),
        [hasNextPage, isLoading, searchFleetItems, currentQuery, page]
    );

    //#region Render methods
    const listActionButtons = useMemo(() => {
        return [
            <NuvoFleetImporter
                key="fleetImporter"
                onImportDone={() => searchFleetItems(currentQuery)}
            />,
            <AddFleetButton
                key="newvehicle"
                onSubmit={() => {
                    searchFleetItems(currentQuery);
                }}
            />,
        ];
    }, [currentQuery, searchFleetItems]);
    //#endregion

    return (
        <FleetScreenContext.Provider
            value={{
                currentQuery,
                currentPage: page,
                searchFleetItems,
            }}
        >
            <FullHeightMinWidthScreen>
                <ScrollableTableFixedHeader>
                    <Flex
                        justifyContent="space-between"
                        mb={currentView !== "exports" ? 3 : 1}
                        alignItems="center"
                    >
                        <Text>
                            {formatNumber(totalFleetItemsCount) +
                                " " +
                                t(
                                    "common.vehicles",
                                    {smart_count: totalFleetItemsCount ?? 2},
                                    {capitalize: true}
                                )}
                        </Text>

                        <Box>
                            <Flex alignItems="baseline" justifyContent="flex-end">
                                <IconButton
                                    data-testid="fleet-screen-list-view-button"
                                    name="list"
                                    label={t("common.list")}
                                    onClick={updateQuery.bind(
                                        undefined,
                                        {view: View.Fleet},
                                        "push"
                                    )}
                                    mx={2}
                                    color={currentView === View.Fleet ? "blue.default" : undefined}
                                />
                                <IconButton
                                    data-testid="fleet-screen-exports-view-button"
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

                {currentView === View.Fleet && (
                    <Flex overflow="hidden" px={3} pb={3} flexDirection="column">
                        <Flex alignItems="center" flexWrap="wrap" pb={2} style={{gap: "8px"}}>
                            <FleetFilteringBar
                                currentQuery={currentQuery}
                                updateQuery={updateQuery}
                            />
                            <Flex alignItems="center" justifyContent="flex-end">
                                <ExportUnavailabilityButton type="plates" />
                                {listActionButtons}
                            </Flex>
                        </Flex>
                        <Table
                            height="auto"
                            columns={getFleetColumns()}
                            sortableColumns={sortableColumns}
                            ordering={
                                currentQuery.ordering
                                    ? {
                                          [currentQuery.ordering.replace("-", "")]:
                                              currentQuery.ordering.includes("-") ? "desc" : "asc",
                                      }
                                    : undefined
                            }
                            withSelectableRows
                            selectedRows={currentSelection.reduce(
                                (acc, uid) => {
                                    acc[uid] = true;
                                    return acc;
                                },
                                {} as Record<string, boolean>
                            )}
                            onSelectRow={onSelectFleetItem}
                            onSelectAllVisibleRows={onSelectAllVisibleFleetItems}
                            onSelectAllRows={selectAllFleetItems}
                            allRowsSelected={allFleetItemsSelected}
                            allVisibleRowsSelectedMessage={t("components.selectedVehiclesCount", {
                                smart_count: pageFleetItemsCount,
                            })}
                            selectAllRowsMessage={t("components.selectAllVehiclesCount", {
                                count: totalFleetItemsCount,
                            })}
                            allRowsSelectedMessage={t("components.allVehiclesSelectedCount", {
                                count: totalFleetItemsCount,
                            })}
                            onOrderingChange={onOrderingChange}
                            onClickOnRow={(item) => setPreviewFleetItem(item)}
                            rows={fleetItems}
                            getRowId={(row) => getFleetItemId(row)}
                            getRowKey={(row) => getFleetItemId(row)}
                            getRowTestId={(row) =>
                                row.type === "vehicle" ? "vehicle-row" : "trailer-row"
                            }
                            getRowCellContent={getRowCellContent}
                            isLoading={isLoading}
                            hasNextPage={hasNextPage}
                            onEndReached={onEndReached}
                            data-testid="settings-plates-table"
                            overrideHeader={renderTableHeader()}
                        />
                    </Flex>
                )}
                {currentView === View.Exports && (
                    <Flex overflow="hidden" px={3} pb={3} flexDirection="column">
                        <Exports
                            dataTypes={["fleet_unavailabilities", "fleet_planning"]}
                            height="100%"
                            pt={3}
                        />
                    </Flex>
                )}

                {previewedFleetItem && (
                    <FloatingPanel
                        width={0.4}
                        minWidth={600}
                        onClose={setPreviewFleetItem.bind(undefined, null)}
                        data-testid="preview-fleet-item-panel"
                    >
                        <Flex pt={2} pr={2} justifyContent="flex-end" mb={-3}>
                            <IconButton
                                name="openInNewTab"
                                onClick={() =>
                                    window.open(
                                        `/app/fleet/${
                                            previewedFleetItem.type === "vehicle"
                                                ? "vehicles"
                                                : "trailers"
                                        }/${previewedFleetItem.pk}`,
                                        "_blank"
                                    )
                                }
                            />
                        </Flex>
                        <FleetUnitScreen
                            itemPk={previewedFleetItem.pk}
                            itemType={previewedFleetItem.type}
                            onDelete={setPreviewFleetItem.bind(undefined, null)}
                        />
                    </FloatingPanel>
                )}
            </FullHeightMinWidthScreen>
        </FleetScreenContext.Provider>
    );

    function renderTableHeader() {
        return currentSelection.length > 0 ? (
            <Flex alignItems="center">
                <Text>
                    {t("bulkActions.countSelectedVehicles", {
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
                <BulkDeleteFleetButton
                    fleetItems={fleetItems}
                    currentSelection={currentSelection}
                    onDeleteDone={() => searchFleetItems(currentQuery)}
                />
            </Flex>
        ) : null;
    }
}
