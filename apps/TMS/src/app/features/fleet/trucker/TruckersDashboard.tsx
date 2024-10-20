import {usePaginatedFetch, useSelector} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Flex,
    Text,
    Table,
    TabTitle,
    ColumnDirection,
    DateRangePicker,
    Callout,
    TooltipWrapper,
    ClickableBox,
    SortCriteriaOption,
    FullHeightMinWidthScreen,
    Button,
    Icon,
} from "@dashdoc/web-ui";
import {DeliveryDocumentType, formatDate, getLocaleData, TransportMessage} from "dashdoc-utils";
import {add, formatDuration} from "date-fns";
import isEqual from "lodash.isequal";
import React, {useCallback, useMemo, useState} from "react";
import {Helmet} from "react-helmet";
import createPersistedState from "use-persisted-state";

import {DisplayableDocument} from "app/features/document/DocumentModal";
import {DocumentsByTypePreview} from "app/features/document/DocumentsByTypePreview";
import {TruckerStatsExportModal} from "app/features/export/TruckerStatsExportModal";
import TruckerVersionCell from "app/features/fleet/trucker/trucker-version-cell";
import {SIDEBAR_TRANSPORTS_QUERY} from "app/features/sidebar/constants";
import {ICON_ORDER} from "app/features/transport/transports-list/TransportColumns";
import {RootState} from "app/redux/reducers";
import {TRANSPORTS_DONE_TAB, TRANSPORTS_ONGOING_TAB} from "app/types/businessStatus";

import {TruckersGlobalStats} from "./TruckersGlobalStats";

type TruckersDashboardColumn =
    | "name"
    | "last_login"
    | "ongoing_transports"
    | "created_transports"
    | "finished_transports"
    | "messages"
    | "app_version"
    | "average_duration_on_site";

type TruckersDashboardSortCriterion =
    | "user__last_name"
    | "user__last_login"
    | "ongoing_transports"
    | "created_transports"
    | "finished_transports"
    | "message_count"
    | "app_version"
    | "average_duration_on_site";

interface CreatedDocument {
    created: string;
    created_device?: string;
    document: string;
    document_type: string;
    uid: string;
    reference: string;
    author_company_id: number;
    extracted_reference: string;
}

interface TruckersStat {
    pk: number;
    display_name: string;
    last_login: string;
    ongoing_transports: number;
    created_transports: number;
    finished_transports: number;
    messages: CreatedDocument[];
    app_version: number;
    platform: string;
    readable_app_version: string;
    new_app_update_available: boolean;
    average_duration_on_site: string;
}

type TruckersDashboardQuery = {
    ordering?: string;
    date__gte: string;
    date__lte: string;
};

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "truckersDashboard.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

