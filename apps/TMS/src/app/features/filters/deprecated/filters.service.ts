import {PeriodFilterProps} from "@dashdoc/web-common";

export type FilterType =
    | "date"
    | "dateTimePeriod"
    | "period"
    | "poolPeriod"
    | "site"
    | "address"
    | "shipper"
    | "carrier"
    | "company"
    | "creator"
    | "creatorMethod"
    | "trucker"
    | "truckerCarrier"
    | "transportType"
    | "tags"
    | "vehicle"
    | "trailer"
    | "fleetLicensePlates"
    | "hasVatNumber"
    | "hasTradeNumber"
    | "hasInvoicingRemoteId"
    | "fuelType"
    | "invitationStatus"
    | "debtor"
    | "customer"
    | "invoiceStatus"
    | "invoiceIsLate"
    | "timeout"
    | "is_order"
    | "transportInvoicingStatus"
    | "transportArchivedStatus";

export type FiltersProps<TQuery> = {
    currentQuery: TQuery;
    updateQuery: (newQuery: Partial<TQuery>, method?: "push" | "replace") => void;
    resetQuery?: () => void;
    resultLabel?: string;
    periodFilterProps?: PeriodFilterProps;
    buttonFilters?: React.ReactNode;
    poolPeriodFilterProps?: PeriodFilterProps;
    activeMainFilters: Array<FilterType>;
    activeSecondaryFilters?: Array<FilterType>;
    listActionButtons?: React.ReactNode;
    invoiceTab?: boolean;
    hideLabels?: boolean;
    hideBadges?: boolean;
    onNoResultFound?: (filter: FilterType) => void;
    periodDateBadgeFormat?: "yyyy-MM-dd'T'HH:mm" | "P";
};
