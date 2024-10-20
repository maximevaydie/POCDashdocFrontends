import {FilteringBar, useTimezone} from "@dashdoc/web-common";
import {usePaginatedFetch} from "@dashdoc/web-common/src/hooks/usePaginatedFetch";
import {t} from "@dashdoc/web-core";
import {Box, Modal, Table} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import {cloneDeep} from "lodash";
import React, {FunctionComponent, ReactNode, useCallback, useMemo, useState} from "react";
import {RouteComponentProps} from "react-router";

import {getDatetimeRangeFilter} from "app/features/filters/badges-and-selectors/datetime-range/datetimeRangeFilter.service";
import {getQueryDates} from "app/features/filters/deprecated/utils";
import {
    DEFAULT_WEBHOOK_LOG_SETTINGS,
    WebhookLogSettings,
    WebhookLogSettingsSchema,
} from "app/features/settings/api/webhook/webhokkFiltering.types";
import {getTimeoutFilter} from "app/features/settings/api/webhook/webhookTimeoutFilter.service";

type WebhookLogModalProps = {
    onClose: () => void;
    connectorPk: number;
} & RouteComponentProps;

interface WebhookEvent {
    created: string;
    sent: string;
    entity_uid: string;
    entity_type: "transport" | "trip";
    payload: JSON;
    event: string;
    retries: number;
    last_attempt_time: string;
}

interface WebhookLog {
    created: string;
    webhook_event: WebhookEvent;
    client_timeout: boolean;
    status_code: number;
    response_headers: JSON;
    response_body: JSON;
}

const JsonCell = ({value}: {value: JSON | undefined}) => {
    if (!value) {
        return <span>-</span>;
    }
    return (
        <Box maxHeight="200px" overflow="auto">
            <details>
                <pre>{JSON.stringify(value, undefined, 2)}</pre>
            </details>
        </Box>
    );
};

const WebhookLogModal: FunctionComponent<WebhookLogModalProps> = (props) => {
    const columns = [
        {name: "entity", label: t("settings.webhookLog.headers.entity"), width: "20%"},
        {name: "created", label: t("settings.webhookLog.headers.created"), width: "10%"},
        {name: "status_code", label: t("settings.webhookLog.headers.statusCode"), width: "5%"},
        {name: "client_timeout", label: t("settings.webhookLog.headers.timeout"), width: "5%"},
        {name: "payload", label: t("settings.webhookLog.headers.payload"), width: "20%"},
        {
            name: "response_headers",
            label: t("settings.webhookLog.headers.responseHeaders"),
            width: "20%",
        },
        {
            name: "response_body",
            label: t("settings.webhookLog.headers.responseBody"),
            width: "20%",
        },
    ];

    const timezone = useTimezone();
    const [currentQuery, setCurrentQuery] = useState<Partial<WebhookLogSettings>>({});
    const {
        items: logList,
        hasNext,
        isLoading,
        loadNext,
    } = usePaginatedFetch<WebhookLog>(`/webhook-v2-log/`, {
        ...formatQuery(),
        connector_id: props.connectorPk,
    });

    const onEndReached = useCallback(() => hasNext && loadNext(), [hasNext, loadNext]);

    const updateQuery = (newQuery: Partial<WebhookLogSettings>) => {
        setCurrentQuery((previous) => ({
            ...previous,
            ...newQuery,
        }));
    };

    function formatQuery(): Partial<WebhookLogSettings> {
        let queryParams = cloneDeep(currentQuery);
        const {cleaned_start_date: startDate, cleaned_end_date: endDate} = getQueryDates(
            currentQuery,
            timezone
        );

        if (startDate && endDate) {
            queryParams.start_date = startDate;
            queryParams.end_date = endDate;
        }

        const finalQuery: {[index: string]: number | string | boolean | string[]} = {
            ...queryParams,
        };

        for (var propName in finalQuery) {
            if (finalQuery[propName] === null || finalQuery[propName] === undefined) {
                delete finalQuery[propName];
            }
            if (propName === "text") {
                finalQuery["search"] = finalQuery[propName];
                delete finalQuery[propName];
            }
        }
        return finalQuery;
    }

    type RowType = {
        entity: ReactNode;
        created: ReactNode;
        payload: ReactNode;
        client_timeout: string;
        status_code: string;
        response_headers: ReactNode;
        response_body: ReactNode;
    };
    const rows: RowType[] = logList.map((log) => ({
        entity: (
            <Box>
                {log.webhook_event.entity_type} {log.webhook_event.entity_uid}
            </Box>
        ),
        created: <Box>{formatDate(log.created, "yyyy-MM-dd'T'HH:mm")}</Box>,
        payload: <JsonCell value={log.webhook_event?.payload} />,
        client_timeout: log.client_timeout.toString(),
        status_code: log.status_code ? log.status_code.toString() : "-",
        response_headers: <JsonCell value={log.response_headers} />,
        response_body: <JsonCell value={log.response_body} />,
    }));
    const getRowCellContent = useCallback((row: RowType, columnName: keyof RowType) => {
        return row[columnName];
    }, []);

    const filters = useMemo(() => [getDatetimeRangeFilter(), getTimeoutFilter()], []);

    const renderedLogs = (
        <Box height="100%">
            <FilteringBar<WebhookLogSettings>
                filters={filters}
                query={currentQuery}
                updateQuery={updateQuery}
                parseQuery={WebhookLogSettingsSchema.parse}
                resetQuery={DEFAULT_WEBHOOK_LOG_SETTINGS}
                data-testid="webhook-filtering-bar"
                searchEnabled={true}
            />
            <Box mt={4} />
            <Table
                maxWidth="100%"
                overflow="auto"
                maxHeight="55vh"
                columns={columns}
                isLoading={isLoading}
                rows={rows}
                getRowCellContent={getRowCellContent}
                onEndReached={onEndReached}
            />
        </Box>
    );

    return (
        <Modal
            title={t("settings.webhookLogModal.title")}
            width="95%"
            maxHeight="95%"
            onClose={props.onClose}
            mainButton={{onClick: props.onClose, children: t("common.close")}}
        >
            {renderedLogs}
        </Modal>
    );
};

export default WebhookLogModal;