export function TruckersDashboard() {
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] = predefinedColumnsWidthState<
        Partial<Record<TruckersDashboardColumn, string>>
    >({});

    const [state, setState] = useState({
        exportTruckerStatsModalOpen: false,
    });
    const [currentQuery, setCurrentQuery] = useState<TruckersDashboardQuery>({
        // one week ago
        date__gte: formatDate(add(new Date(), {days: -7}), "yyyy-MM-dd"),
        date__lte: formatDate(new Date(), "yyyy-MM-dd"),
        ordering: "-user__last_login",
    });

    const realTimeMessages: TransportMessage[] = useSelector(
        (state: RootState) =>
            (state.entities.transportMessage && Object.values(state.entities.transportMessage)) ||
            [],
        isEqual
    );

    const {
        items: truckerStats,
        loadNext: onEndReached,
        isLoading: isLoading,
        hasNext: hasNextPage,
    } = usePaginatedFetch<TruckersStat>("/stats/truckers-list/", currentQuery, {
        apiVersion: "web",
    });

    const handleOrderingChange = useCallback(
        (newOrdering: Record<string, ColumnDirection> | null) => {
            const ordering = newOrdering
                ? `${Object.values(newOrdering)[0] === "desc" ? "-" : ""}${
                      Object.keys(newOrdering)[0]
                  }`
                : undefined;
            setCurrentQuery({
                ...currentQuery,
                ordering: ordering,
            });
        },
        [currentQuery]
    );

    const handleOngoingTransportClick = (truckerPk: number) => {
        let query = {
            ...SIDEBAR_TRANSPORTS_QUERY[TRANSPORTS_ONGOING_TAB],
            trucker__in: truckerPk,
        };

        window.open(`/app/transports/?${$.param(query)}`, "_blank");
    };

    const handleFinishedTransportClick = (truckerPk: number) => {
        let query = {
            ...SIDEBAR_TRANSPORTS_QUERY[TRANSPORTS_DONE_TAB],
            trucker__in: truckerPk,
            end_date: currentQuery.date__lte,
            start_date: currentQuery.date__gte,
        };

        window.open(`/app/transports/?${$.param(query)}`, "_blank");
    };

    const renderDocuments = useCallback((truckerPk: number, documents: CreatedDocument[]) => {
        let allDocuments: {
            [documentType: string]: DisplayableDocument[];
        } = {};

        for (let truckerStatsMessage of documents) {
            // When we update a document through the document modal, it adds or updates the message
            // in the state entities but does not update the one in the state trucker stats search.
            // So here we build the documents by looking first at the message in state entities.
            const realTimeMessage = realTimeMessages.find(
                ({uid}) => uid === truckerStatsMessage.uid
            );

            const message = realTimeMessage || truckerStatsMessage;

            if (!message.document_type || message.document_type === "") {
                message.document_type = "load_photo";
            }
            if (allDocuments[message.document_type] === undefined) {
                allDocuments[message.document_type] = [
                    {
                        url: message.document,
                        label: message.reference,
                        reference: message.reference,
                        extractedReference: message.extracted_reference,
                        authorCompanyId: message.author_company_id,
                        messageUid: message.uid,
                    },
                ];
            } else {
                allDocuments[message.document_type].push({
                    url: message.document,
                    label: message.reference,
                    reference: message.reference,
                    extractedReference: message.extracted_reference,
                    authorCompanyId: message.author_company_id,
                    messageUid: message.uid,
                });
            }
        }

        let sortedDocumentsIcons = ICON_ORDER.map((docType: DeliveryDocumentType) => {
            if (!allDocuments[docType]) {
                return null;
            }
            return (
                <DocumentsByTypePreview
                    key={`${docType}-${truckerPk}`}
                    documentType={docType}
                    documents={allDocuments[docType]}
                    documentOpenedFrom="truckers_dashboard"
                />
            );
        });

        return (
            <Flex key={`buttons-${truckerPk}`} marginTop={1}>
                {sortedDocumentsIcons}
            </Flex>
        );
    }, []);

    const getRowCellContent = (trucker: TruckersStat, columnName: TruckersDashboardColumn) => {
        switch (columnName) {
            case "name":
                return <Text>{trucker.display_name}</Text>;
            case "last_login":
                return <Text>{formatDate(trucker.last_login, "P")}</Text>;
            case "ongoing_transports":
                return (
                    <ClickableBox
                        onClick={() =>
                            trucker.ongoing_transports > 0 &&
                            handleOngoingTransportClick(trucker.pk)
                        }
                        disabled={trucker.ongoing_transports === 0}
                    >
                        <TooltipWrapper
                            content={t("dashboard.lookupTransports")}
                            hidden={trucker.ongoing_transports === 0}
                        >
                            <Text color="blue.default" textAlign="center">
                                {trucker.ongoing_transports}
                            </Text>
                        </TooltipWrapper>
                    </ClickableBox>
                );
            case "created_transports":
                return <Text textAlign="center">{trucker.created_transports}</Text>;
            case "finished_transports":
                return (
                    <ClickableBox
                        onClick={() =>
                            trucker.finished_transports > 0 &&
                            handleFinishedTransportClick(trucker.pk)
                        }
                        disabled={trucker.finished_transports === 0}
                    >
                        <TooltipWrapper
                            content={t("dashboard.lookupTransports")}
                            hidden={trucker.finished_transports === 0}
                        >
                            <Text color="blue.default" textAlign="center">
                                {trucker.finished_transports}
                            </Text>
                        </TooltipWrapper>
                    </ClickableBox>
                );
            case "messages":
                return renderDocuments(trucker.pk, trucker.messages);
            case "app_version":
                return <TruckerVersionCell trucker={trucker} />;
            case "average_duration_on_site":
                return (
                    <Text textAlign="center">
                        {(() => {
                            const [hours, minutes] = trucker.average_duration_on_site.split(":");
                            const hasHours = Number(hours) !== 0;

                            return formatDuration(
                                {
                                    hours: parseInt(hours),
                                    minutes: parseInt(minutes),
                                },
                                {
                                    locale: getLocaleData(),
                                    zero: true,
                                    // Don't display "0 hours"
                                    format: [...(hasHours ? ["hours"] : []), "minutes"],
                                }
                            );
                        })()}
                    </Text>
                );
        }
    };

    const ordering = useMemo((): Record<string, ColumnDirection> | undefined => {
        return currentQuery.ordering
            ? {
                  [currentQuery.ordering.replace("-", "")]: currentQuery.ordering.includes("-")
                      ? "desc"
                      : "asc",
              }
            : undefined;
    }, [currentQuery.ordering]);

    return (
        <FullHeightMinWidthScreen minWidth="1334px">
            <Helmet>
                <TabTitle title={t("sidebar.dashboard")} />
            </Helmet>
            <TruckersGlobalStats />
            <Flex justifyContent="space-between" my={4}>
                <Callout icon="info" variant="secondary" p={2}>
                    {t("truckerDashboard.selectedPeriodCallout")}
                </Callout>
                <Flex pb={1} alignItems="center" style={{gap: 10}}>
                    <Text color="grey.dark">{t("dashboard.selectedPeriod")}</Text>
                    <DateRangePicker
                        data-testid={"filters-period"}
                        label={t("common.fromDateToDate", {
                            start: formatDate(currentQuery.date__gte, "P"),
                            end: formatDate(currentQuery.date__lte, "P"),
                        })}
                        range={{
                            startDate: new Date(currentQuery.date__gte),
                            endDate: new Date(currentQuery.date__lte),
                        }}
                        onChange={(period) => {
                            setCurrentQuery({
                                ...currentQuery,
                                date__gte: formatDate(period.startDate, "yyyy-MM-dd"),
                                date__lte: formatDate(period.endDate, "yyyy-MM-dd"),
                            });
                        }}
                    />
                    <Button
                        onClick={() => setState({...state, exportTruckerStatsModalOpen: true})}
                    >
                        <Icon name="export" color="grey.white" mr={1} />
                        <Text color="grey.white">{t("common.export")}</Text>
                    </Button>
                </Flex>
            </Flex>
            <Table
                height="auto"
                mb={1}
                columns={getColumns()}
                sortableColumns={getSortCriteriaByColumnName()}
                rows={truckerStats}
                onEndReached={onEndReached}
                hasNextPage={hasNextPage}
                getRowCellContent={getRowCellContent}
                getRowId={(trucker) => `${trucker.pk}`}
                onOrderingChange={handleOrderingChange}
                ordering={ordering}
                isLoading={isLoading}
                narrowColumnGaps={true}
                getColumnWidth={getColumnWidth}
                setColumnWidth={setColumnWidth}
            />
            {state.exportTruckerStatsModalOpen && (
                <TruckerStatsExportModal
                    onClose={() => setState({...state, exportTruckerStatsModalOpen: false})}
                />
            )}
        </FullHeightMinWidthScreen>
    );

    function getColumnWidth(column: ReturnType<typeof getColumns>[0]) {
        return predefinedColumnsWidth[column.name] ?? "auto";
    }

    function setColumnWidth(column: ReturnType<typeof getColumns>[0], width: string) {
        setPredefinedColumnsWidth((prev) => ({...prev, [column.name]: width}));
    }
}

