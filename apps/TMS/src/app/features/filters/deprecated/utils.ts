import {Arrayify} from "@dashdoc/web-common";
import {dateRangePickerStaticRanges} from "@dashdoc/web-ui";
import {formatDate, parseAndZoneDate, parseQueryString, zoneDateToISO} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

import {TabName} from "app/common/tabs";
import {TransportsScreenQuery} from "app/screens/transport/transports-screen/transports.types";
import {InvoiceStatus} from "app/taxation/invoicing/types/invoice.types";
import {
    ORDERS_DONE_OR_CANCELLED_TAB,
    ORDERS_TAB,
    TRANSPORTS_BILLING_TAB,
    TRANSPORTS_TAB,
} from "app/types/businessStatus";
import {BaseFilterParams} from "app/types/filters";

import {transportsOrderingParameterByColumnName} from "../../transport/transports-list/TransportColumns";

import type {
    LogisticPointsFilter,
    LogisticPointsQuery,
} from "app/features/address-book/logistic-points/types";

export type FilterQueryWithNavigationParameters = BaseFilterParams & {
    tab?: TabName;
    view?: string;
    isExtendedSearch?: boolean;
};

export type TransportsQueryParams = Partial<
    Omit<
        FilterQueryWithNavigationParameters,
        "view" | "period" | "start_date" | "end_date" | "type_of_dates"
    >
> & {
    real_date__in?: string[];
    planned_date__in?: string[]; // Warning: here planned corresponds to slots
    origin_address__in?: string[];
    destination_address__in?: string[];
    loading_date__in?: (string | null)[];
    unloading_date__in?: (string | null)[];
    date__in?: (string | null)[];
    timezone: string;
    business_status__in?: string[];
    has_dangerous_goods?: boolean;
    duration_on_site__gte?: string;
};

export type InvoiceSortableColumnName =
    | "created"
    | "-created"
    | "debtor"
    | "-debtor"
    | "document_number"
    | "-document_number"
    | "price"
    | "-price"
    | "price_with_vat"
    | "-price_with_vat"
    | "due_date"
    | "-due_date"
    | "invoicing_date"
    | "-invoicing_date"
    | "status"
    | "-status"
    | "shared_emails"
    | "-shared_emails"
    | "reminders"
    | "-reminders";

export type CreditNotesSortableColumnName =
    | "created"
    | "-created"
    | "customer"
    | "-customer"
    | "document_number"
    | "-document_number"
    | "price"
    | "-price"
    | "price_with_vat"
    | "-price_with_vat"
    | "due_date"
    | "-due_date"
    | "invoicing_date"
    | "-invoicing_date"
    | "status"
    | "-status"
    | "shared_emails"
    | "-shared_emails"
    | "reminders"
    | "-reminders";

// For the query string in the frontend
export type InvoicesListQuery = {
    text?: string[];
    customer__in?: string[];
    ordering?: InvoiceSortableColumnName;
    invoicing_start_date?: string | null;
    invoicing_end_date?: string | null;
    invoicing_period?: "week" | "last_week" | "month" | "last_month" | null;
    due_start_date?: string | null;
    due_end_date?: string | null;
    due_period?: "week" | "last_week" | "month" | "last_month" | null;
    transports_start_date?: string | null;
    transports_end_date?: string | null;
    transports_period?: "week" | "last_week" | "month" | "last_month" | null;
    status__in?: InvoiceStatus[];
    is_late?: boolean;
    payment_methods?: string[];
    payment_start_date?: string | null;
    payment_end_date?: string | null;
    payment_period?: "week" | "last_week" | "month" | "last_month" | null;
    is_bare?: boolean;
};

