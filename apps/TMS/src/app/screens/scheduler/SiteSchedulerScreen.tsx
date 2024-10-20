import {Arrayify} from "@dashdoc/web-common";
import {Box, Flex, FloatingPanel} from "@dashdoc/web-ui";
import {LoadingOverlay} from "@dashdoc/web-ui";
import {Screen} from "@dashdoc/web-ui";
import {formatDate, parseQueryString, stringifyQueryObject, usePrevious} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";
import {useHistory, useLocation} from "react-router";
import createPersistedState from "use-persisted-state";

import SiteScheduler from "app/features/scheduler/site-scheduler/site-scheduler";
import {SiteSchedulerSharedActivity} from "app/features/scheduler/site-scheduler/types";
import {fetchSiteSchedulerActivities} from "app/redux/actions/site-scheduler";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getLastTransportEvent} from "app/redux/selectors/realtime";
import {
    getSiteSchedulerSharedActivitiesCurrentQueryLoadingStatus,
    getSiteSchedulerSharedActivitiesForCurrentQuery,
} from "app/redux/selectors/searches";
import {CompanySelector} from "app/screens/scheduler/site-scheduler-filtering-bar/CompanySelector";
import {SiteSchedulerFilteringBar} from "app/screens/scheduler/site-scheduler-filtering-bar/SiteSchedulerFilteringBar";
import {TransportScreen} from "app/screens/transport/TransportScreen";
import {SidebarTabNames} from "app/types/constants";

const SITE_SCHEDULER_PREDEFINED_FILTERS_STORAGE_KEY = "siteScheduler.predefinedFilters";
const usePredefinedFilters = createPersistedState(SITE_SCHEDULER_PREDEFINED_FILTERS_STORAGE_KEY);

const TODAY = new Date();

export type SiteSchedulerQuery = {
    tab?: SidebarTabNames.SITE_SCHEDULER;
    date?: string | null;
    company?: string;
    shipper__in?: string[];
    carrier__in?: string[];
    shared_activity_id__in?: string[];
};

const parseQuery = (queryString: string): SiteSchedulerQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        // @ts-ignore
        date: null,
        ...parsedParams,
        shipper__in: Arrayify(parsedParams.shipper__in || []).map((t) => t.toString()),
        carrier__in: Arrayify(parsedParams.carrier__in || []).map((t) => t.toString()),
        tab: SidebarTabNames.SITE_SCHEDULER,
    };
};

const getCleanedQuery = (query: SiteSchedulerQuery) =>
    Object.entries({...query, tab: undefined})
        .filter(([, value]) => value !== undefined)
        .reduce(
            // @ts-ignore
            (acc, [key, value]: [string, string | boolean | string[]]) => {
                acc[key] = value;
                return acc;
            },
            {} as Record<string, string | boolean | string[]>
        );

type SiteSchedulerScreenProps = {};

