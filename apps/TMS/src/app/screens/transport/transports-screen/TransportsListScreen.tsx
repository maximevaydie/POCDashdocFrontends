import {guid} from "@dashdoc/core";
import {useTimezone, useCurrentQueryAndView} from "@dashdoc/web-common";
import {BusinessStatus} from "@dashdoc/web-common/src/types/businessStatusTypes";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    FloatingPanel,
    FullHeightMinWidthScreen,
    ListEmptyNoResultsWithFilters,
    LoadingWheel,
    ScrollableTableFixedHeader,
    TabTitle,
    Text,
} from "@dashdoc/web-ui";
import {formatNumber, usePrevious, useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {RouteComponentProps} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {TransportsCountButtonFilters} from "app/features/filters/deprecated/TransportsCountButtonFilters";
import {getTransportsQueryParamsFromFiltersQuery} from "app/features/filters/deprecated/utils";
import {SIDEBAR_TRANSPORTS_QUERY} from "app/features/sidebar/constants";
import {BulkActions} from "app/features/transport/actions/bulk/BulkActions";
import {ExtendedSearchButton} from "app/features/transport/transports-list/extended-search-button";
import {TransportEmptyList} from "app/features/transport/transports-list/transport-empty-list/TransportEmptyList";
import {
    TransportsFilteringBar,
    getTransportFiltersDataType,
} from "app/features/transport/transports-list/TransportsFilteringBar";
import {TransportsList} from "app/features/transport/transports-list/TransportsList";
import {unselectAllRows} from "app/redux/actions/selections";
import {fetchSearchTransports, fetchSearchTransportsCount} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getTransportsCurrentQueryLoadingStatus,
    getTransportsForCurrentQuery,
} from "app/redux/selectors/searches";
import {getTransportsSelectionForCurrentQuery} from "app/redux/selectors/selections";
import {AssignationRuleSetup} from "app/screens/transport/transports-screen/components/AssignationRuleSetup";
import {ExportTabButton} from "app/screens/transport/transports-screen/components/ExportTabButton";
import {preselectedSortsState} from "app/screens/transport/transports-screen/hooks/usePreselectedSort";
import {useTransportEventHandler} from "app/screens/transport/transports-screen/hooks/useTransportEventHandler";
import {useTransportSelection} from "app/screens/transport/transports-screen/hooks/useTransportSelection";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";
import {
    TransportsUrlWithoutParametersError,
    baseParseQuery,
    transportScreenService,
} from "app/screens/transport/transports-screen/transportScreen.service";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {
    ORDERS_AWAITING_CONFIRMATION_TAB,
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_ONGOING_TAB,
    ORDERS_TAB,
    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
    ORDERS_TO_SEND_TO_CARRIER_TAB,
    TRANSPORTS_DONE_TAB,
    TRANSPORTS_ONGOING_TAB,
    TRANSPORTS_TAB,
    TRANSPORTS_TO_PLAN_TAB,
    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
    TransportBusinessStatuses,
    getFullPathToBusinessStatus,
} from "app/types/businessStatus";
import {TRANSPORTS_QUERY_NAME} from "app/types/constants";

import type {Transport} from "app/types/transport";

type TransportsScreenProps = RouteComponentProps & {};

const renderLoading = () => (
    <Flex flexDirection="column" alignItems="center" justifyContent="flex-start" py={8}>
        <LoadingWheel noMargin />
        <Text mt={4}>{t("screens.transports.searchInProgress")}</Text>
    </Flex>
);