export type CreditNotesListQuery = {
    text?: string[];
    customer__in?: string[];
    ordering?: CreditNotesSortableColumnName;
    invoicing_start_date?: string | null;
    invoicing_end_date?: string | null;
    invoicing_period?: "week" | "last_week" | "month" | "last_month" | null;
    due_start_date?: string | null;
    due_end_date?: string | null;
    due_period?: "week" | "last_week" | "month" | "last_month" | null;
    transports_start_date?: string | null;
    transports_end_date?: string | null;
    transports_period?: "week" | "last_week" | "month" | "last_month" | null;
    is_bare?: boolean;
};

export type InvoicesOrCreditNotesListQuery = {
    text?: string[];
    customer__in?: string[];
    ordering?: InvoiceSortableColumnName | CreditNotesSortableColumnName;
    invoicing_start_date?: string | null;
    invoicing_end_date?: string | null;
    invoicing_period?: "week" | "last_week" | "month" | "last_month" | null;
    due_start_date?: string | null;
    due_end_date?: string | null;
    due_period?: "week" | "last_week" | "month" | "last_month" | null;
    transports_start_date?: string | null;
    transports_end_date?: string | null;
    transports_period?: "week" | "last_week" | "month" | "last_month" | null;
    status__in?: InvoiceStatus[];
    is_late?: boolean;
    payment_methods?: string[];
    payment_start_date?: string | null;
    payment_end_date?: string | null;
    payment_period?: "week" | "last_week" | "month" | "last_month" | null;
    is_bare?: boolean;
};

// For the API request to the backend
type InvoicesQueryParams = Exclude<
    InvoicesListQuery,
    | "text"
    | "invoicing_start_date"
    | "invoicing_end_date"
    | "invoicing_period"
    | "due_start_date"
    | "due_end_date"
    | "due_period"
    | "transports_start_date"
    | "transports_end_date"
    | "transports_period"
    | "payment_start_date"
    | "payment_end_date"
    | "payment_period"
> & {
    search?: string[]; // We use "text" in the screen query because the generic Filters component names the text search param "text", and we use it "search" in the API
    due_start?: string;
    due_end?: string;
    invoicing_start?: string;
    invoicing_end?: string;
    transports_start?: string;
    transports_end?: string;
    payment_start?: string;
    payment_end?: string;
};

type DatesQueryKeys = {
    start_date:
        | "start_date"
        | "loading_start_date"
        | "unloading_start_date"
        | "created_start_date";
    end_date: "end_date" | "loading_end_date" | "unloading_end_date" | "created_end_date";
    period: "period" | "loading_period" | "unloading_period" | "created_period";
};

export function getQueryDates(
    query: Partial<FilterQueryWithNavigationParameters>,
    timezone: string,
    keys: DatesQueryKeys = {start_date: "start_date", end_date: "end_date", period: "period"}
): Record<"cleaned_start_date" | "cleaned_end_date", string | null> {
    let start_date = query[keys.start_date];
    let end_date = query[keys.end_date];
    const period = query[keys.period];

    let cleanedDates: Record<"cleaned_start_date" | "cleaned_end_date", string | null> = {
        cleaned_start_date: null,
        cleaned_end_date: null,
    };

    if (start_date || end_date) {
        cleanedDates.cleaned_start_date = zoneDateToISO(start_date ?? null, timezone);
        cleanedDates.cleaned_end_date = zoneDateToISO(end_date ?? null, timezone);
    } else if (period) {
        const range = dateRangePickerStaticRanges[period]?.range;
        if (range) {
            cleanedDates.cleaned_start_date = zoneDateToISO(
                range.getStartDate() ?? null,
                timezone
            );
            cleanedDates.cleaned_end_date = zoneDateToISO(range.getEndDate() ?? null, timezone);
        }
    }

    return cleanedDates;
}

