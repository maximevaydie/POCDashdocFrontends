import {
    fetchUpdateManager,
    getCompanySetting,
    getConnectedManager,
    useBaseUrl,
    useCurrentQueryAndView,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Flex,
    IconButton,
    NoWrap,
    Table,
    TabTitle,
    ColumnDirection,
    Text,
    TableProps,
    WrapXLines,
} from "@dashdoc/web-ui";
import {ScrollableTableFixedHeader} from "@dashdoc/web-ui";
import {formatDate, formatNumber, useEffectExceptOnMount, useToggle} from "dashdoc-utils";
import sumBy from "lodash.sumby";
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
    getInvoicesOrCreditNotesQueryParamsFromFiltersQuery,
    parseInvoicingQueryString,
    InvoicesListQuery,
    InvoiceSortableColumnName,
    InvoicesOrCreditNotesListQuery,
} from "app/features/filters/deprecated/utils";
import {BulkActions} from "app/features/pricing/invoices/actions/BulkActions";
import {InvoicePreviewIcon} from "app/features/pricing/invoices/InvoicePreviewIcon";
import {InvoicesFilteringBar} from "app/features/pricing/invoices/InvoicesFilteringBar";
import {
    DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS,
    INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
    InvoicesOrCreditNotesSettingsSchema,
} from "app/features/pricing/invoices/invoicesSettingsView";
import {CancelInvoicesReloadContext} from "app/features/pricing/invoices/useInvoiceEventHandler";
import {fetchSearchInvoices} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {SearchQuery} from "app/redux/reducers/searches";
import {
    getInvoicesCurrentQueryLoadingStatus,
    getInvoicesForCurrentQuery,
} from "app/redux/selectors";
import {getCreditNotesByStatus} from "app/services/invoicing/invoice.service";
import {InvoiceExportAction} from "app/taxation/invoicing/features/invoice-or-credit-note/actions/export/InvoiceExportAction";
import {InvoiceDueDate} from "app/taxation/invoicing/features/invoice-or-credit-note/detail-recap/InvoiceDueDate";
import {EmailsRecap} from "app/taxation/invoicing/features/invoice-or-credit-note/emails/EmailsRecap";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {
    getInvoiceStatusLabel,
    getStatusBadgeVariant,
} from "app/taxation/invoicing/services/invoiceOrCreditNoteStatus";
import {SidebarTabNames} from "app/types/constants";

import type {
    CreditNoteLink,
    Invoice,
    PartialInvoice,
} from "app/taxation/invoicing/types/invoice.types";

type InvoicesListProps = {
    setPreviewInvoice: (invoiceUid: PartialInvoice["uid"] | null) => void;
};

type InvoiceColumnName =
    | "debtor"
    | "document_number"
    | "price"
    | "price_with_vat"
    | "nb_of_transports"
    | "period"
    | "status"
    | "created"
    | "shared_emails"
    | "reminders"
    | "invoicing_date"
    | "due_date"
    | "file"
    | "tracking_payment"
    | "payment_notes";

type InvoiceColumn = {name: InvoiceColumnName; width: string; getLabel: () => string};

const allInvoiceColumns: InvoiceColumn[] = [
    {width: "13em", getLabel: () => t("common.customerToInvoice"), name: "debtor"},
    {width: "9em", getLabel: () => t("common.createdOn"), name: "created"},
    {width: "10em", getLabel: () => t("invoice.documentNumber"), name: "document_number"},
    {width: "8em", getLabel: () => t("common.status"), name: "status"},
    {width: "9em", getLabel: () => t("settings.totalNoVAT"), name: "price"},
    {width: "9em", getLabel: () => t("settings.totalWithVAT"), name: "price_with_vat"},
    {width: "4em", getLabel: () => t("invoice.numberOfTransports"), name: "nb_of_transports"},
    {width: "12em", getLabel: () => t("dateRangePicker.label"), name: "period"},
    {width: "7em", getLabel: () => t("common.sharing"), name: "shared_emails"},
    {width: "7em", getLabel: () => t("common.reminder"), name: "reminders"},
    {width: "8em", getLabel: () => t("common.dueDate"), name: "due_date"},
    {width: "8em", getLabel: () => t("common.invoicingDate"), name: "invoicing_date"},
    {width: "10em", getLabel: () => t("invoice.trackingPayment"), name: "tracking_payment"},
    {width: "12em", getLabel: () => t("invoice.paymentNotes"), name: "payment_notes"},
    {width: "4em", getLabel: () => t("common.pdf"), name: "file"},
];
const invoiceColumnsNonDashdocInvoicing: InvoiceColumn[] = allInvoiceColumns.filter(
    (c) => c.name !== "due_date" && c.name !== "price_with_vat" && c.name !== "reminders"
);
const invoiceColumnsDashdocInvoicing: InvoiceColumn[] = allInvoiceColumns.filter(
    (c) => c.name !== "period"
);

