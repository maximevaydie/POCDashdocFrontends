import {useBaseUrl, useCurrentQueryAndView, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Flex,
    IconButton,
    NoWrap,
    ColumnDirection,
    TableProps,
    TabTitle,
    Table,
    Text,
} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import {formatDate, formatNumber, useEffectExceptOnMount, useToggle} from "dashdoc-utils";
import React, {
    FunctionComponent,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {useHistory, useLocation} from "react-router";
import createPersistedState from "use-persisted-state";

import {getTabTranslations} from "app/common/tabs";
import {
    CreditNotesListQuery,
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    InvoicesOrCreditNotesListQuery,
    parseInvoicingQueryString,
} from "app/features/filters/deprecated/utils";
import {InvoicePreviewIcon} from "app/features/pricing/invoices/InvoicePreviewIcon";
import {InvoicesFilteringBar} from "app/features/pricing/invoices/InvoicesFilteringBar";
import {
    DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS,
    INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
    InvoicesOrCreditNotesSettingsSchema,
} from "app/features/pricing/invoices/invoicesSettingsView";
import {CancelInvoicesReloadContext} from "app/features/pricing/invoices/useInvoiceEventHandler";
import {fetchSearchCreditNotes} from "app/redux/actions/invoices";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {
    getCreditNotesForCurrentQuery,
    getInvoicesCurrentQueryLoadingStatus,
} from "app/redux/selectors/searches";
import {CreateBareCreditNoteAction} from "app/taxation/invoicing/features/credit-note/actions/CreateBareCreditNoteAction";
import {CreditNoteBulkActions} from "app/taxation/invoicing/features/credit-note/CreditNoteBulkActions";
import {CreditNotesTotalAmount} from "app/taxation/invoicing/features/credit-note/CreditNotesTotalAmount";
import {useCreditNoteListColumns} from "app/taxation/invoicing/features/credit-note/hooks/creditNoteListFilters";
import {useRefreshCreditNotes} from "app/taxation/invoicing/features/credit-note/hooks/useRefreshCreditNotes";
import {InvoiceExportAction} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportAction";
import {InvoiceDueDate} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/InvoiceDueDate";
import {EmailsRecap} from "app/taxation/invoicing/features/invoice-or-credit-note/emails/EmailsRecap";
import {
    getCreditNoteStatusLabel,
    getStatusBadgeVariant,
} from "app/taxation/invoicing/services/invoiceOrCreditNoteStatus";
import {SidebarTabNames} from "app/types/constants";

import type {CreditNote, CreditNoteInList} from "app/taxation/invoicing/types/creditNote.types";

type CreditNotesListProps = {
    setPreviewCreditNote: (creditNoteUid: string | null) => void;
};

type CreditNotesColumnName =
    | "customer"
    | "document_number"
    | "price"
    | "price_with_vat"
    | "nb_of_transports"
    | "period"
    | "status"
    | "created"
    | "shared_emails"
    | "invoicing_date"
    | "due_date"
    | "file";

type CreditNotesColumn = {name: CreditNotesColumnName; width: string; getLabel: () => string};

const allCreditNotesColumns: CreditNotesColumn[] = [
    {width: "13em", getLabel: () => t("common.customerToInvoice"), name: "customer"},
    {width: "9em", getLabel: () => t("common.createdOn"), name: "created"},
    {width: "10em", getLabel: () => t("creditNotes.documentNumber"), name: "document_number"},
    {width: "8em", getLabel: () => t("common.status"), name: "status"},
    {width: "9em", getLabel: () => t("settings.totalNoVAT"), name: "price"},
    {width: "9em", getLabel: () => t("settings.totalWithVAT"), name: "price_with_vat"},
    {width: "4em", getLabel: () => t("invoice.numberOfTransports"), name: "nb_of_transports"},
    {width: "12em", getLabel: () => t("dateRangePicker.label"), name: "period"},
    {width: "7em", getLabel: () => t("common.sharing"), name: "shared_emails"},
    {width: "8em", getLabel: () => t("common.dueDate"), name: "due_date"},
    {width: "8em", getLabel: () => t("common.invoicingDate"), name: "invoicing_date"},
    {width: "4em", getLabel: () => t("common.pdf"), name: "file"},
];

export type CreditNotesSortableColumnName = CreditNotesColumnName &
    (
        | "created"
        | "customer"
        | "document_number"
        | "due_date"
        | "invoicing_date"
        | "status"
        | "shared_emails"
    );

const CreditNotesSortableColumns: {[column in CreditNotesSortableColumnName]?: boolean} = {
    created: true,
    customer: true,
    document_number: true,
    due_date: true,
    invoicing_date: true,
    shared_emails: true,
    status: true,
};

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "invoices.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

export const CreditNotesList: FunctionComponent<CreditNotesListProps> = ({
    setPreviewCreditNote,
}) => {
    const timezone = useTimezone();
    const baseUrl = useBaseUrl();
    const history = useHistory();
    const location = useLocation();
    const {selectedColumns, setSelectedColumns} = useCreditNoteListColumns([
        "customer",
        "document_number",
        "status",
        "price",
        "price_with_vat",
        "nb_of_transports",
        "due_date",
        "invoicing_date",
        "shared_emails",
        "file",
    ]);
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] = predefinedColumnsWidthState<
        Partial<Record<CreditNotesColumnName, string>>
    >({});

    const {currentQuery, updateQuery, selectedViewPk, updateSelectedViewPk} =
        useCurrentQueryAndView<InvoicesOrCreditNotesListQuery>({
            parseQueryString: parseInvoicingQueryString,
            queryValidation: InvoicesOrCreditNotesSettingsSchema.parse,
            defaultQuery: DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS,
            viewCategory: INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
        });

    const [selectedCreditNotes, setSelectedCreditNotes] = useState<Record<string, boolean>>({});
    const [allCreditNotesSelected, selectAllCreditNotes, unselectAllCreditNotes] = useToggle();
    const refreshCreditNotes = useRefreshCreditNotes();
    const {
        creditNotes = [],
        page = 1,
        hasNextPage,
        totalCount,
    } = useSelector(getCreditNotesForCurrentQuery);

    const selectAllVisibleCreditNotes = (selected: boolean) => {
        unselectAllCreditNotes();
        const selectedCreditNotes = creditNotes.reduce((acc: Record<string, boolean>, {uid}) => {
            acc[uid] = selected;
            return acc;
        }, {});
        setSelectedCreditNotes(selectedCreditNotes);
    };

    const selectedCreditNotesQuery: SearchQuery = useMemo(() => {
        if (allCreditNotesSelected) {
            return getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(currentQuery, timezone);
        }
        let selectedCreditNotesUids = Object.keys(selectedCreditNotes).filter(
            (uid) => selectedCreditNotes[uid]
        );
        return {uid__in: selectedCreditNotesUids};
    }, [allCreditNotesSelected, currentQuery, timezone, selectedCreditNotes]);
    const selectedCreditNotesCount = useMemo(() => {
        if (allCreditNotesSelected) {
            return totalCount;
        }
        return Object.values(selectedCreditNotes).filter((selected: boolean) => !!selected).length;
    }, [allCreditNotesSelected, totalCount, selectedCreditNotes]);

    const isLoading = useSelector(getInvoicesCurrentQueryLoadingStatus);

    const dispatch = useDispatch();
    const {cancelInvoicesReload} = useContext(CancelInvoicesReloadContext);
    const fetchCreditNotes = useCallback(
        (query: InvoicesOrCreditNotesListQuery, page = 1) => {
            const queryParams = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
                query,
                timezone
            );
            dispatch(fetchSearchCreditNotes("creditNotes", queryParams, page));
        },
        [dispatch, timezone]
    );

    const handleEndReached = useCallback(
        () => hasNextPage && fetchCreditNotes(currentQuery, page + 1),
        [hasNextPage, fetchCreditNotes, currentQuery, page]
    );

    //#region Effects
    useEffectExceptOnMount(() => {
        const newQuery = parseInvoicingQueryString(location.search);

        updateQuery(newQuery);
    }, [location.search]);

    useEffect(() => {
        fetchCreditNotes(currentQuery);
        cancelInvoicesReload();
        // unselect credit-notes as soon as the query change
        unselectAllCreditNotes();
        setSelectedCreditNotes({});
    }, [fetchCreditNotes, currentQuery, cancelInvoicesReload, unselectAllCreditNotes]);
    //#endregion

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
                    }${orderField}` as CreditNotesListQuery["ordering"],
                });
            }
        },
        [updateQuery]
    );

    const getSelectedColumnNames = (): TableProps["selectedColumnNames"] => {
        return selectedColumns.filter((columnName: string) =>
            allCreditNotesColumns.some((c) => c.name === columnName)
        );
    };

    const onSelectColumns = (newSelection: TableProps["selectedColumnNames"]) => {
        if (newSelection === undefined) {
            return;
        }
        setSelectedColumns(newSelection);
    };

    const getRowCellContent = (
        creditNote: CreditNote | CreditNoteInList,
        columnName: CreditNotesColumnName,
        index: number
    ) => {
        switch (columnName) {
            case "customer":
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-customer`}>
                        {creditNote.customer.name}
                    </NoWrap>
                );
            case "document_number":
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-document-number`}>
                        {creditNote.document_number}
                    </NoWrap>
                );
            case "created":
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-created`}>
                        {formatDate(creditNote.created, "P")}
                    </NoWrap>
                );
            case "due_date":
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-due-date`}>
                        <InvoiceDueDate dueDate={creditNote.due_date} isLate={false} compact />
                    </NoWrap>
                );
            case "invoicing_date":
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-invoicing-date`}>
                        {formatDate(creditNote.invoicing_date, "P")}
                    </NoWrap>
                );
            case "price": {
                const totalPrice = parseFloat(creditNote.total_tax_free_amount);

                return (
                    <Box>
                        <NoWrap
                            fontWeight="bold"
                            data-testid={`credit-notes-table-row-${index}-price`}
                            textAlign={"right"}
                        >
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: creditNote.currency,
                            })}
                        </NoWrap>
                    </Box>
                );
            }
            case "price_with_vat": {
                const totalPrice = creditNote.total_tax_amount
                    ? parseFloat(creditNote.total_tax_free_amount) +
                      parseFloat(creditNote.total_tax_amount)
                    : null;

                return (
                    <Box>
                        <NoWrap
                            fontWeight="bold"
                            data-testid={`credit-notes-table-row-${index}-price-with-vat`}
                            textAlign={"right"}
                        >
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: creditNote.currency,
                            })}
                        </NoWrap>
                    </Box>
                );
            }
            case "nb_of_transports": {
                return (
                    <NoWrap data-testid={`credit-notes-table-row-${index}-nb-of-transports`}>
                        {creditNote.transports_count}
                    </NoWrap>
                );
            }
            case "period": {
                const period = creditNote.is_list_element ? creditNote.period : undefined;
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-period`}>
                        {period?.first_loading_at && period?.last_unloading_at ? (
                            <>
                                {formatDate(period.first_loading_at, "P")}
                                {" - "}
                                {formatDate(period.last_unloading_at, "P")}
                            </>
                        ) : (
                            <>{t("invoice.noPeriod")}</>
                        )}
                    </NoWrap>
                );
            }
            case "shared_emails":
                return (
                    <EmailsRecap
                        communicationStatuses={creditNote.communication_statuses}
                        email_type="share"
                    />
                );
            case "status":
                return (
                    <Flex data-testid={`credit-notes-table-row-${index}-status`}>
                        <Badge
                            variant={getStatusBadgeVariant(creditNote.status)}
                            fontSize={1}
                            data-testid={`credit-note-${index}-status-${creditNote.status}`}
                            noWrap
                        >
                            {getCreditNoteStatusLabel(creditNote.status)}
                        </Badge>
                    </Flex>
                );
            case "file":
                return (
                    <InvoicePreviewIcon
                        url={creditNote.file}
                        data-testid={`credit-notes-table-row-${index}-file`}
                    />
                );
        }
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

    const renderTableHeader = () =>
        (selectedCreditNotesCount ?? 0 > 0) ? (
            <Flex alignItems="center" justifyContent="flex-start">
                <Text>
                    {t("invoices.countSelectedInvoices", {
                        smart_count: selectedCreditNotesCount,
                    })}
                </Text>

                <Box
                    ml={3}
                    height="2em"
                    borderLeftWidth={1}
                    borderLeftStyle="solid"
                    borderLeftColor="grey"
                />
                <CreditNoteBulkActions
                    selectedCreditNotesCount={selectedCreditNotesCount}
                    selectedCreditNotesQuery={selectedCreditNotesQuery}
                />
                <Flex>
                    <CreditNotesTotalAmount
                        currentQuery={currentQuery}
                        allCreditNotesSelected={allCreditNotesSelected}
                        selectedCreditNotesQuery={selectedCreditNotesQuery}
                    />
                </Flex>
            </Flex>
        ) : null;

    return (
        <Flex flexDirection="column" height="100%" pt={3}>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3}>
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.CREDIT_NOTES)}
                        detailText={`- ${t("creditNotes.creditNotesCount", {
                            smart_count: totalCount || 0,
                            count: formatNumber(totalCount),
                        })}`}
                        data-testid={"credit-notes-screen-title"}
                    />
                    <Flex alignItems="center">
                        <IconButton
                            marginRight={3}
                            data-testid="credit-notes-screen-exports-view-button"
                            name="exports"
                            label={t("common.exports")}
                            onClick={() => {
                                history.push(`${baseUrl}/invoices/exports/`);
                            }}
                        />
                        <InvoiceExportAction
                            currentQuery={getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
                                currentQuery,
                                timezone
                            )}
                            selectedInvoicesQuery={selectedCreditNotesQuery}
                            selectedInvoicesCount={0}
                            selectedCreditNotesCount={selectedCreditNotesCount ?? 0}
                            openedFrom="credit_note"
                        />
                        <Box mr={3} />
                        <CreateBareCreditNoteAction
                            onSuccess={(newCreditNoteUid: string) => {
                                setPreviewCreditNote(newCreditNoteUid);
                                refreshCreditNotes();
                            }}
                        />
                    </Flex>
                </Flex>
                <Box pt={3}>
                    <InvoicesFilteringBar
                        currentQuery={currentQuery}
                        selectedViewPk={selectedViewPk}
                        tab="creditNotes"
                        updateQuery={updateQuery}
                        updateSelectedViewPk={updateSelectedViewPk}
                    />
                </Box>
            </ScrollableTableFixedHeader>
            <Flex overflow="hidden" p={3} flexDirection="column">
                <Table
                    withSelectableRows
                    withSelectableColumns
                    selectedColumnNames={getSelectedColumnNames()}
                    onSelectColumns={onSelectColumns}
                    onSelectRow={({uid}, selected) => {
                        unselectAllCreditNotes();
                        setSelectedCreditNotes({...selectedCreditNotes, [uid]: selected});
                    }}
                    onSelectAllVisibleRows={selectAllVisibleCreditNotes}
                    onSelectAllRows={selectAllCreditNotes}
                    allRowsSelected={allCreditNotesSelected}
                    selectedRows={selectedCreditNotes}
                    allVisibleRowsSelectedMessage={t("invoice.selectedInvoicesCount", {
                        smart_count: selectedCreditNotesCount,
                    })}
                    selectAllRowsMessage={t("invoice.selectAllInvoices", {count: totalCount})}
                    allRowsSelectedMessage={t("invoice.allInvoicesAreSelected", {
                        count: totalCount,
                    })}
                    height={"calc(100vh - 18em)"}
                    columns={allCreditNotesColumns}
                    sortableColumns={CreditNotesSortableColumns}
                    getColumnWidth={getColumnWidth}
                    setColumnWidth={setColumnWidth}
                    ordering={currentOrdering}
                    onOrderingChange={onOrderingChange}
                    onClickOnRow={(creditNote) => setPreviewCreditNote(creditNote.uid)}
                    getRowCellIsClickable={(_, columnName) => {
                        return columnName !== "file";
                    }}
                    rows={creditNotes}
                    getRowId={(creditNote) => creditNote.uid}
                    getRowKey={(creditNote) => creditNote.uid}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onEndReached={handleEndReached}
                    data-testid="credit-notes-table"
                    overrideHeader={renderTableHeader()}
                />
            </Flex>
        </Flex>
    );

    function getColumnWidth(column: CreditNotesColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: CreditNotesColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({...prev, [column.name]: width}));
    }
};