export const newGetInvoiceQueryDates = (
    query: InvoicesOrCreditNotesListQuery,
    start_date_key:
        | "payment_start_date"
        | "invoicing_start_date"
        | "due_start_date"
        | "transports_start_date",
    end_date_key:
        | "payment_end_date"
        | "invoicing_end_date"
        | "due_end_date"
        | "transports_end_date",
    period_key: "payment_period" | "invoicing_period" | "due_period" | "transports_period",
    timezone: string
): Record<"cleaned_start_date" | "cleaned_end_date", string | null> => {
    const startDate = query[start_date_key];
    const endDate = query[end_date_key];
    const period = query[period_key];

    let cleanedDates: Record<"cleaned_start_date" | "cleaned_end_date", string | null> = {
        cleaned_start_date: null,
        cleaned_end_date: null,
    };

    if (startDate || endDate) {
        cleanedDates.cleaned_start_date = formatDate(
            parseAndZoneDate(startDate ?? null, timezone),
            "yyyy-MM-dd"
        );
        cleanedDates.cleaned_end_date = formatDate(
            parseAndZoneDate(endDate ?? null, timezone),
            "yyyy-MM-dd"
        );
    } else if (period) {
        const range = dateRangePickerStaticRanges[period]?.range;
        if (range) {
            cleanedDates.cleaned_start_date = formatDate(
                range.getStartDate() ?? null,
                "yyyy-MM-dd"
            );
            cleanedDates.cleaned_end_date = formatDate(range.getEndDate() ?? null, "yyyy-MM-dd");
        }
    }

    return cleanedDates;
};

const getTransportCleanedQueryDates = (
    query: Partial<FilterQueryWithNavigationParameters> & TransportsQueryParams,
    timezone: string,
    hasFilteringImprovementsEnabled: boolean
) => {
    const TYPE_OF_DATE_TO_QUERY_DATE_RANGE = ["real", "planned", "loading", "unloading"];
    const TYPE_OF_DATE_TO_QUERY_DATE_COMPARISON = ["created"];
    const {type_of_dates = "real"} = query;

    const cleanedDates = getQueryDates(query, timezone);
    if (cleanedDates.cleaned_start_date === null && cleanedDates.cleaned_end_date === null) {
        return {};
    }

    if (TYPE_OF_DATE_TO_QUERY_DATE_RANGE.includes(type_of_dates)) {
        if (hasFilteringImprovementsEnabled) {
            return {};
        }
        const queryDateKey = `${type_of_dates}_date__in` as
            | "real_date__in"
            | "planned_date__in"
            | "loading_date__in"
            | "unloading_date__in"; //Warning: here planned will filter on slots (or created if there is no slots)

        return {
            [queryDateKey]: [cleanedDates.cleaned_start_date, cleanedDates.cleaned_end_date],
        };
    } else if (TYPE_OF_DATE_TO_QUERY_DATE_COMPARISON.includes(type_of_dates)) {
        const queryStartDatekey = `${type_of_dates}__gte`;
        const queryEndDatekey = `${type_of_dates}__lte`;

        return {
            [queryStartDatekey]: cleanedDates.cleaned_start_date,
            [queryEndDatekey]: cleanedDates.cleaned_end_date,
        };
    }

    return {};
};
const getTransportCleanedQueryDatesForOriginAndDestination = (
    query: Partial<FilterQueryWithNavigationParameters> & TransportsQueryParams,
    timezone: string
) => {
    const datesQuery = {} as {
        date__in?: (string | null)[];
        loading_date__in?: (string | null)[];
        unloading_date__in?: (string | null)[];
        created__gte?: string;
        created__lte?: string;
    };
    [
        {
            start_date: "start_date",
            end_date: "end_date",
            period: "period",
            range_key: "date__in",
        } as DatesQueryKeys & {range_key: "date__in"; range_keys: undefined},
        {
            start_date: "loading_start_date",
            end_date: "loading_end_date",
            period: "loading_period",
            range_key: "loading_date__in",
        } as DatesQueryKeys & {range_key: "loading_date__in"; range_keys: undefined},
        {
            start_date: "unloading_start_date",
            end_date: "unloading_end_date",
            period: "unloading_period",
            range_key: "unloading_date__in",
        } as DatesQueryKeys & {range_key: "unloading_date__in"; range_keys: undefined},
        {
            start_date: "created_start_date",
            end_date: "created_end_date",
            period: "created_period",
            range_keys: {start: "created__gte", end: "created__lte"},
        } as DatesQueryKeys & {
            range_key: undefined;
            range_keys: {start: "created__gte"; end: "created__lte"};
        },
    ].map((keys) => {
        let {cleaned_start_date: startDate, cleaned_end_date: endDate} = getQueryDates(
            query,
            timezone,
            keys
        );
        if (startDate || endDate) {
            if (keys.range_key) {
                datesQuery[keys.range_key] = [startDate, endDate];
            }
            if (keys.range_keys) {
                datesQuery[keys.range_keys.start] = startDate ?? undefined;
                datesQuery[keys.range_keys.end] = endDate ?? undefined;
            }
        }
    });

    return datesQuery;
};

