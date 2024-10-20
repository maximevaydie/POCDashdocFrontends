import {resolveMediaUrl} from "@dashdoc/core";
import {Arrayify, FilteringBar, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    BoxProps,
    ColumnDirection,
    Flex,
    IconButton,
    Link,
    Table,
    Text,
} from "@dashdoc/web-ui";
import {
    Export,
    ExportDataType,
    formatDate,
    formatNumber,
    parseAndZoneDate,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import Highlighter from "react-highlight-words";
import {useHistory} from "react-router";

import {fetchSearchExports} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {getExportsCurrentQueryLoadingStatus, getExportsForCurrentQuery} from "app/redux/selectors";

type ExportColum = keyof Export;

export type ExportsQuery = {
    text: string[];
    ordering?: string;
};

export const parseExportQuery = (queryString: string): ExportsQuery => {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
};

type ExportsProps = {
    dataTypes: Readonly<ExportDataType[]>;
} & BoxProps;

const NoExportsComponent: FunctionComponent<{}> = () => (
    <Box py={6} data-testid="exports-table-empty">
        <Text textAlign="center" color="grey.dark">
            {t("components.noExportFound")}
        </Text>
    </Box>
);

const columns: {id: ExportColum}[] = [
    {id: "created"},
    {id: "file_name"},
    {id: "data_type"},
    {id: "file_type"},
    {id: "url"},
];

export function Exports({dataTypes, ...props}: ExportsProps) {
    const history = useHistory();
    const dispatch = useDispatch();
    const isLoading = useSelector(getExportsCurrentQueryLoadingStatus);
    const {exports = [], page, hasNextPage, totalCount} = useSelector(getExportsForCurrentQuery);

    const [currentQuery, setCurrentQuery] = useState({
        ...parseExportQuery(location.search),
    });
    const [ordering, setOrdering] = useState<Record<string, ColumnDirection> | null>({});

    const fetchExports = useCallback(
        async (query: ExportsQuery, page = 1) =>
            await dispatch(
                fetchSearchExports(
                    "exports",
                    {
                        ...query,
                        data_type__in: dataTypes,
                    },
                    page
                )
            ),
        [currentQuery, dataTypes]
    );

    const updateQuery = useCallback(
        (newQuery: ExportsQuery) =>
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
        [currentQuery]
    );

    useEffectExceptOnMount(() => {
        const newQuery = parseExportQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);

    useEffect(() => {
        fetchExports(currentQuery);
    }, [currentQuery]);

    const searchedTexts = currentQuery.text ?? [];

    const sortableColumns = {created: true, file_name: true};
    const getQueryParameter = (ordering: ExportColum) => {
        switch (ordering) {
            case "file_name":
                return "file";
            default:
                return ordering;
        }
    };
    useEffect(() => {
        if (ordering && Object.keys(ordering).length) {
            const [columnName, direction] = Object.entries(ordering)[0];
            const queryParameter = getQueryParameter(columnName as ExportColum);
            updateQuery({
                ...currentQuery,
                ordering: (direction === "desc" ? "-" : "") + queryParameter,
            });
        } else {
            updateQuery({
                ...currentQuery,
                ordering: undefined,
            });
        }
    }, [ordering]);

    const getColumnName = (column: {id: ExportColum}) => column.id;
    const getColumnLabel = (column: {id: ExportColum}) => {
        switch (column.id) {
            case "created":
                return t("common.date");
            case "file_name":
                return t("common.name");
            case "file_type":
                return t("common.fileType");
            case "url":
                return t("common.link");
            case "data_type":
                return t("common.exportType");
            default:
                return "";
        }
    };

    const timezone = useTimezone();
    const getRowCellContent = (row: Export, columnName: ExportColum, index: number) => {
        switch (columnName) {
            case "created":
                return (
                    <Text
                        py={1}
                        variant="caption"
                        lineHeight={0}
                        textOverflow="ellipsis"
                        overflow="hidden"
                        data-testid={`exports-table-row-${index}-created`}
                    >
                        {row.created
                            ? formatDate(parseAndZoneDate(row.created, timezone), "PPPp")
                            : ""}
                    </Text>
                );
            case "file_name":
                return (
                    <Text
                        py={1}
                        variant="caption"
                        lineHeight={0}
                        ellipsis
                        data-testid={`exports-table-row-${index}-file_name`}
                    >
                        <Highlighter
                            autoEscape={true}
                            searchWords={searchedTexts}
                            textToHighlight={row.file_name}
                        />
                    </Text>
                );
            case "file_type":
                return (
                    <Text
                        py={1}
                        variant="caption"
                        lineHeight={0}
                        fontStyle="italic"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        data-testid={`exports-table-row-${index}-file_type`}
                    >
                        {row.file_type}
                    </Text>
                );
            case "url": {
                const url = resolveMediaUrl(row.url);

                return (
                    <Flex data-testid={`exports-table-row-${index}-link`}>
                        <Link href={url} style={{textDecoration: "none", display: "inline-block"}}>
                            <IconButton name="download" label={t("common.download")} />
                        </Link>
                    </Flex>
                );
            }
            case "data_type": {
                let data_type: string;
                switch (row.data_type) {
                    case "accounting":
                        data_type = t("invoiceExportList.accountingExport");
                        break;
                    case "invoices":
                        data_type = t("invoiceExportList.invoicesExport");
                        break;
                    default:
                        data_type = row.data_type;
                }
                return (
                    <Text
                        py={1}
                        variant="caption"
                        lineHeight={0}
                        textOverflow="ellipsis"
                        overflow="hidden"
                        data-testid={`exports-table-row-${index}-data_type`}
                    >
                        {data_type}
                    </Text>
                );
            }
            default:
                return (
                    <Text
                        variant="caption"
                        lineHeight={0}
                        textOverflow="ellipsis"
                        overflow="hidden"
                    >
                        {row[columnName]}
                    </Text>
                );
        }
    };

    const onEndReached = () => {
        if (hasNextPage && page !== undefined) {
            hasNextPage && fetchExports(currentQuery, page + 1);
        }
    };

    return (
        <Flex flexDirection="column" {...props}>
            <Box mt={2}>
                <FilteringBar<ExportsQuery>
                    filters={[]}
                    query={currentQuery}
                    updateQuery={updateQuery}
                    resetQuery={{text: []}}
                    searchEnabled
                    searchPlaceholder={t("components.searchByExportName")}
                    data-testid={"settings-exports-search"}
                />

                <Text my={3}>
                    {t("components.exportsCount", {
                        count: formatNumber(totalCount),
                        smart_count: totalCount ?? 2,
                    })}
                </Text>
            </Box>
            <Table
                height="auto"
                ListEmptyComponent={NoExportsComponent}
                columns={columns}
                getColumnName={getColumnName}
                getColumnLabel={getColumnLabel}
                sortableColumns={sortableColumns}
                ordering={ordering}
                onOrderingChange={setOrdering}
                rows={exports}
                getRowCellContent={getRowCellContent}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                onEndReached={onEndReached}
            />
        </Flex>
    );
}
