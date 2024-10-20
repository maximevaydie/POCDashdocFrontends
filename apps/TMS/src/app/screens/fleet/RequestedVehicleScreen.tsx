import {Arrayify, FilteringBar, getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Flex,
    Icon,
    IconButton,
    ColumnDirection,
    Table,
    Text,
    Badge,
} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import {
    RequestedVehicle,
    formatNumber,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useHistory, useLocation} from "react-router";

import RequestedVehicleDeleteModal from "app/features/fleet/requested-vehicle/RequestedVehicleDeleteModal";
import {RequestedVehicleModal} from "app/features/fleet/requested-vehicle/RequestedVehicleModal";
import {fetchSearchRequestedVehicles} from "app/redux/actions/requested-vehicles";
import {selectRows, unselectAllRows} from "app/redux/actions/selections";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getRequestedVehiclesCurrentQueryLoadingStatus,
    getRequestedVehiclesForCurrentQuery,
} from "app/redux/selectors/searches";
import {getRequestedVehiclesSelectionForCurrentQuery} from "app/redux/selectors/selections";
import {carbonFootprintConstants} from "app/services/carbon-footprint/constants.service";
import {REQUESTED_VEHICLE_QUERY_NAME} from "app/types/constants";

type RequestedVehicleColumn = "label" | "complementary_information" | "emission_rate";

const requestedVehicleColumns: {
    name: RequestedVehicleColumn;
    getLabel: () => string;
}[] = [
    {getLabel: () => t("components.requestedVehicle.label"), name: "label"},
    {
        getLabel: () => t("components.complementaryInformation"),
        name: "complementary_information",
    },
    {
        getLabel: () => t("components.requestedVehicle.emissionRate"),
        name: "emission_rate",
    },
];

export type RequestedVehicleScreenQuery = {
    text?: string[];
    ordering?:
        | "label"
        | "-label"
        | "complementary_information"
        | "-complementary_information"
        | "emission_rate"
        | "-emission_rate";
};

const parseQuery = (queryString: string): RequestedVehicleScreenQuery => {
    const parsedParams = parseQueryString(queryString, {
        arrayFormat: "comma",
    });

    return {
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
        ordering: parsedParams.ordering as RequestedVehicleScreenQuery["ordering"],
    };
};