export const SiteSchedulerScreen: FunctionComponent<SiteSchedulerScreenProps> = () => {
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const isLoading = useSelector(getSiteSchedulerSharedActivitiesCurrentQueryLoadingStatus);
    const {sharedActivities = []} = useSelector(getSiteSchedulerSharedActivitiesForCurrentQuery);

    const fetchSharedActivities = useCallback(
        async (query: SiteSchedulerQuery) =>
            // @ts-ignore
            await dispatch(fetchSiteSchedulerActivities(getCleanedQuery(query))),
        [dispatch]
    );

    const [selectedTransportUid, setSelectedTransportUid] = useState(null);
    const onCardSelected = (siteActivity: SiteSchedulerSharedActivity) =>
        // @ts-ignore
        setSelectedTransportUid(siteActivity.activities[0]?.transport?.uid);

    //#region query
    const [currentQuery, setCurrentQuery] = useState<SiteSchedulerQuery>({
        date: null,
        company: undefined,
        shipper__in: [],
        carrier__in: [],
    });

    const [predefinedFilters, setPredefinedFilters] = usePredefinedFilters<SiteSchedulerQuery>({
        date: null,
        company: undefined,
        shipper__in: [],
        carrier__in: [],
    });

    const updatePredefinedData = useCallback(
        () =>
            setPredefinedFilters({
                ...predefinedFilters,
                date: currentQuery.date,
                company: currentQuery.company,
                shipper__in: currentQuery.shipper__in,
                carrier__in: currentQuery.carrier__in,
            }),
        [currentQuery, predefinedFilters, setPredefinedFilters]
    );

    const [initDone, setInitDone] = useState(false);
    const initCurrentQuery = useCallback(() => {
        let query: SiteSchedulerQuery = {
            tab: SidebarTabNames.SITE_SCHEDULER,
            date: null,
            company: undefined,
            shipper__in: [],
            carrier__in: [],
        };

        const urlQueryString = location.search;
        if (urlQueryString) {
            query = {
                ...query,
                ...parseQuery(urlQueryString),
            };
        }

        if (!query?.date) {
            query.date = predefinedFilters.date ?? formatDate(new Date(), "yyyy-MM-dd");
        }
        if (!query?.company) {
            query.company = predefinedFilters.company;
        }
        // @ts-ignore
        if (!(query?.carrier__in?.length > 0)) {
            query.carrier__in = predefinedFilters.carrier__in;
        }
        // @ts-ignore
        if (!(query?.shipper__in?.length > 0)) {
            query.shipper__in = predefinedFilters.shipper__in;
        }

        setCurrentQuery(query);
        setInitDone(true);
    }, [location.search, predefinedFilters]);

    const updateQuery = useCallback(
        (query: SiteSchedulerQuery) =>
            setCurrentQuery((prevQuery) => {
                return {...prevQuery, ...query};
            }),
        []
    );
    const updateUrl = useCallback(
        () =>
            history.replace({
                ...location,
                search: stringifyQueryObject(currentQuery, {
                    skipEmptyString: true,
                    skipNull: true,
                    arrayFormat: "comma",
                }),
            }),
        [history, location, currentQuery]
    );

    useEffect(() => {
        initCurrentQuery();
    }, []);

    useEffect(() => {
        if (initDone) {
            updateUrl();
            updatePredefinedData();
        }
        fetchSharedActivities(currentQuery);
    }, [location.search, currentQuery, initDone]);
    //#endregion

    //#region Transports events
    const lastTransportEvent = useSelector(getLastTransportEvent);
    const previousTransportEvent = usePrevious(lastTransportEvent);
    const isTransportInSharedActivities = useCallback(
        (transportUid: string) => {
            if (sharedActivities) {
                return sharedActivities.some(
                    (sharedActivity) => sharedActivity.activities[0].transport.uid === transportUid
                );
            }

            return false;
        },
        [sharedActivities]
    );

    useEffect(() => {
        if (
            lastTransportEvent &&
            lastTransportEvent?.timestamp !== previousTransportEvent?.timestamp
        ) {
            const {
                data: {uid},
            } = lastTransportEvent;
            // @ts-ignore
            if (isTransportInSharedActivities(uid)) {
                fetchSharedActivities({
                    shared_activity_id__in: sharedActivities.map((sharedActivity) =>
                        sharedActivity.id.toString()
                    ),
                });
                fetchSharedActivities(currentQuery);
            }
        }
    }, [
        sharedActivities,
        isTransportInSharedActivities,
        lastTransportEvent,
        previousTransportEvent,
        currentQuery,
        fetchSharedActivities,
    ]);

    const [hasNoInvitedSites, setHasNoInvitedSites] = useState(false);

    //#region filters
    const LeftFilters = useMemo(
        () => (
            <Box flex="0 1 256px">
                <CompanySelector
                    currentQuery={currentQuery}
                    updateQuery={updateQuery}
                    onNoResultFound={() => {
                        setHasNoInvitedSites(true);
                    }}
                />
            </Box>
        ),
        [currentQuery, updateQuery]
    );

    const RightFilters = useMemo(
        () => (
            <Box width="50%">
                <SiteSchedulerFilteringBar query={currentQuery} updateQuery={updateQuery} />
            </Box>
        ),
        [currentQuery, updateQuery]
    );
    //#endregion

    return (
        <Screen
            style={{
                paddingLeft: "15px",
                paddingRight: "15px",
                position: "relative",
                overflowX: "hidden",
            }}
        >
            {isLoading && <LoadingOverlay />}
            <Flex
                flex={1}
                pt={3}
                pb={2}
                justifyContent="space-between"
                css={{
                    pointerEvents: `${hasNoInvitedSites ? "none" : "visible"}`,
                    opacity: `${hasNoInvitedSites ? "50%" : ""}`,
                }}
            >
                {LeftFilters}
                {RightFilters}
            </Flex>
            <SiteScheduler
                currentSiteId={Number(currentQuery.company)}
                updateQuery={updateQuery}
                currentDate={currentQuery.date ? new Date(currentQuery.date) : TODAY}
                slotsPerRow={2}
                siteActivities={sharedActivities}
                filters={currentQuery}
                onCardSelected={onCardSelected}
                hasNoInvitedSites={hasNoInvitedSites}
            />
            {selectedTransportUid && (
                <FloatingPanel
                    width={1 / 3}
                    minWidth={650}
                    onClose={setSelectedTransportUid.bind(undefined, null)}
                >
                    <TransportScreen transportUid={selectedTransportUid} />
                </FloatingPanel>
            )}
        </Screen>
    );
};
