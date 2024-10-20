import {FilteringBar, getTagFilter, useFeatureFlag, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    Callout,
    dateRangePickerStaticRanges,
    Flex,
    Icon,
    IconButton,
    LoadingWheel,
    Popover,
    SelectAllRowsButton,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {HorizontalLine} from "@dashdoc/web-ui";
import {formatNumber, useToggle} from "dashdoc-utils";
import debounce from "lodash.debounce";
import React, {FunctionComponent, useCallback, useMemo, useState} from "react";

import {getAddressFilter} from "app/features/filters/badges-and-selectors/address/addressFilter.service";
import {getAddressByCriteriaFilter} from "app/features/filters/badges-and-selectors/address-by-criteria/AddressByCriteriaFilter.service";
import {getCustomerFilter} from "app/features/filters/badges-and-selectors/invoice/customer/customerFilter";
import {getShipperFilter} from "app/features/filters/badges-and-selectors/shipper/shipperFilter.service";
import {getTransportCreditNoteNumberFilterBadges} from "app/features/filters/badges-and-selectors/transport-custom/transportCreditNoteNumberFilterBadges.service";
import {getTransportDateRangeFilter} from "app/features/filters/badges-and-selectors/transport-date-range/transportDateRangeFilter.service";
import {
    getFiltersCount,
    getTransportsQueryParamsFromFiltersQuery,
} from "app/features/filters/deprecated/utils";
import {DEFAULT_TRANSPORTS_TO_INVOICE_SETTINGS} from "app/features/transport/transports-list/constant";
import {
    TransportsToInvoiceSettings,
    TransportsToInvoiceSettingsSchema,
} from "app/features/transport/transports-list/transportsSettingsView.types";
import {
    fetchTransportsTotalInvoicedPrice,
    getTransportTotalInvoicedPrice,
} from "app/services/invoicing/pricing.service";
import {CreateBareInvoiceAction} from "app/taxation/invoicing/features/bare-invoices/CreateBareInvoiceAction";
import {useRefreshInvoices} from "app/taxation/invoicing/hooks/useRefreshInvoices";
import {TransportsToInvoiceQuery} from "app/types/transport";

import {NoTransportToInvoiceMessage} from "./NoTransportToInvoiceMessage";
import {TransportsToInvoiceTransportCard} from "./TransportsToInvoiceTransportCard";

import type {Transport} from "app/types/transport";

type TransportsToInvoiceProps = {
    transports: Transport[];
    loadingTransports: boolean;
    transportsCount: number;
    selectedTransports: Set<Transport["uid"]>;
    currentQuery: TransportsToInvoiceQuery;
    allTransportsSelected: boolean;
    selectedTransportPriceCache: Record<Transport["uid"], number | null>;
    onSelectTransport: (transportUids: Transport["uid"], transportPrice: number | null) => void;
    onUnselectTransport: (transportUids: Transport["uid"]) => void;
    onShowTransportPreview: (transportUid: Transport["uid"]) => void;
    onSubmit: () => void;
    onPoolOfTransportsEndReached: () => void;
    onUpdateQuery: (
        newQuery: Partial<TransportsToInvoiceQuery>,
        method?: "push" | "replace"
    ) => void;
    onResetQuery: () => void;
    onSelectAllVisibleTransports: (selected: boolean) => void;
    onSelectAllTransports: () => void;
    setPreviewInvoice: (invoiceUid: string) => void;
};

const filtersKeys = [
    "address__in",
    "origin_address__in",
    "destination_address__in",
    "tags__in",
    "period",
    "start_date",
    "loading_period",
    "loading_start_date",
    "unloading_period",
    "unloading_start_date",
    "created_period",
    "created_start_date",
    "debtor__in",
    "shipper__in",
    "address_text",
    "address_postcode__in",
    "address_country__in",
    "origin_address_text",
    "origin_address_postcode__in",
    "origin_address_country__in",
    "destination_address_text",
    "destination_address_postcode__in",
    "destination_address_country__in",
    "credit_note_document_number",
];

export const TransportsToInvoice: FunctionComponent<TransportsToInvoiceProps> = ({
    transports,
    loadingTransports,
    selectedTransports,
    transportsCount,
    currentQuery,
    allTransportsSelected,
    selectedTransportPriceCache,
    onSelectTransport,
    onUnselectTransport,
    onShowTransportPreview,
    onSubmit,
    onPoolOfTransportsEndReached,
    onUpdateQuery,
    onResetQuery,
    onSelectAllVisibleTransports,
    onSelectAllTransports,
    setPreviewInvoice,
}) => {
    const timezone = useTimezone();
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    const [totalPriceOfAllSelectedTransports, setTotalPriceOfAllSelectedTransports] = useState<{
        isLoading: boolean;
        result: number | null;
    } | null>(null);

    const refreshInvoices = useRefreshInvoices();

    const [isMoreActionVisible, setMoreActionVisible, setMoreActionHidden] = useToggle();
    const debouncedOnScroll = debounce(({target}) => {
        if (
            !loadingTransports &&
            target.scrollHeight - target.clientHeight - target.scrollTop <= 50
        ) {
            onPoolOfTransportsEndReached();
        }
    }, 300);

    const onScroll = useCallback(
        (event: React.UIEvent<HTMLElement>) => {
            event.persist();
            debouncedOnScroll(event);
        },
        [debouncedOnScroll]
    );

    const _renderTransportsToInvoiceContent = () => {
        if (!loadingTransports && transports.length === 0) {
            const filtersCount = getFiltersCount(filtersKeys, currentQuery);
            return (
                <NoTransportToInvoiceMessage
                    hasFilters={filtersCount > 0}
                    onResetFilters={onResetQuery}
                />
            );
        }

        return transports.map((transport, index) => {
            return (
                <TransportsToInvoiceTransportCard
                    dataTestId={`transport-to-invoice-card-${index}`}
                    handleSelectTransport={() =>
                        onSelectTransport(transport.uid, getTransportTotalInvoicedPrice(transport))
                    }
                    handleUnselectTransport={() => onUnselectTransport(transport.uid)}
                    handleShowTransportPreview={() => onShowTransportPreview(transport.uid)}
                    selected={allTransportsSelected || selectedTransports.has(transport.uid)}
                    transport={transport}
                    key={index}
                />
            );
        });
    };

    const totalPriceOfSelectedTransports = getTotalPriceOfSelectedTransports();

    const allVisibleTransportsSelected =
        (transportsCount > 0 &&
            transports.every((transport) => selectedTransports.has(transport.uid))) ||
        allTransportsSelected;

    const onSelectAll = async () => {
        onSelectAllTransports();
        fetchTotalPriceOfAllTransports();
    };

    const filters = useMemo(() => {
        return [
            getTransportDateRangeFilter(
                {
                    staticRanges: {
                        week: dateRangePickerStaticRanges["week"],
                        last_week: dateRangePickerStaticRanges["last_week"],
                        month: dateRangePickerStaticRanges["month"],
                        last_month: dateRangePickerStaticRanges["last_month"],
                    },
                },
                true
            ),
            getCustomerFilter("debtor__in"),
            getShipperFilter(),
            getAddressFilter(true),
            getAddressByCriteriaFilter(),
            getTagFilter(),
            getTransportCreditNoteNumberFilterBadges(),
        ];
    }, []);

    return (
        <>
            <Flex p={4} style={{columnGap: "8px"}}>
                <Text variant="title" color="grey.dark">
                    {t("invoicingFlow.transportsToInvoice")}
                </Text>
                {transportsCount > 0 && (
                    <Badge data-testid={"invoicing-flow-transport-count"} padding={2}>
                        {transportsCount}
                    </Badge>
                )}
                <Flex flexGrow={1} />

                {hasDashdocInvoicingEnabled && (
                    <Flex flexGrow={0}>
                        <Popover
                            visibility={{
                                isOpen: isMoreActionVisible,
                                onOpenChange: (value) =>
                                    value ? setMoreActionVisible() : setMoreActionHidden(),
                            }}
                        >
                            <Popover.Trigger>
                                <IconButton
                                    name="moreActions"
                                    data-testid="invoice-creation-more-actions"
                                />
                            </Popover.Trigger>
                            <Popover.Content>
                                <Flex flexDirection="column" width={366} marginBottom={3}>
                                    <Callout variant="secondary">
                                        {t("invoice.HowToCreateInvoiceCallout")}
                                    </Callout>
                                    <Flex marginY={2}>
                                        <HorizontalLine marginX={2} />
                                        {t("common.or")}
                                        <HorizontalLine marginX={2} />
                                    </Flex>
                                    <Text marginX={2}>{t("invoice.CreateABareInvoice")}</Text>
                                    <Flex marginX={2} marginTop={2}>
                                        <CreateBareInvoiceAction
                                            onSuccess={(invoiceUid) => {
                                                setMoreActionHidden();
                                                setPreviewInvoice(invoiceUid);
                                                refreshInvoices();
                                            }}
                                        />
                                    </Flex>
                                </Flex>
                            </Popover.Content>
                        </Popover>
                    </Flex>
                )}
            </Flex>

            <Flex>
                <Flex
                    borderTop="1px solid"
                    borderBottom="1px solid"
                    borderColor="grey.light"
                    alignItems="center"
                    px={2}
                    mr={-1}
                    zIndex={"level1"}
                    backgroundColor={"grey.white"}
                >
                    <Icon
                        data-testid="select-all-transports-button"
                        name="checkCircle"
                        css={{
                            "&:hover": {
                                color: allVisibleTransportsSelected
                                    ? theme.colors.grey.default
                                    : theme.colors.blue.light,
                            },
                            "&:active": {
                                color: allVisibleTransportsSelected
                                    ? theme.colors.grey.dark
                                    : theme.colors.blue.default,
                            },
                            cursor: "pointer",
                        }}
                        color={allVisibleTransportsSelected ? "blue.default" : "grey.dark"}
                        onClick={() => {
                            if (loadingTransports || transports.length === 0) {
                                return;
                            }
                            setTotalPriceOfAllSelectedTransports(null);
                            onSelectAllVisibleTransports(!allVisibleTransportsSelected);
                        }}
                    />
                    <Box
                        borderRight={"1px solid"}
                        borderColor="grey.light"
                        alignItems="center"
                        height="25px"
                        ml={3}
                    />
                </Flex>
                <FilteringBar<TransportsToInvoiceSettings>
                    filters={filters}
                    query={currentQuery}
                    updateQuery={onUpdateQuery}
                    parseQuery={TransportsToInvoiceSettingsSchema.parse}
                    resetQuery={DEFAULT_TRANSPORTS_TO_INVOICE_SETTINGS}
                    data-testid="transports-to-invoice-filtering-bar"
                    searchEnabled={true}
                />
            </Flex>

            {allVisibleTransportsSelected && transportsCount > selectedTransports.size && (
                <SelectAllRowsButton
                    allRowsSelected={allTransportsSelected}
                    onSelectAllRows={onSelectAll}
                    allVisibleRowsSelectedMessage={""}
                    selectAllRowsMessage={t("components.selectAllRelatedTransports", {
                        number: transportsCount,
                    })}
                    allRowsSelectedMessage={t("components.allTransportsSelected", {
                        number: transportsCount,
                    })}
                />
            )}

            <Box width="100%" height="100%" overflow="auto" onScroll={onScroll}>
                {_renderTransportsToInvoiceContent()}
                {loadingTransports && <LoadingWheel />}
            </Box>
            {!loadingTransports && (allTransportsSelected || selectedTransports.size > 0) && (
                <Flex
                    p={2}
                    justifyContent="space-between"
                    borderTopColor="grey.light"
                    borderTopStyle="solid"
                    borderTopWidth="1px"
                >
                    <Flex flexDirection="column">
                        <Text color="grey.dark" data-testid="transports-count">
                            {t("components.countSelectedTransports", {
                                smart_count: allTransportsSelected
                                    ? transportsCount
                                    : selectedTransports.size,
                            })}
                        </Text>
                        <Text color="grey.dark" data-testid="transports-selected-total-price">
                            {formatNumber(totalPriceOfSelectedTransports, {
                                style: "currency",
                                currency: "EUR",
                            })}
                        </Text>
                    </Flex>
                    <Button
                        alignSelf="center"
                        data-testid="transports-to-invoice-submit-button"
                        variant="primary"
                        onClick={onSubmit}
                    >
                        {t("common.next")}
                    </Button>
                </Flex>
            )}
        </>
    );

    function getTotalPriceOfSelectedTransports() {
        const missingTotalPriceOfAllTransports = !totalPriceOfAllSelectedTransports?.result;
        if (allTransportsSelected && missingTotalPriceOfAllTransports) {
            fetchTotalPriceOfAllTransports();
            return null; // Until we have the result, we don't want to display anything
        }

        return totalPriceOfAllSelectedTransports?.result ?? computePriceOfSelectedTransports();
    }

    async function fetchTotalPriceOfAllTransports() {
        if (totalPriceOfAllSelectedTransports?.isLoading) {
            return;
        }

        setTotalPriceOfAllSelectedTransports({isLoading: true, result: null});

        try {
            const totalPrice = await fetchTransportsTotalInvoicedPrice(
                getTransportsQueryParamsFromFiltersQuery(currentQuery, timezone, true)
            );
            setTotalPriceOfAllSelectedTransports({isLoading: false, result: totalPrice});
        } catch (error) {
            setTotalPriceOfAllSelectedTransports({isLoading: false, result: null});
        }
    }

    function computePriceOfSelectedTransports() {
        let totalPrice = 0;
        selectedTransports.forEach((transportUid) => {
            const transport = transports.find((transport) => transport.uid === transportUid);
            if (transport !== undefined) {
                totalPrice += Number(getTransportTotalInvoicedPrice(transport));
            } else if (selectedTransportPriceCache[transportUid] !== undefined) {
                totalPrice += Number(selectedTransportPriceCache[transportUid]);
            }
        });
        return totalPrice;
    }
};