export function parseInvoicingQueryString(queryString: string): InvoicesOrCreditNotesListQuery {
    const parsedParams = parseQueryString(queryString, {
        parseBooleans: true,
        arrayFormat: "comma",
    });

    return {
        ...parsedParams,
        customer__in: Arrayify(parsedParams.customer__in || []).map((t) => t.toString()),
        payment_methods: Arrayify(parsedParams.payment_methods || []).map((t) => t.toString()),
        status__in: Arrayify(parsedParams.status__in || []).map(
            (t) => t.toString() as InvoiceStatus
        ),
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
}

export function getInvoicesOrCreditNotesQueryParamsFromFiltersQuery(
    query: InvoicesOrCreditNotesListQuery,
    timezone: string
): InvoicesQueryParams {
    let {text, ...params} = cloneDeep(query);

    delete params.invoicing_start_date;
    delete params.invoicing_end_date;
    delete params.invoicing_period;
    delete params.due_start_date;
    delete params.due_end_date;
    delete params.due_period;

    if ("payment_start_date" in params) {
        delete params.payment_start_date;
    }
    if ("payment_end_date" in params) {
        delete params.payment_end_date;
    }
    if ("payment_period" in params) {
        delete params.payment_period;
    }

    const queryParams = params as InvoicesQueryParams;

    const {cleaned_start_date: invoicingStartDate, cleaned_end_date: invoicingEndDate} =
        newGetInvoiceQueryDates(
            query,
            "invoicing_start_date",
            "invoicing_end_date",
            "invoicing_period",
            timezone
        );
    if (invoicingStartDate && invoicingEndDate) {
        queryParams.invoicing_start = invoicingStartDate;
        queryParams.invoicing_end = invoicingEndDate;
    }

    const {cleaned_start_date: dueStartDate, cleaned_end_date: dueEndDate} =
        newGetInvoiceQueryDates(query, "due_start_date", "due_end_date", "due_period", timezone);
    if (dueStartDate && dueEndDate) {
        queryParams.due_start = dueStartDate;
        queryParams.due_end = dueEndDate;
    }

    const {cleaned_start_date: transportsStartDate, cleaned_end_date: transportsEndDate} =
        newGetInvoiceQueryDates(
            query,
            "transports_start_date",
            "transports_end_date",
            "transports_period",
            timezone
        );
    if (transportsStartDate && transportsEndDate) {
        queryParams.transports_start = transportsStartDate;
        queryParams.transports_end = transportsEndDate;
    }

    const {cleaned_start_date: paymentStartDate, cleaned_end_date: paymentEndDate} =
        newGetInvoiceQueryDates(
            query,
            "payment_start_date",
            "payment_end_date",
            "payment_period",
            timezone
        );
    if (paymentStartDate && paymentEndDate) {
        queryParams.payment_start = paymentStartDate;
        queryParams.payment_end = paymentEndDate;
    }

    queryParams.search = text;

    return queryParams;
}

export function getTransportsQueryParamsFromFiltersQuery(
    // remap parameters for backend
    // and remove local only parameters (like tab, view, etc.)
    query: FilterQueryWithNavigationParameters,
    timezone: string,
    hasFilteringImprovementsEnabled: boolean = false
): TransportsQueryParams {
    let cleanedQuery = cloneDeep(query) as Partial<FilterQueryWithNavigationParameters> &
        TransportsQueryParams;
    const queryKeysToIgnore = getTransportKeysToIgnore(query.tab);
    queryKeysToIgnore.map((key) => delete cleanedQuery[key]);

    const cleanedQueryDates = getTransportCleanedQueryDates(
        cleanedQuery,
        timezone,
        hasFilteringImprovementsEnabled
    );

    const otherCleanedQueryDates = hasFilteringImprovementsEnabled
        ? getTransportCleanedQueryDatesForOriginAndDestination(cleanedQuery, timezone)
        : {};

    cleanedQuery = {...cleanedQuery, ...cleanedQueryDates, ...otherCleanedQueryDates};
    if (cleanedQuery.ordering && typeof cleanedQuery.ordering === "string") {
        const columnName = cleanedQuery.ordering.replace("-", "");
        const backendColumnName = hasFilteringImprovementsEnabled
            ? columnName
            : transportsOrderingParameterByColumnName[columnName];
        if (backendColumnName === null) {
            delete cleanedQuery.ordering;
        } else {
            cleanedQuery.ordering = cleanedQuery.ordering.replace(columnName, backendColumnName);
        }
    }
    if (cleanedQuery.credit_note_document_number === null) {
        delete cleanedQuery.credit_note_document_number;
    }
    if (hasFilteringImprovementsEnabled) {
        computeBusinessStatuses(cleanedQuery);
    }

    delete cleanedQuery.view;
    delete cleanedQuery.period;
    delete cleanedQuery.start_date;
    delete cleanedQuery.end_date;
    delete cleanedQuery.type_of_dates;
    delete cleanedQuery.loading_period;
    delete cleanedQuery.loading_start_date;
    delete cleanedQuery.loading_end_date;
    delete cleanedQuery.unloading_period;
    delete cleanedQuery.unloading_start_date;
    delete cleanedQuery.unloading_end_date;
    delete cleanedQuery.created_period;
    delete cleanedQuery.created_start_date;
    delete cleanedQuery.created_end_date;
    delete cleanedQuery.tab;
    delete cleanedQuery.isExtendedSearch;
    return cleanedQuery;
}

export function getTransportKeysToIgnore(tab: TabName | undefined) {
    if (!tab || tab === "results") {
        return [];
    }
    const keys: Array<keyof TransportsScreenQuery> = [];
    if (TRANSPORTS_TAB !== tab) {
        keys.push("transport_status__in");
    }
    if (ORDERS_TAB !== tab) {
        keys.push("order_status__in");
    }
    if (
        ![
            ORDERS_DONE_OR_CANCELLED_TAB,
            ORDERS_TAB,
            TRANSPORTS_BILLING_TAB,
            TRANSPORTS_TAB,
        ].includes(tab)
    ) {
        keys.push("invoicing_status__in");
    }
    return keys;
}

function computeBusinessStatuses(
    cleanedQuery: Partial<FilterQueryWithNavigationParameters> & TransportsQueryParams
) {
    if (!cleanedQuery.business_status) {
        cleanedQuery.business_status__in = [
            ...(cleanedQuery.transport_status__in ?? []),
            ...(cleanedQuery.order_status__in ?? []),
        ];
        delete cleanedQuery.business_status;
    } else if (
        cleanedQuery.business_status === ORDERS_TAB &&
        cleanedQuery.order_status__in &&
        cleanedQuery.order_status__in?.length > 0
    ) {
        cleanedQuery.business_status__in = cleanedQuery.order_status__in;
        delete cleanedQuery.business_status;
    } else if (
        cleanedQuery.business_status === TRANSPORTS_TAB &&
        cleanedQuery.transport_status__in &&
        cleanedQuery.transport_status__in?.length > 0
    ) {
        cleanedQuery.business_status__in = cleanedQuery.transport_status__in;
        delete cleanedQuery.business_status;
    }
    delete cleanedQuery.transport_status__in;
    delete cleanedQuery.order_status__in;
}

export type CompaniesAndAddressesQueryParams = {
    query?: string[];
    text?: string[];
    has_vat_number?: boolean;
    has_trade_number?: boolean;
    invitation_status?: string;
    created__gte?: string;
    created__lte?: string;
    category?: string;
};

export function getPartnersQueryParamsFromFilterQuery(
    query: FilterQueryWithNavigationParameters,
    timezone: string
): CompaniesAndAddressesQueryParams {
    const cleanedQuery = cloneDeep(query) as Partial<FilterQueryWithNavigationParameters>;
    if (cleanedQuery.start_date || cleanedQuery.end_date) {
        if (cleanedQuery.start_date) {
            cleanedQuery.created__gte = zoneDateToISO(cleanedQuery.start_date, timezone) as string;
        }
        if (cleanedQuery.end_date) {
            cleanedQuery.created__lte = zoneDateToISO(cleanedQuery.end_date, timezone) as string;
        }
    } else if (cleanedQuery.period) {
        const range = dateRangePickerStaticRanges[cleanedQuery.period]?.range;
        if (range) {
            cleanedQuery.created__gte = zoneDateToISO(
                range.getStartDate() ?? null,
                timezone
            ) as string;
            cleanedQuery.created__lte = zoneDateToISO(
                range.getEndDate() ?? null,
                timezone
            ) as string;
        }
    }
    /**
     * hack to avoid having to change the backend behavior.
     * The new search bar expect to use the text parameter instead of query.
     * For now, we just rename the query parameter here.
     */
    const text = cleanedQuery.text;
    if (text) {
        cleanedQuery.query = text;
    }

    delete cleanedQuery.text;
    delete cleanedQuery.start_date;
    delete cleanedQuery.end_date;
    delete cleanedQuery.period;
    delete cleanedQuery.view;
    delete cleanedQuery.tab;
    return cleanedQuery as CompaniesAndAddressesQueryParams;
}

export function getLogisticPointsQueryParamsFromFilterQuery(
    query: LogisticPointsFilter,
    timezone: string
): LogisticPointsQuery {
    const {
        company,
        creation_method__in,
        has_coords_validated,
        has_instructions,
        has_security_protocol,
        text,
    } = query;
    const ordering = (query.ordering = query.ordering ?? "company_view__name");
    const cleanedQuery: LogisticPointsQuery = {
        category__in: ["origin", "destination"],
        ordering,
        company,
        creation_method__in,
        has_coords_validated,
        has_instructions,
        has_security_protocol,
        text,
    };
    if (query.start_date || query.end_date) {
        if (query.start_date) {
            cleanedQuery.created__gte = zoneDateToISO(query.start_date, timezone) as string;
        }
        if (query.end_date) {
            cleanedQuery.created__lte = zoneDateToISO(query.end_date, timezone) as string;
        }
    } else if (query.period) {
        const range = dateRangePickerStaticRanges[query.period]?.range;
        if (range) {
            cleanedQuery.created__gte = zoneDateToISO(
                range.getStartDate() ?? null,
                timezone
            ) as string;
            cleanedQuery.created__lte = zoneDateToISO(
                range.getEndDate() ?? null,
                timezone
            ) as string;
        }
    }
    return cleanedQuery;
}

export function getFiltersCount(filterKeys: string[], query: any) {
    return Object.entries(query).reduce((acc, [filterKey, filterValue]) => {
        if (!filterKeys.includes(filterKey) || !filterValue) {
            return acc;
        }

        if (Array.isArray(filterValue)) {
            return acc + filterValue.length;
        }

        return acc + 1;
    }, 0);
}