export const TransportsListScreen: FunctionComponent<TransportsScreenProps> = (props) => {
    const {history, location} = props;
    const dispatch = useDispatch();
    const timezone = useTimezone();

    //#region to handle query and persistent view, query and sort
    const parseQueryString = useCallback(
        (queryString: string) => {
            try {
                return transportScreenService.getCurrentQueryFromUrl(queryString);
            } catch (e) {
                if (e instanceof TransportsUrlWithoutParametersError) {
                    const baseTransportsUrl = getFullPathToBusinessStatus("transports_to_approve");

                    history.push(baseTransportsUrl);

                    // Return the currentQuery for the page we redirect to so that the app doesn't
                    // crash in the meantime
                    return {
                        ...(baseParseQuery("", true) as TransportsScreenQuery),
                        ...TransportBusinessStatuses.transports_to_approve.query,
                    };
                } else {
                    throw e;
                }
            }
        },
        [history]
    );
    const preventInitWithPersistentData = useCallback(
        (query: TransportsScreenQuery) => {
            const transportQueryParams = getTransportsQueryParamsFromFiltersQuery(
                query,
                timezone,
                true
            );
            // We need to remove business_status from the
            // query because, although it IS a query param
            // that will go to the backend, it is ALWAYS here
            // and not indicator of the user searching something.
            const {business_status: _, ...transportQueryParamsWithoutBusinessStatus} =
                transportQueryParams;
            const isTheUserSearching = Object.values(
                transportQueryParamsWithoutBusinessStatus
            ).some((value: any) =>
                Boolean(value !== undefined && value.length !== undefined ? value.length : value)
            );
            return isTheUserSearching;
        },
        [timezone]
    );
    const tab = parseQueryString(location.search).tab;
    const {category, schema, DEFAULT_QUERY} = getTransportFiltersDataType(tab);

    const [preselectedSorts, setPreselectedSorts] = preselectedSortsState<
        Partial<Record<BusinessStatus | "results", string>>
    >({});

    const initialOrderingQuery = useMemo(() => {
        let ordering;
        if (tab && preselectedSorts[tab as BusinessStatus | "results"]) {
            ordering = preselectedSorts[tab as BusinessStatus | "results"];
        }
        return ordering ? {ordering} : undefined;
    }, [tab, preselectedSorts]);

    const [resetInitKey, setResetInitKey] = useState("");
    const [initDone, onInitDone, resetInitDone] = useToggle(false);

    const {
        currentQuery,
        updateQuery: updateCurrentQuery,
        selectedViewPk,
        updateSelectedViewPk,
    } = useCurrentQueryAndView<TransportsScreenQuery>({
        parseQueryString,
        defaultQuery: {...DEFAULT_QUERY, tab},
        viewCategory: category,
        preventInitWithPersistedData: preventInitWithPersistentData,
        initialOrderingQuery,
        persistedQueryValidation: schema.parse,
        resetInitKey,
        onInitDone,
    });

    const isTheUserSearching = preventInitWithPersistentData(currentQuery);

    //#endregion

    //#region Actions on current query
    const updateQuery = useCallback(
        (newQuery: Partial<TransportsScreenQuery>, method?: "push" | "replace") => {
            updateCurrentQuery(newQuery, method);

            if ("ordering" in newQuery) {
                setPreselectedSorts((prev) => ({
                    ...prev,
                    [currentQuery.tab]: newQuery.ordering,
                }));
            }
        },
        [currentQuery.tab, setPreselectedSorts, updateCurrentQuery]
    );

    const resetQuery = useCallback(() => {
        updateCurrentQuery({
            ...DEFAULT_QUERY,
            ...SIDEBAR_TRANSPORTS_QUERY[currentQuery.tab],
            tab: currentQuery.tab,
            business_status: currentQuery.business_status,
        });
        updateSelectedViewPk(undefined);
    }, [
        DEFAULT_QUERY,
        currentQuery.business_status,
        currentQuery.tab,
        updateCurrentQuery,
        updateSelectedViewPk,
    ]);
    //#endregion

    //#region fetch first page of transports on mount and as soon as the query change
    const previousTab = usePrevious(currentQuery.tab);
    const previousSearchText = usePrevious(currentQuery.text);

    useEffect(() => {
        if (!initDone) {
            return;
        }
        if (
            (previousTab && previousTab !== currentQuery.tab) ||
            (currentQuery.tab === "results" &&
                currentQuery.text?.join(",") !== "" &&
                previousSearchText !== undefined &&
                previousSearchText?.join(",") !== currentQuery.text?.join(","))
        ) {
            resetInitDone();
            setResetInitKey(guid());
            return;
        }
        fetchTransports();
        // unselect transports as soon as the query change
        dispatch(unselectAllRows(TRANSPORTS_QUERY_NAME));
    }, [currentQuery, initDone]);

    //#region Data from redux state and computed variables
    const isLoading = useSelector(getTransportsCurrentQueryLoadingStatus);

    const {
        transports,
        page: lastFetchedPage = 1,
        hasNextPage,
    } = useSelector(getTransportsForCurrentQuery);

    // @guidedtour[epic=redux, seq=7] Selectors
    // Sometimes we need to get data from the state, and we don't want to do it directly in the component.
    // To avoid redefining the same logic in several places, we define selectors that will return the data we need already transformed.
    const currentSelection = useSelector(getTransportsSelectionForCurrentQuery);

    const [previewedTransportUid, setPreviewedTransportUid] = useState<
        Transport["uid"] | undefined
    >();
    //#endregion

    const {
        onSelectTransport,
        onSelectAllVisibleTransports,
        selectedTransportsQuery,
        selectAllTransports,
        allTransportsCount,
        allTransportsCountOrZero,
        selectedTransportsCount,
        allTransportsSelected,
    } = useTransportSelection(transports, currentSelection, currentQuery);

    //#region Actions on transports, callbacks

    const fetchTransports = useCallback(
        (page = 1, refetchCount = true) => {
            const queryFilters = getTransportsQueryParamsFromFiltersQuery(
                currentQuery,
                timezone,
                true
            );
            if (refetchCount) {
                dispatch(fetchSearchTransportsCount(queryFilters));
            }
            dispatch(fetchSearchTransports(TRANSPORTS_QUERY_NAME, queryFilters, page));
        },
        [currentQuery]
    );

    const loadNextPageOfTransports = useCallback(
        () => hasNextPage && fetchTransports(lastFetchedPage + 1, false),
        [currentQuery, lastFetchedPage, hasNextPage]
    );
    //#endregion

    useTransportEventHandler(transports);

    return (
        <FullHeightMinWidthScreen pt={3}>
            {/* Header */}
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3} alignItems="center">
                    {/* Tab title */}
                    <TabTitle
                        title={getTabTranslations(currentQuery.tab)}
                        detailText={`- ${formatNumber(allTransportsCount)} ${t(
                            "common.transports",
                            {smart_count: allTransportsCount ?? 2}
                        )}`}
                    />
                    <Flex alignItems="center">
                        <ExportTabButton active={false} />

                        {
                            // TODO : PTC-784 cleanup
                            [
                                ORDERS_TO_SEND_TO_CARRIER_TAB,
                                ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
                            ].includes(currentQuery.tab /* <hack> */ as any) /* </hack> */ && (
                                <AssignationRuleSetup />
                            )
                        }
                    </Flex>
                </Flex>

                <TransportsFilteringBar
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    selectedViewPk={selectedViewPk}
                    updateSelectedView={updateSelectedViewPk}
                />
                {[
                    TRANSPORTS_TAB,
                    TRANSPORTS_TO_PLAN_TAB,
                    TRANSPORTS_TO_SEND_TO_TRUCKER_TAB,
                    TRANSPORTS_ONGOING_TAB,
                    TRANSPORTS_DONE_TAB,
                    ORDERS_TAB,
                    ORDERS_TO_ASSIGN_OR_DECLINED_TAB,
                    ORDERS_TO_SEND_TO_CARRIER_TAB,
                    ORDERS_AWAITING_CONFIRMATION_TAB,
                    ORDERS_ONGOING_TAB,
                    ORDERS_DONE_OR_CANCELLED_TAB,
                ].includes(currentQuery.tab) && (
                    <Flex ml={-1}>
                        <TransportsCountButtonFilters
                            currentQuery={currentQuery as TransportsScreenQuery}
                            updateQuery={updateQuery}
                            displayWithoutAlerts={
                                currentQuery.tab === TRANSPORTS_DONE_TAB ||
                                currentQuery.tab === ORDERS_DONE_OR_CANCELLED_TAB
                            }
                        />
                    </Flex>
                )}
            </ScrollableTableFixedHeader>

            <Flex overflow="hidden" p={3} flexDirection="column" flexGrow={1}>
                <TransportsList
                    // @ts-ignore
                    transports={transports}
                    // @ts-ignore
                    allTransportsCount={allTransportsCount}
                    isLoading={isLoading}
                    renderLoading={renderLoading}
                    renderNoResults={renderTransportListNoResults}
                    onEndReached={loadNextPageOfTransports}
                    hasNextPage={hasNextPage}
                    onSelectTransport={onSelectTransport}
                    onSelectAllVisibleTransports={onSelectAllVisibleTransports}
                    onSelectAllTransports={selectAllTransports}
                    allTransportsSelected={allTransportsSelected}
                    selectedTransports={currentSelection.reduce(
                        (acc, uid) => {
                            acc[uid] = true;
                            return acc;
                        },
                        {} as Record<string, boolean>
                    )}
                    onClickOnRow={(transport) => setPreviewedTransportUid(transport.uid)}
                    editingTransport={previewedTransportUid}
                    searchedTexts={currentQuery.text ?? []}
                    ordering={
                        currentQuery.ordering
                            ? {
                                  [currentQuery.ordering.replace("-", "")]:
                                      currentQuery.ordering.includes("-") ? "desc" : "asc",
                              }
                            : undefined
                    }
                    onOrderingChange={(newOrdering) =>
                        updateQuery({
                            ordering: !newOrdering
                                ? undefined
                                : `${Object.values(newOrdering)[0] === "desc" ? "-" : ""}${
                                      Object.keys(newOrdering)[0]
                                  }`,
                        })
                    }
                    currentTab={currentQuery.tab}
                    overrideHeader={renderTableHeader()}
                />
            </Flex>
            {/* Preview transport */}
            {previewedTransportUid && (
                <FloatingPanel
                    width={0.56}
                    minWidth={790}
                    onClose={() => setPreviewedTransportUid(undefined)}
                >
                    <TransportScreen transportUid={previewedTransportUid} />
                </FloatingPanel>
            )}
        </FullHeightMinWidthScreen>
    );

    function renderTransportListNoResults() {
        if (currentQuery.isExtendedSearch) {
            return (
                <Text width="100%" textAlign="center" py={8}>
                    {t("common.noResultFound")}
                </Text>
            );
        }

        if (!isTheUserSearching && currentQuery.business_status) {
            return <TransportEmptyList businessStatus={currentQuery.business_status} />;
        }

        return (
            <ListEmptyNoResultsWithFilters
                resetQuery={resetQuery}
                title={t("screens.transports.filters.noResults")}
                middleButton={
                    isTheUserSearching && (
                        <ExtendedSearchButton
                            data-testid="extended-search-button"
                            currentQuery={currentQuery}
                            onClick={() => {
                                updateQuery({
                                    // For display purposes. Ignored in HTTP requests.
                                    isExtendedSearch: true,
                                    // Just to remove it from the query param bar
                                    // since it might be misleading for us. Also
                                    // the query params serve as a global so it is
                                    // good to keep it tidy if another component parses it.
                                    archived: undefined,
                                    // Extended search means that we do not look into
                                    // a specific status
                                    business_status: undefined,
                                    tab: "results",
                                });
                            }}
                        />
                    )
                }
                data-testid="transport-list-render-no-results"
            />
        );
    }
    function renderTableHeader() {
        return selectedTransportsCount > 0 ? (
            <Flex alignItems="center">
                <Text>
                    {t("newBulkActions.countSelectedTransports", {
                        smart_count: selectedTransportsCount,
                    })}
                </Text>
                <Box
                    ml={3}
                    height="2em"
                    borderLeftWidth={1}
                    borderLeftStyle="solid"
                    borderLeftColor="grey.dark"
                />
                <BulkActions
                    currentQuery={currentQuery}
                    selectedRows={currentSelection}
                    selectedTransportsCount={selectedTransportsCount}
                    selectedTransportsQuery={selectedTransportsQuery}
                    allTransportsSelected={allTransportsSelected}
                    allTransportsCount={allTransportsCountOrZero}
                />
            </Flex>
        ) : null;
    }
};