const invoiceSortableColumns: {[column in InvoiceSortableColumnName]?: boolean} = {
    created: true,
    debtor: true,
    document_number: true,
    due_date: true,
    invoicing_date: true,
    status: true,
    shared_emails: true,
    reminders: true,
    price: true,
    price_with_vat: true,
};

const PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY = "invoices.predefinedColumnsWidth";
const predefinedColumnsWidthState = createPersistedState(PREDEFINED_COLUMNS_WIDTH_STORAGE_KEY);

export const InvoicesList: FunctionComponent<InvoicesListProps> = ({setPreviewInvoice}) => {
    const timezone = useTimezone();
    const baseUrl = useBaseUrl();
    const history = useHistory();
    const location = useLocation();
    const manager = useSelector(getConnectedManager);
    const managerSelectedColumns: string[] = manager?.invoice_columns ?? [
        "debtor",
        "document_number",
        "status",
        "price",
        "price_with_vat",
        "nb_of_transports",
        "shared_emails",
        "reminders",
        "due_date",
        "invoicing_date",
        "file",
    ];
    const [predefinedColumnsWidth, setPredefinedColumnsWidth] = predefinedColumnsWidthState<
        Partial<Record<InvoiceColumnName, string>>
    >({});

    const preventInitWithPersistentData = useCallback(
        (query: InvoicesOrCreditNotesListQuery) => {
            const invoicesQueryParams = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
                query,
                timezone
            );

            const isTheUserSearching = Object.values(invoicesQueryParams).some((value: any) =>
                Boolean(value !== undefined && value.length !== undefined ? value.length : value)
            );
            return isTheUserSearching;
        },
        [timezone]
    );

    const {currentQuery, updateQuery, selectedViewPk, updateSelectedViewPk} =
        useCurrentQueryAndView<InvoicesOrCreditNotesListQuery>({
            parseQueryString: parseInvoicingQueryString,
            queryValidation: InvoicesOrCreditNotesSettingsSchema.parse,
            defaultQuery: DEFAULT_INVOICES_OR_CREDIT_NOTES_SETTINGS,
            viewCategory: INVOICES_OR_CREDIT_NOTES_VIEW_CATEGORY,
            preventInitWithPersistedData: preventInitWithPersistentData,
        });

    const [selectedInvoices, setSelectedInvoices] = useState<Record<string, boolean>>({});
    const [allInvoicesSelected, selectAllInvoices, unselectAllInvoices] = useToggle();
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();
    const invoicePaymentSetting = useSelector<boolean>((state) => {
        const invoice_payment = getCompanySetting(state, "invoice_payment") as boolean | null;
        return invoice_payment ?? true;
    });

    const invoiceColumns = useMemo(() => {
        if (!hasDashdocInvoicingEnabled) {
            return invoiceColumnsNonDashdocInvoicing;
        }

        if (invoicePaymentSetting) {
            return invoiceColumnsDashdocInvoicing;
        }

        return invoiceColumnsDashdocInvoicing.filter(
            (c) => c.name !== "tracking_payment" && c.name !== "payment_notes"
        );
    }, [hasDashdocInvoicingEnabled, invoicePaymentSetting]);

    const {
        invoices = [],
        page = 1,
        hasNextPage,
        totalCount,
    } = useSelector(getInvoicesForCurrentQuery);

    const selectAllVisibleInvoices = (selected: boolean) => {
        unselectAllInvoices();
        const selectedInvoices = invoices.reduce((acc: Record<string, boolean>, {uid}) => {
            acc[uid] = selected;
            return acc;
        }, {});
        setSelectedInvoices(selectedInvoices);
    };

    const selectedInvoicesQuery: SearchQuery = useMemo(() => {
        if (allInvoicesSelected) {
            return getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(currentQuery, timezone);
        }
        let selectedInvoicesUids = [];
        for (const [uid, selected] of Object.entries(selectedInvoices)) {
            if (selected) {
                selectedInvoicesUids.push(uid);
            }
        }
        return {uid__in: selectedInvoicesUids};
    }, [allInvoicesSelected, currentQuery, timezone, selectedInvoices]);
    const selectedInvoicesCount = useMemo(() => {
        if (allInvoicesSelected) {
            return totalCount;
        }
        return Object.values(selectedInvoices).filter((selected: boolean) => !!selected).length;
    }, [allInvoicesSelected, totalCount, selectedInvoices]);

    const selectedRows = useMemo(() => {
        return Object.keys(selectedInvoices).filter((key) => selectedInvoices[key]);
    }, [selectedInvoices]);

    const isLoading = useSelector(getInvoicesCurrentQueryLoadingStatus);

    const dispatch = useDispatch();
    const {cancelInvoicesReload} = useContext(CancelInvoicesReloadContext);
    const fetchInvoices = useCallback(
        (query: InvoicesOrCreditNotesListQuery, page = 1) => {
            const queryParams = getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
                query,
                timezone
            );
            dispatch(fetchSearchInvoices("invoices", queryParams, page));
        },
        [dispatch, timezone]
    );

    const handleEndReached = useCallback(
        () => hasNextPage && fetchInvoices(currentQuery, page + 1),
        [hasNextPage, fetchInvoices, currentQuery, page]
    );

    //#region Effects
    useEffectExceptOnMount(() => {
        const newQuery = parseInvoicingQueryString(location.search);
        updateQuery(newQuery);
    }, [location.search]);

    useEffect(() => {
        fetchInvoices(currentQuery);
        cancelInvoicesReload();
        // unselect invoices as soon as the query change
        unselectAllInvoices();
        setSelectedInvoices({});
    }, [fetchInvoices, currentQuery, cancelInvoicesReload, unselectAllInvoices]);
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
                    }${orderField}` as InvoicesListQuery["ordering"],
                });
            }
        },
        [updateQuery]
    );

    const getSelectedColumnNames = (): TableProps["selectedColumnNames"] => {
        return managerSelectedColumns.filter((columnName: string) =>
            invoiceColumns.some((c) => c.name === columnName)
        );
    };

    const onSelectColumns = (newSelection: TableProps["selectedColumnNames"]) => {
        if (!manager) {
            return;
        }
        dispatch(
            fetchUpdateManager(
                manager.pk,
                {
                    invoice_columns: newSelection ?? [],
                },
                t("components.updatedColumns")
            )
        );
    };

    const getRowCellContent = (
        invoice: PartialInvoice | Invoice,
        columnName: InvoiceColumnName,
        index: number
    ) => {
        switch (columnName) {
            case "debtor":
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-debtor`}>
                        {invoice.debtor.name}
                    </NoWrap>
                );
            case "document_number":
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-document-number`}>
                        {invoice.document_number}
                    </NoWrap>
                );
            case "created":
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-created`}>
                        {formatDate(invoice.created, "P")}
                    </NoWrap>
                );
            case "due_date":
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-due-date`}>
                        <InvoiceDueDate
                            dueDate={invoice.due_date}
                            isLate={invoice.is_payment_late}
                            compact
                        />
                    </NoWrap>
                );
            case "invoicing_date":
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-invoicing-date`}>
                        {formatDate(invoice.invoicing_date, "P")}
                    </NoWrap>
                );
            case "price": {
                const totalPrice = parseFloat(invoice.total_price);
                const draftCreditNotes = getCreditNotesByStatus(invoice, ["draft"]);
                const finalizedCreditNotes = getCreditNotesByStatus(invoice, ["final"]);
                const paidCreditNotes = getCreditNotesByStatus(invoice, ["paid"]);

                return (
                    <Box>
                        <NoWrap
                            fontWeight="bold"
                            data-testid={`invoices-table-row-${index}-price`}
                            textAlign={"right"}
                        >
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: invoice.currency,
                            })}
                        </NoWrap>
                        {paidCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge
                                    variant="success"
                                    mt={1}
                                    fontSize={1}
                                    data-testid={`invoices-table-row-${index}-credit-note-price`}
                                    noWrap
                                >
                                    {getCreditNoteBadgeLabel(paidCreditNotes, invoice.currency)}
                                </Badge>
                            </Flex>
                        )}
                        {finalizedCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge
                                    variant="blue"
                                    mt={1}
                                    fontSize={1}
                                    data-testid={`invoices-table-row-${index}-credit-note-price`}
                                    noWrap
                                >
                                    {getCreditNoteBadgeLabel(
                                        finalizedCreditNotes,
                                        invoice.currency
                                    )}
                                </Badge>
                            </Flex>
                        )}
                        {draftCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge variant="neutral" mt={1} fontSize={1} noWrap>
                                    {t("common.draftCreditNotes", {
                                        smart_count: draftCreditNotes.length,
                                    })}
                                </Badge>
                            </Flex>
                        )}
                    </Box>
                );
            }
            case "price_with_vat": {
                const totalPrice = invoice.total_tax_amount
                    ? parseFloat(invoice.total_price) + parseFloat(invoice.total_tax_amount)
                    : null;
                const draftCreditNotes = getCreditNotesByStatus(invoice, ["draft"]);
                const finalizedCreditNotes = getCreditNotesByStatus(invoice, ["final"]);
                const paidCreditNotes = getCreditNotesByStatus(invoice, ["paid"]);

                return (
                    <Box>
                        <NoWrap
                            fontWeight="bold"
                            data-testid={`invoices-table-row-${index}-price-with-vat`}
                            textAlign={"right"}
                        >
                            {formatNumber(totalPrice, {
                                style: "currency",
                                currency: invoice.currency,
                            })}
                        </NoWrap>
                        {paidCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge
                                    variant="success"
                                    mt={1}
                                    fontSize={1}
                                    data-testid={`invoices-table-row-${index}-credit-note-price-with-vat`}
                                    noWrap
                                >
                                    {getCreditNoteBadgeLabel(
                                        paidCreditNotes,
                                        invoice.currency,
                                        true
                                    )}
                                </Badge>
                            </Flex>
                        )}
                        {finalizedCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge
                                    variant="blue"
                                    mt={1}
                                    fontSize={1}
                                    data-testid={`invoices-table-row-${index}-credit-note-price-with-vat`}
                                    noWrap
                                >
                                    {getCreditNoteBadgeLabel(
                                        finalizedCreditNotes,
                                        invoice.currency,
                                        true
                                    )}
                                </Badge>
                            </Flex>
                        )}
                        {draftCreditNotes.length > 0 && (
                            <Flex>
                                <Box flex={1} />
                                <Badge variant="neutral" mt={1} fontSize={1} noWrap>
                                    {t("common.draftCreditNotes", {
                                        smart_count: draftCreditNotes.length,
                                    })}
                                </Badge>
                            </Flex>
                        )}
                    </Box>
                );
            }
            case "nb_of_transports": {
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-nb-of-transports`}>
                        {invoice.transports_count}
                    </NoWrap>
                );
            }
            case "period": {
                const period = invoice.period;
                return (
                    <NoWrap data-testid={`invoices-table-row-${index}-period`}>
                        {period.first_loading_at && period.last_unloading_at ? (
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
                        communicationStatuses={invoice.communication_statuses}
                        email_type="share"
                    />
                );
            case "reminders":
                return (
                    <EmailsRecap
                        communicationStatuses={invoice.communication_statuses}
                        email_type="reminder"
                    />
                );
            case "status":
                return (
                    <Flex data-testid={`invoices-table-row-${index}-status`}>
                        <Badge variant={getStatusBadgeVariant(invoice.status)} fontSize={1} noWrap>
                            {getInvoiceStatusLabel(invoice.status)}
                        </Badge>
                    </Flex>
                );
            case "file":
                return (
                    <InvoicePreviewIcon
                        url={invoice.file}
                        data-testid={`invoices-table-row-${index}-file`}
                    />
                );
            case "tracking_payment":
                return (
                    <Flex flexDirection={"column"}>
                        <Text>
                            {t("common.date")}
                            {": "}
                            {invoice.paid_at ? formatDate(invoice.paid_at, "P") : "—"}
                        </Text>
                        <Text>
                            {t("common.mean")}
                            {": "}
                            {invoice.payment_method ? invoice.payment_method.name : "—"}
                        </Text>
                    </Flex>
                );
            case "payment_notes":
                return (
                    <WrapXLines numberOfLines={2}>
                        <Text>{invoice.payment_notes}</Text>
                    </WrapXLines>
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
        (selectedInvoicesCount ?? 0 > 0) ? (
            <Flex alignItems="center" justifyContent="flex-start">
                <Text>
                    {t("invoices.countSelectedInvoices", {
                        smart_count: selectedInvoicesCount,
                    })}
                </Text>
                <Box
                    ml={3}
                    height="2em"
                    borderLeftWidth={1}
                    borderLeftStyle="solid"
                    borderLeftColor="grey"
                />
                <BulkActions
                    currentQuery={currentQuery}
                    selectedRows={selectedRows}
                    allInvoicesSelected={allInvoicesSelected}
                    selectedInvoicesCount={selectedInvoicesCount}
                    selectedInvoicesQuery={selectedInvoicesQuery}
                />
            </Flex>
        ) : null;

    return (
        <Flex flexDirection="column" height="100%" pt={3}>
            <ScrollableTableFixedHeader>
                <Flex justifyContent="space-between" mb={3}>
                    <TabTitle
                        title={getTabTranslations(SidebarTabNames.INVOICE)}
                        detailText={`- ${t("common.invoicesCount", {
                            smart_count: totalCount || 0,
                            count: formatNumber(totalCount),
                        })}`}
                    />
                    <Flex alignItems="center">
                        <IconButton
                            data-testid="invoices-screen-exports-view-button"
                            name="exports"
                            label={t("common.exports")}
                            onClick={() => {
                                history.push(`${baseUrl}/invoices/exports/`);
                            }}
                        />
                        <Box mr={3} />
                        <InvoiceExportAction
                            currentQuery={getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
                                currentQuery,
                                timezone
                            )}
                            selectedInvoicesQuery={selectedInvoicesQuery}
                            selectedInvoicesCount={selectedInvoicesCount ?? 0}
                            selectedCreditNotesCount={0}
                            openedFrom="invoice"
                        />
                    </Flex>
                </Flex>
                <Box pt={3}>
                    <InvoicesFilteringBar
                        currentQuery={currentQuery}
                        selectedViewPk={selectedViewPk}
                        tab="invoices"
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
                        unselectAllInvoices();
                        setSelectedInvoices({...selectedInvoices, [uid]: selected});
                    }}
                    onSelectAllVisibleRows={selectAllVisibleInvoices}
                    onSelectAllRows={selectAllInvoices}
                    allRowsSelected={allInvoicesSelected}
                    selectedRows={selectedInvoices}
                    allVisibleRowsSelectedMessage={t("invoice.selectedInvoicesCount", {
                        smart_count: selectedInvoicesCount,
                    })}
                    selectAllRowsMessage={t("invoice.selectAllInvoices", {count: totalCount})}
                    allRowsSelectedMessage={t("invoice.allInvoicesAreSelected", {
                        count: totalCount,
                    })}
                    height={"calc(100vh - 18em)"}
                    columns={invoiceColumns}
                    sortableColumns={invoiceSortableColumns}
                    getColumnWidth={getColumnWidth}
                    setColumnWidth={setColumnWidth}
                    ordering={currentOrdering}
                    onOrderingChange={onOrderingChange}
                    onClickOnRow={(invoice) => setPreviewInvoice(invoice.uid)}
                    getRowCellIsClickable={(_, columnName) => {
                        return columnName !== "file";
                    }}
                    rows={invoices}
                    getRowId={(invoice) => invoice.uid}
                    getRowKey={(invoice) => invoice.uid}
                    getRowCellContent={getRowCellContent}
                    isLoading={isLoading}
                    hasNextPage={hasNextPage}
                    onEndReached={handleEndReached}
                    data-testid="invoice-table"
                    overrideHeader={renderTableHeader()}
                />
            </Flex>
        </Flex>
    );

    function getCreditNoteBadgeLabel(
        creditNotes: CreditNoteLink[],
        currency: string,
        with_vat?: boolean
    ) {
        const totalPrice = sumBy(creditNotes, (creditNote) =>
            with_vat
                ? parseFloat(creditNote.total_tax_free_amount) +
                  parseFloat(creditNote.total_tax_amount)
                : parseFloat(creditNote.total_tax_free_amount)
        );
        return `${t("common.creditNotes", {
            smart_count: creditNotes.length,
        })} : ${formatNumber(totalPrice, {
            style: "currency",
            currency: currency,
            maximumFractionDigits: 2,
        })}`;
    }
    function getColumnWidth(column: InvoiceColumn) {
        return predefinedColumnsWidth[column.name] ?? column.width ?? "auto";
    }
    function setColumnWidth(column: InvoiceColumn, width: string) {
        setPredefinedColumnsWidth((prev) => ({...prev, [column.name]: width}));
    }
};