export function RequestedVehicleScreen() {
    const location = useLocation();
    const history = useHistory();
    const [
        isAddRequestedVehicleModalOpened,
        openAddRequestedVehicleModal,
        closeAddRequestedVehicleModal,
    ] = useToggle(false);

    const dispatch = useDispatch();

    const [selectedRequestedVehicle, setSelectedRequestedVehicle] =
        useState<RequestedVehicle | null>(null);

    const {
        requestedVehicles = [],
        page = 1,
        hasNextPage,
        totalCount,
    } = useSelector(getRequestedVehiclesForCurrentQuery);
    // const currentSelection = useSelector(getRequestedVehiclesSelectionForCurrentQuery);
    const isLoading = useSelector(getRequestedVehiclesCurrentQueryLoadingStatus);

    const [currentQuery, setCurrentQuery] = useState(parseQuery(location.search)); // nosempgrep typescript.react.best-practice.react-props-in-state.react-props-in-state

    const searchRequestedVehicles = useCallback(
        async (query: RequestedVehicleScreenQuery, page = 1) => {
            dispatch(fetchSearchRequestedVehicles(REQUESTED_VEHICLE_QUERY_NAME, query, page));
        },
        [dispatch]
    );

    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);
    useEffect(() => {
        searchRequestedVehicles(currentQuery);
    }, [currentQuery, searchRequestedVehicles]);

    const updateQuery = useCallback(
        (newQuery: RequestedVehicleScreenQuery) =>
            history.replace({
                ...location,
                search: stringifyQueryObject(
                    {...currentQuery, ...newQuery},
                    {
                        skipEmptyString: true,
                        skipNull: true,
                        arrayFormat: "comma",
                    }
                ),
            }),
        [currentQuery, history, location]
    );

    const onEndReached = useCallback(
        () => hasNextPage && !isLoading && searchRequestedVehicles(currentQuery, page + 1),
        [hasNextPage, isLoading, searchRequestedVehicles, currentQuery, page]
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
                    }${orderField}` as RequestedVehicleScreenQuery["ordering"],
                });
            }
        },
        [updateQuery]
    );
    const ordering = useMemo<Record<string, ColumnDirection> | null>(
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

    const editRequestedVehicle = useCallback((requestedVehicle: RequestedVehicle) => {
        setSelectedRequestedVehicle(requestedVehicle);
    }, []);

    const currentSelection = useSelector(getRequestedVehiclesSelectionForCurrentQuery);

    const onSelectRequestedVehicle = useCallback(
        (requestedVehicle: RequestedVehicle, selected: boolean) => {
            dispatch(selectRows(selected, "requested-vehicles", [requestedVehicle.uid]));
        },
        [dispatch]
    );

    const onSelectAllVisibleRequestedVehicle = useCallback(
        (selected: boolean) => {
            dispatch(
                selectRows(
                    selected,
                    "requested-vehicles",
                    requestedVehicles?.map(({uid}) => uid) ?? []
                )
            );
        },
        [dispatch, requestedVehicles]
    );

    const [isDeleteModalOpened, openDeleteModal, closeDeleteModal] = useToggle(false);

    const getRowCellContent = useCallback(
        (item: RequestedVehicle, columnName: RequestedVehicleColumn) => {
            switch (columnName) {
                case "label":
                    return <Flex>{item.label}</Flex>;

                case "complementary_information":
                    return <Flex>{item.complementary_information}</Flex>;

                case "emission_rate":
                    return (
                        <Flex alignItems="center">
                            {formatNumber(item.emission_rate, {
                                maximumFractionDigits:
                                    carbonFootprintConstants.emissionRateMaxDigits,
                            })}{" "}
                            {t("components.carbonFootprint.unit")}
                            {item.default_for_carbon_footprint && (
                                <Badge ml={2} variant="neutral">
                                    {t("common.default")}
                                </Badge>
                            )}
                        </Flex>
                    );
            }
        },
        []
    );

    const connectedManager = useSelector(getConnectedManager);
    const canEditRequestedVehicle = managerService.hasAtLeastUserRole(connectedManager);

    return (
        <>
            <ScrollableTableFixedHeader>
                <Flex>
                    <FilteringBar<RequestedVehicleScreenQuery>
                        data-testid="requested-vehicles-filtering-bar"
                        filters={[]}
                        query={currentQuery}
                        updateQuery={updateQuery}
                        resetQuery={{text: []}}
                        searchEnabled
                    />
                    <Button
                        ml={2}
                        key="newvehicle"
                        variant="primary"
                        onClick={openAddRequestedVehicleModal}
                        data-testid="requested-vehicle-add-button"
                    >
                        <Icon mr={2} name="add" /> {t("common.new")}
                    </Button>
                </Flex>

                <Box pt={3} pb={2}>
                    <Flex justifyContent="space-between">
                        <Text data-testid="filters-number-of-results">
                            {formatNumber(totalCount) +
                                " " +
                                t(
                                    "components.requestedVehicle.count",
                                    {smart_count: totalCount ?? 0},
                                    {capitalize: true}
                                )}
                        </Text>
                        <>
                            {canEditRequestedVehicle && !!currentSelection.length && (
                                <IconButton
                                    name="bin"
                                    label={t("common.delete")}
                                    key="deleteFleetItem"
                                    onClick={openDeleteModal}
                                    ml={2}
                                    data-testid="requested-vehicle-delete-button"
                                />
                            )}
                        </>
                    </Flex>
                </Box>
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" px={3} pb={3} flexDirection="column">
                <Table
                    height="auto"
                    columns={requestedVehicleColumns}
                    onClickOnRow={editRequestedVehicle}
                    rows={requestedVehicles}
                    getRowId={(row) => row.uid}
                    getRowKey={(row) => row.uid}
                    getRowTestId={(row) => `requested-vehicle-row-${row.uid}`}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onEndReached={onEndReached}
                    withSelectableRows
                    selectedRows={currentSelection.reduce(
                        (acc, uid) => {
                            acc[uid] = true;
                            return acc;
                        },
                        {} as Record<string, boolean>
                    )}
                    onSelectRow={onSelectRequestedVehicle}
                    onSelectAllVisibleRows={onSelectAllVisibleRequestedVehicle}
                    sortableColumns={{
                        label: true,
                        complementary_information: true,
                        emission_rate: true,
                    }}
                    ordering={ordering}
                    onOrderingChange={onOrderingChange}
                />
            </Flex>

            {isAddRequestedVehicleModalOpened && (
                <RequestedVehicleModal
                    onSubmit={() => {
                        searchRequestedVehicles(currentQuery);
                    }}
                    onClose={closeAddRequestedVehicleModal}
                />
            )}

            {selectedRequestedVehicle !== null && (
                <RequestedVehicleModal
                    onSubmit={() => {
                        searchRequestedVehicles(currentQuery);
                    }}
                    requestedVehicle={selectedRequestedVehicle}
                    onClose={() => setSelectedRequestedVehicle(null)}
                />
            )}

            {isDeleteModalOpened && (
                <RequestedVehicleDeleteModal
                    closeDeleteModal={closeDeleteModal}
                    requestedVehicles={requestedVehicles}
                    isLoading={isLoading}
                    currentSelection={currentSelection}
                    onConfirm={() => {
                        dispatch(unselectAllRows("requested-vehicles"));
                        searchRequestedVehicles(currentQuery);
                    }}
                />
            )}
        </>
    );
}