export const getSortCriteriaByColumnName = (): Record<
    string,
    Array<SortCriteriaOption<TruckersDashboardSortCriterion>>
> => {
    return {
        name: [{value: "user__last_name", label: t("common.name")}],
        last_login: [{value: "user__last_login", label: t("truckersList.lastLogin")}],
        ongoing_transports: [
            {value: "ongoing_transports", label: t("dashboard.ongoingTransports")},
        ],
        created_transports: [
            {value: "created_transports", label: t("dashboard.createdTransports")},
        ],
        finished_transports: [
            {value: "finished_transports", label: t("dashboard.finishedTransports")},
        ],
        messages: [{value: "message_count", label: t("dashboard.addedDocuments")}],
        app_version: [{value: "app_version", label: t("components.appVersion")}],
        average_duration_on_site: [
            {value: "average_duration_on_site", label: t("dashboard.averageTimeOnSite")},
        ],
    } as const;
};

function getColumns(): Array<{
    id: TruckersDashboardColumn;
    name: TruckersDashboardColumn;
    label: string;
}> {
    return [
        {
            id: "name",
            name: "name",
            label: t("common.driver"),
        },
        {
            id: "last_login",
            name: "last_login",
            label: t("truckersList.lastLogin"),
        },
        {
            id: "ongoing_transports",
            name: "ongoing_transports",
            label: t("dashboard.ongoingTransports"),
        },
        {
            id: "created_transports",
            name: "created_transports",
            label: t("dashboard.createdTransports"),
        },
        {
            id: "finished_transports",
            name: "finished_transports",
            label: t("dashboard.finishedTransports"),
        },
        {
            id: "average_duration_on_site",
            name: "average_duration_on_site",
            label: t("dashboard.averageTimeOnSite"),
        },
        {
            id: "messages",
            name: "messages",
            label: t("dashboard.addedDocuments"),
        },
        {
            id: "app_version",
            name: "app_version",
            label: t("dashboard.lastAppVersion"),
        },
    ];
}
