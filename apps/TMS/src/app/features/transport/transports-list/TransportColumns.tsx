import {CompanyName, getConnectedCompany, type SimpleAddress} from "@dashdoc/web-common";
import {getLoadText, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Icon,
    IconProps,
    Link,
    NoWrap,
    SortCriteriaOption,
    Text,
    theme,
    TooltipWrapper,
    Icon as UiKitIcon,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import {
    Address,
    Company,
    companyGetTimezone,
    DeliveryDocumentType,
    formatDate,
    formatNumber,
    formatNumberWithCustomUnit,
    getItemAsAList,
    getSiteZonedAskedDateTimes,
    parseAndZoneDate,
    TransportPricingLineWeb,
    type InvoicingAddress,
    type ParentTransportAddress,
    type TransportAddress,
} from "dashdoc-utils";
import {PurchaseCostLine} from "dashdoc-utils/dist";
import React from "react";
import Highlighter from "react-highlight-words";

import {BookingIcon} from "app/features/transport/transports-list/BookingIcon";
import {transportsListColumnService} from "app/features/transport/transports-list/services/transportsListColumn.service";
import {QuotationRequestTableCell} from "app/features/transportation-plan/rfq/quotation-request/QuotationRequestTableCell";
import {useSelector} from "app/redux/hooks";
import {getMetricDisplayUnit, getPricingCurrency} from "app/services/invoicing/pricing.service";
import {cmrHasSignature, DOCUMENT_CATEGORIES_CMR} from "app/services/transport/documents.service";
import {getSimplifiedTransportMeans} from "app/services/transport/transport.service";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import {TagTableCell} from "../../core/tags/tag-table-cell/TagTableCell";
import {DisplayableDocument} from "../../document/DocumentModal";
import {DocumentsByTypePreview} from "../../document/DocumentsByTypePreview";
import {getAllConsignmentNotesNumbersFromTransport} from "../../document/signature/utils";

import {ProgressBarCell} from "./progress-bar-cell";

import type {
    ActivityListWeb,
    ChildTransportWeb,
    DeliveryListWeb,
    TransportListWeb,
} from "app/types/transport_list_web";

export const transportsOrderingParameterByColumnName: Record<string, string> = {
    sequential_id: "pk",
    status: "status_order",
    shipper_invoicing_status: "shipper_invoicing_status",
    carrier_address: "carrier__name",
    shipper_address: "shipper__name",
    origin_address: "origin",
    destination_address: "destination",
    loading_expected_date: "loading_date",
    unloading_expected_date: "unloading_date",
    customer_to_invoice: "debtor",
    invoice_number: "invoice_number",
    all_prices: "prices",
    parent_shipper_address: "parent_shipper_name",
    purchase_cost_total: "purchase_cost_total",
};

export const getTransportSortCriteriaByColumnName = (): Record<
    TransportColumn["name"],
    Array<SortCriteriaOption<string>>
> => {
    return {
        sequential_id: [{value: "pk", label: `N° ${t("common.transport")}`}],
        status: [{value: "status_order", label: t("common.status")}],
        shipper_invoicing_status: [{value: "shipper_invoicing_status", label: t("order.check")}],
        carrier_address: [{value: "carrier__name", label: t("common.carrier")}],
        shipper_address: [{value: "shipper__name", label: t("common.shipper")}],
        origin_address: [{value: "origin", label: t("transportColumns.origin")}],
        destination_address: [{value: "destination", label: t("transportColumns.destination")}],
        loading_expected_date: [
            {value: "loading_date", label: t("transportColumns.loadingDates")},
        ],
        unloading_expected_date: [
            {value: "unloading_date", label: t("transportColumns.unloadingDates")},
        ],
        customer_to_invoice: [{value: "debtor", label: t("common.customerToInvoice")}],
        invoice_number: [{value: "invoice_number", label: t("transportListColumn.invoiceNumber")}],
        all_prices: [{value: "prices", label: t("common.price")}],
        parent_shipper_address: [
            {value: "parent_shipper_name", label: t("common.parent_shipper")},
        ],
        purchase_cost_total: [{value: "purchase_cost_total", label: t("common.purchaseCosts")}],
    };
};

const OtherCompany = styled("span")`
    color: ${theme.colors.blue.dark};
    font-weight: bold;
`;

const MutedIcon = ({name}: {name: IconProps["name"]}) => (
    <UiKitIcon color="grey.ultradark" fontSize={0} mr={2} name={name} />
);

function handleEmptyOrMultipleCellValues(
    values: ActivityListWeb[],
    transformer: Function,
    placeholders: {empty: string | null; multiple: string | null; displayBookingNeeded?: boolean}
) {
    if (values.length === 1) {
        return transformer(values[0]);
    } else if (values.length === 0) {
        return placeholders.empty;
    } else {
        const isBookingNeeded = values.some((site) => site.is_booking_needed);
        return (
            <Box style={{display: "grid", gridTemplateColumns: "1fr max-content"}}>
                {placeholders.multiple}
                {placeholders.displayBookingNeeded && isBookingNeeded && <BookingIcon />}
            </Box>
        );
    }
}

function getDeliveryActivitiesOfType(transport: TransportListWeb, type: "origin" | "destination") {
    const deliveries = transport.deliveries;
    return Object.values(
        deliveries.reduce(
            (activities: {[uid: string]: ActivityListWeb}, delivery: DeliveryListWeb) => {
                if (delivery[type]?.uid && !activities[delivery[type].uid]) {
                    activities[delivery[type].uid] = delivery[type];
                }
                return activities;
            },
            {}
        )
    );
}

export interface AddressCellProps {
    name?: string;
    address?:
        | SimpleAddress
        | Address
        | TransportAddress
        | ParentTransportAddress
        | InvoicingAddress;
    searchWords: string[];
    ownCompany?: boolean;
    isBookingNeeded?: boolean;
    isCharterIcon?: boolean;
}

export function AddressCell({
    name,
    address,
    searchWords,
    ownCompany,
    isBookingNeeded,
    isCharterIcon,
}: AddressCellProps) {
    if (!address && !name) {
        return null;
    }
    let addressName: string;
    if (name) {
        addressName = name;
    } else {
        if (address && "name" in address) {
            addressName = address.name ?? "";
        } else {
            addressName = "";
        }
    }
    let label = (
        <Highlighter searchWords={searchWords} autoEscape={true} textToHighlight={addressName} />
    );
    if (address && "company" in address && address.company) {
        if (address.company.name === addressName) {
            label = <CompanyName company={address.company} highlight={searchWords} />;
        } else {
            label = (
                <>
                    <CompanyName
                        company={address.company}
                        highlight={searchWords}
                        withoutContainer={true}
                    />
                    {" - "} {label}
                </>
            );
        }
    }
    return (
        <>
            <Box style={{display: "grid", gridTemplateColumns: "1fr max-content"}}>
                <NoWrap>
                    {isCharterIcon && <UiKitIcon name="charter" mr={1} />}
                    <span
                        css={css`
                            font-weight: ${ownCompany ? "400" : "700"};
                        `}
                    >
                        {label}
                    </span>
                </NoWrap>
                {isBookingNeeded && <BookingIcon />}
            </Box>
            {address && (
                <NoWrap>
                    <Highlighter
                        searchWords={searchWords}
                        autoEscape={true}
                        textToHighlight={address.postcode}
                    />{" "}
                    <Highlighter
                        searchWords={searchWords}
                        autoEscape={true}
                        textToHighlight={address.city}
                    />
                </NoWrap>
            )}
        </>
    );
}

export function DateCell({zonedDate}: {zonedDate: Date | null}) {
    if (!zonedDate) {
        return null;
    }
    return <span>{formatDate(zonedDate, "P HH:mm")}</span>;
}

function Reference({
    transport,
    role,
    searchWords,
}: {
    transport: TransportListWeb;
    role: "shipper" | "carrier" | "origin" | "destination";
    searchWords: string[];
}) {
    let reference = "";

    switch (role) {
        case "carrier":
            reference = transport.carrier_reference;
            break;
        case "shipper":
            reference = transport.deliveries[0]?.shipper_reference ?? "";
            break;
        case "origin":
            reference = transport.segments[0]?.origin.reference ?? "";
            break;
        case "destination":
            reference =
                transport.segments[transport.segments.length - 1]?.destination.reference ?? "";
            break;
        default:
            break;
    }

    reference = getItemAsAList(reference).join(", ");

    return (
        <NoWrap>
            <Text as="span" variant="subcaption" color="grey.dark" whiteSpace="nowrap">
                Ref :
            </Text>
            <b className="cell-reference">
                {" "}
                <Highlighter
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={reference}
                />
            </b>
        </NoWrap>
    );
}

function ExpectedDateCell({site, timezone}: {site: ActivityListWeb; timezone: string}) {
    const {zonedStart, zonedEnd} = getSiteZonedAskedDateTimes(site, timezone);

    if (!zonedStart) {
        return null;
    }

    const date = formatDate(zonedStart, "P");
    const minTime = formatDate(zonedStart, "HH:mm");
    const maxTime = formatDate(zonedEnd, "HH:mm");

    return (
        <>
            {date} {minTime + " - " + maxTime}
        </>
    );
}

function AskedAndActualDates({site, timezone}: {site: ActivityListWeb; timezone: string}) {
    const zonedActualDate = parseAndZoneDate(site.real_end, timezone);

    return (
        <>
            <NoWrap>
                <Text as="span" variant="subcaption" color="grey.dark" whiteSpace="nowrap">
                    {t("transportColumns.askedDate")}
                    {" : "}
                </Text>
                <ExpectedDateCell site={site} timezone={timezone} />
            </NoWrap>
            {zonedActualDate && (
                <NoWrap>
                    <Text as="span" variant="subcaption" color="grey.dark" whiteSpace="nowrap">
                        {t("transportColumns.actualDate")}
                        {" : "}
                    </Text>
                    <DateCell zonedDate={zonedActualDate} />
                </NoWrap>
            )}
        </>
    );
}

function PriceCell({
    price,
    currency,
    pricesMismatch,
    originalPrice,
    testId,
}: {
    price: string;
    currency: string | undefined;
    pricesMismatch: boolean;
    originalPrice?: string | null;
    testId: string;
}) {
    const priceIsFractionOfOriginal = originalPrice && Number(price) < Number(originalPrice);
    const priceText = (
        <Flex>
            <Text as="span" variant="caption" data-testid={testId}>
                {formatNumber(price, {style: "currency", currency})}
            </Text>
            {priceIsFractionOfOriginal && (
                <TooltipWrapper
                    content={t("transportColumns.parentPrices.priceIsFractionOfOriginal")}
                >
                    <Icon
                        name="analyticsPie"
                        scale={1.4}
                        fontSize={0}
                        color="grey.dark"
                        ml={2}
                        data-testid="price-is-fraction-of-original"
                    />
                </TooltipWrapper>
            )}
        </Flex>
    );

    return (
        <NoWrap>
            {pricesMismatch ? (
                <Flex style={{gap: "3px"}}>
                    <Icon
                        name="alert"
                        fontSize={0}
                        color="red.default"
                        data-testid={`${testId}-prices-mismatch-alert-icon`}
                    />
                    {priceText}
                </Flex>
            ) : (
                priceText
            )}
        </NoWrap>
    );
}

function UnitPriceCell({
    pricingLines,
    testId,
}: {
    pricingLines: TransportPricingLineWeb[] | PurchaseCostLine[] | null;
    testId: string;
}) {
    if (!pricingLines || pricingLines.length === 0) {
        return <>{"—"}</>;
    }
    if (pricingLines.length > 1) {
        return <>{t("transportColumns.unitPrice.severalLines")}</>;
    }
    const line = pricingLines[0];
    const unit = getMetricDisplayUnit(line.metric) ?? "";
    const text = formatNumberWithCustomUnit(line.unit_price, {unit, currency: line.currency});
    return (
        <NoWrap>
            <Text as="span" variant="caption" data-testid={testId}>
                {text}
            </Text>
        </NoWrap>
    );
}

function ShipperInvoiceStatusCell({transport}: {transport: TransportListWeb}) {
    const connectedCompany = useSelector(getConnectedCompany);
    const isShipper = transportViewerService.isShipperOf(transport, connectedCompany?.pk);

    const status =
        transport.shipper_invoicing_status === "CHECKED" ? t("order.check") : t("order.uncheck");

    if (!isShipper) {
        return null;
    }

    return (
        <Box>
            <NoWrap>
                <Flex css={{columnGap: "6px"}}>
                    <span style={{fontSize: "11px"}} data-testid="shipper-invoicing-status-column">
                        {status}
                    </span>
                    {transport.shipper_invoicing_status === "CHECKED" && (
                        <Icon
                            name="checkCircle"
                            color="grey.white"
                            backgroundColor="turquoise.default"
                            borderRadius="50%"
                        />
                    )}
                </Flex>
            </NoWrap>
        </Box>
    );
}

export const ICON_ORDER = [
    "cmr",
    "cmr4",
    "rental",
    "orc",
    "chc",
    "confirmation",
    "loading_plan",
    "weight_note",
    "washing_note",
    "delivery_note",
    "load_photo",
    "waste_manifest",
    "holders_swap_note",
    "invoice",
    "",
];

function ParentPriceCell({transport}: {transport: TransportListWeb}) {
    if (transport.parent_transports.length === 0) {
        return null;
    }

    const weightedParentTotalPrice = transport.parent_split_turnover?.weighted_parent_total_price;
    if (!weightedParentTotalPrice || Number(weightedParentTotalPrice) == 0) {
        return null;
    }
    const parentTotalPrice = transport.parent_split_turnover?.parent_total_price;

    const priceMismatch = transport.parent_transports.some(
        (parentTransport) => parentTransport.prices?.mismatch
    );

    return (
        <PriceCell
            price={weightedParentTotalPrice}
            currency="EUR"
            pricesMismatch={priceMismatch}
            originalPrice={parentTotalPrice}
            testId={`parent-price-in-table-${transport.sequential_id}`}
        />
    );
}

export interface TransportColumn {
    name: string;
    getLabel: () => string;
    width: number;
    getCellContent?: (
        transport: TransportListWeb,
        searchWords: string[],
        company?: Company | null
    ) => React.ReactNode;
    getButtonCellContent?: (transport: TransportListWeb) => React.ReactNode;
}

export const transportColumns: Record<TransportColumn["name"], TransportColumn> = {
    sequential_id: {
        name: "sequential_id",
        getLabel: () => t("transportsColumns.createdBy"),
        width: 125,
        getCellContent: function IdCell(
            transport: TransportListWeb,
            searchWords: string[],
            company: Company
        ) {
            const timezone = companyGetTimezone(company);
            const zonedDate = parseAndZoneDate(
                transport.created_device || transport.created,
                timezone
            );
            return (
                <>
                    <NoWrap>
                        {transport.parent_transports.length > 0 && (
                            <UiKitIcon name="charter" mr={1} />
                        )}
                        {company.pk !== transport.created_by.pk ? (
                            <OtherCompany>{transport.created_by.name}</OtherCompany>
                        ) : (
                            <>{transport.created_by.name}</>
                        )}
                    </NoWrap>
                    <NoWrap>
                        N°{" "}
                        <Highlighter
                            searchWords={searchWords}
                            autoEscape={true}
                            textToHighlight={String(transport.sequential_id)}
                        />
                    </NoWrap>
                    <NoWrap>
                        <DateCell zonedDate={zonedDate} />
                    </NoWrap>
                </>
            );
        },
    },
    documents_references: {
        name: "documents_references",
        getLabel: () => t("common.CMRNumber"),
        width: 80,
        getCellContent: function IdCell(transport: TransportListWeb, searchWords: string[]) {
            return (
                <Highlighter
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={getAllConsignmentNotesNumbersFromTransport(transport)}
                />
            );
        },
    },
    status: {
        name: "status",
        width: 100,
        getLabel: () => t("common.status"),
        getCellContent: function StatusCell(transport: TransportListWeb) {
            return <ProgressBarCell transport={transport} />;
        },
    },
    invoice_number: {
        name: "invoice_number",
        width: 100,
        getLabel: () => t("transportListColumn.invoiceNumber"),
        getCellContent: function InvoiceNumberCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            return (
                <Highlighter
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={transport.invoice_number ?? ""}
                />
            );
        },
    },
    shipper_invoicing_status: {
        name: "shipper_invoicing_status",
        width: 100,
        getLabel: () => t("order.check"),
        getCellContent: function (transport: TransportListWeb) {
            return <ShipperInvoiceStatusCell transport={transport} />;
        },
    },
    origin_address: {
        name: "origin_address",
        width: 150,
        getLabel: () => t("transportColumns.origin"),
        getCellContent: function OriginAddressCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            return handleEmptyOrMultipleCellValues(
                getDeliveryActivitiesOfType(transport, "origin").filter((site) => site.address),
                (site: ActivityListWeb) => {
                    const isBookingNeeded = site.is_booking_needed;
                    return (
                        <>
                            <AddressCell
                                isBookingNeeded={isBookingNeeded}
                                address={site.address ?? undefined}
                                searchWords={searchWords}
                            />
                            {site.address && (
                                <Reference
                                    transport={transport}
                                    role="origin"
                                    searchWords={searchWords}
                                />
                            )}
                        </>
                    );
                },
                {empty: null, multiple: t("common.multipleAddresses"), displayBookingNeeded: true}
            );
        },
    },
    loading_expected_date: {
        name: "loading_expected_date",
        getLabel: () => t("transportColumns.loadingDates"),
        width: 205,
        getCellContent: function LoadingDatesCell(
            transport: TransportListWeb,
            _,
            company: Company
        ) {
            const timezone = companyGetTimezone(company);

            return handleEmptyOrMultipleCellValues(
                getDeliveryActivitiesOfType(transport, "origin"),
                (origin: ActivityListWeb) => (
                    <AskedAndActualDates site={origin} timezone={timezone} />
                ),
                {empty: null, multiple: t("common.multipleAddresses")}
            );
        },
    },
    destination_address: {
        name: "destination_address",
        width: 150,
        getLabel: () => t("transportColumns.destination"),
        getCellContent: function DestinationAddressCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            return handleEmptyOrMultipleCellValues(
                getDeliveryActivitiesOfType(transport, "destination").filter(
                    (site) => site.address
                ),
                (site: ActivityListWeb) => {
                    const isBookingNeeded = site.is_booking_needed;
                    return (
                        <>
                            <AddressCell
                                isBookingNeeded={isBookingNeeded}
                                address={site.address ?? undefined}
                                searchWords={searchWords}
                            />
                            {site.address && (
                                <Reference
                                    transport={transport}
                                    role="destination"
                                    searchWords={searchWords}
                                />
                            )}
                        </>
                    );
                },
                {empty: null, multiple: t("common.multipleAddresses"), displayBookingNeeded: true}
            );
        },
    },
    unloading_expected_date: {
        name: "unloading_expected_date",
        getLabel: () => t("transportColumns.unloadingDates"),
        width: 205,
        getCellContent: function LoadingDatesCell(
            transport: TransportListWeb,
            _,
            company: Company
        ) {
            const timezone = companyGetTimezone(company);

            return handleEmptyOrMultipleCellValues(
                getDeliveryActivitiesOfType(transport, "destination"),
                (destination: ActivityListWeb) => (
                    <AskedAndActualDates site={destination} timezone={timezone} />
                ),
                {empty: null, multiple: t("common.multipleAddresses")}
            );
        },
    },
    carrier_address: {
        name: "carrier_address",
        width: 150,
        getLabel: () => t("common.carrier"),
        getCellContent: function CarrierAddressCell(
            transport: TransportListWeb,
            searchWords: string[],
            company: Company
        ) {
            const hasChildTransport = transport.segments.some(
                ({child_transport}) => !!child_transport
            );

            return (
                <>
                    {transport.carrier_draft_assigned &&
                        transport.carrier_assignation_status === "draft_assigned" &&
                        !transport.carrier && (
                            <NoWrap>
                                <span
                                    css={css`
                                        font-weight: 400;
                                    `}
                                >
                                    <CompanyName
                                        company={transport.carrier_draft_assigned}
                                        highlight={searchWords}
                                    />
                                </span>
                            </NoWrap>
                        )}
                    <AddressCell
                        name={transport.carrier?.name}
                        address={transport.carrier?.administrative_address}
                        searchWords={searchWords}
                        ownCompany={
                            transport.carrier !== null && transport.carrier.pk === company.pk
                        }
                        isCharterIcon={hasChildTransport}
                    />
                    <Reference transport={transport} role="carrier" searchWords={searchWords} />
                </>
            );
        },
    },

    chartered_carrier_address: {
        name: "chartered_carrier_address",
        getLabel: () => t("charteredCarrier.title"),
        width: 150,
        getCellContent: function (transport: TransportListWeb, searchWords: string[]) {
            const children = transport.segments.reduce(
                (children: ChildTransportWeb[], segment) => {
                    if (
                        segment.child_transport &&
                        !children.some((child) => child.uid == segment.child_transport?.uid)
                    ) {
                        children.push(segment.child_transport);
                    }
                    return children;
                },
                []
            );
            const totalChildren = children.length;

            return (
                totalChildren > 0 && (
                    <Flex style={{gap: "6px"}}>
                        <Flex flexDirection="column">
                            <AddressCell
                                name={children[0].carrier_name}
                                address={children[0].administrative_address || undefined}
                                searchWords={searchWords}
                            />
                            <Reference
                                transport={transport}
                                role="carrier"
                                searchWords={searchWords}
                            />
                        </Flex>
                        {totalChildren > 1 && (
                            <Flex
                                p={1}
                                backgroundColor="grey.light"
                                alignItems="center"
                                alignSelf="center"
                            >
                                <TooltipWrapper
                                    content={
                                        <Flex
                                            flexDirection="column"
                                            width="30rem"
                                            style={{rowGap: "8px"}}
                                        >
                                            <ul style={{paddingLeft: "16px"}}>
                                                {children.slice(1).map((child, index) => {
                                                    return (
                                                        <>
                                                            <li
                                                                key={index}
                                                                style={{
                                                                    marginBottom:
                                                                        index ==
                                                                        children.length - 1
                                                                            ? 0
                                                                            : "8px",
                                                                }}
                                                            >
                                                                <Flex flexDirection="column">
                                                                    <AddressCell
                                                                        name={child.carrier_name}
                                                                        address={
                                                                            child.administrative_address ||
                                                                            undefined
                                                                        }
                                                                        searchWords={searchWords}
                                                                    />
                                                                    <Reference
                                                                        transport={child as any}
                                                                        role="carrier"
                                                                        searchWords={searchWords}
                                                                    />
                                                                </Flex>
                                                            </li>
                                                        </>
                                                    );
                                                })}
                                            </ul>
                                        </Flex>
                                    }
                                >
                                    <Text>+{totalChildren - 1}</Text>
                                </TooltipWrapper>
                            </Flex>
                        )}
                    </Flex>
                )
            );
        },
    },
    chartering: {
        name: "chartering",
        getLabel: () => t("chartering.title"),
        width: 150,
        getCellContent: function (transport: TransportListWeb) {
            const generateLink = (orderUID: string, orderId: string, index: number) => (
                <Link
                    target="_blank"
                    href={`/app/orders/${orderUID}`}
                    onClick={(event) => event.stopPropagation()}
                    data-testid={`chartering-link-${index}`}
                >
                    {t("common.number", {number: orderId})}
                </Link>
            );

            const children = transport.segments.reduce(
                (children: ChildTransportWeb[], segment) => {
                    if (
                        segment.child_transport &&
                        !children.some((child) => child.uid == segment.child_transport?.uid)
                    ) {
                        children.push(segment.child_transport);
                    }
                    return children;
                },
                []
            );

            return children.reduce<React.ReactNode[]>((links, child_transport, index) => {
                links.push(generateLink(child_transport.uid, child_transport.id, index));
                if (index < children.length - 1) {
                    links.push(", ");
                }

                return links;
            }, []);
        },
    },
    original_transport: {
        name: "original_transport",
        getLabel: () => t("common.originalTransport"),
        width: 150,
        getCellContent: function (transport: TransportListWeb) {
            const generateLink = (transportUID: string, transportId: number) => (
                <Link
                    target="_blank"
                    href={`/app/transports/${transportUID}`}
                    onClick={(event) => event.stopPropagation()}
                >
                    {t("common.number", {number: transportId})}
                </Link>
            );

            return transport.parent_transports.reduce<React.ReactNode[]>(
                (links, parent_transport, index) => {
                    links.push(generateLink(parent_transport.uid, parent_transport.pk));
                    if (index < transport.segments.length - 1) {
                        links.push(", ");
                    }
                    return links;
                },
                []
            );
        },
    },
    shipper_address: {
        name: "shipper_address",
        width: 175,
        getLabel: () => t("common.shipper"),
        getCellContent: function ShipperAddressCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            return (
                <>
                    <AddressCell
                        name={transport.shipper.name}
                        address={transport.shipper.administrative_address}
                        searchWords={searchWords}
                    />
                    <Reference transport={transport} role="shipper" searchWords={searchWords} />
                </>
            );
        },
    },
    parent_shipper_address: {
        name: "parent_shipper_address",
        width: 175,
        getLabel: () => t("common.parent_shipper"),
        getCellContent: function ShipperAddressCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            if (transport.parent_transports.length === 0) {
                return null;
            }

            return transport.parent_transports.every(
                (t) => t.shipper_pk === transport.parent_transports[0].shipper_pk
            ) ? (
                <AddressCell
                    address={transport.parent_transports[0].shipper_address}
                    searchWords={searchWords}
                />
            ) : (
                t("components.multipleShippers")
            );
        },
    },
    customer_to_invoice: {
        name: "customer_to_invoice",
        width: 175,
        getLabel: () => t("common.customerToInvoice"),
        getCellContent: function CustomerToInvoiceAddressCell(
            transport: TransportListWeb,
            searchWords: string[]
        ) {
            return (
                <>
                    {transport.customer_to_invoice ? (
                        <>
                            <AddressCell
                                name={transport.customer_to_invoice.name}
                                address={transport.customer_to_invoice.invoicing_address}
                                searchWords={searchWords}
                            />
                            {!transport.customer_to_invoice.invoicing_address && (
                                <Flex>
                                    <Icon name="warning" mr={1} fontSize={0} color="red.default" />
                                    <NoWrap color="red.default" fontSize={0}>
                                        {t("customerToInvoice.notInvoiceable")}
                                    </NoWrap>
                                </Flex>
                            )}
                        </>
                    ) : null}
                </>
            );
        },
    },
    loads: {
        name: "loads",
        width: 150,
        getLabel: () => t("common.loads"),
        getCellContent: function LoadCell(transport: TransportListWeb, searchWords: string[]) {
            if (transport.deliveries.length === 0) {
                return null;
            }

            const deliveries_loads = transport.deliveries.map((delivery) => delivery.loads).flat();
            const loads_description = deliveries_loads.map((load) => getLoadText(load)).join("\n");

            return (
                <Highlighter
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={loads_description || ""}
                />
            );
        },
    },
    trucker: {
        name: "trucker",
        width: 135,
        getLabel: () => t("common.means"),
        getCellContent: function TruckerCell(
            transport: TransportListWeb,
            searchWords: string[],
            company: Company
        ) {
            const isCarrier = transport.carrier && company.pk === transport.carrier.pk;

            const transportMeans = getSimplifiedTransportMeans(transport);

            if ("extension" in transportMeans) {
                return (
                    <NoWrap>
                        <MutedIcon name="transfer" />
                        {transportMeans.extension.name}
                    </NoWrap>
                );
            } else {
                const {
                    hasMeansFromDifferentSources,
                    isSubcontracted,
                    carriers,
                    trailers,
                    truckers,
                    vehicles,
                    extensionsManagingChildTransports,
                } = transportMeans;

                const unspecified = <i>{t("common.unspecified")}</i>;

                return (
                    <>
                        {hasMeansFromDifferentSources && (
                            <NoWrap>
                                <MutedIcon name="carrier" />
                                {t("components.multiplesMeans")}
                            </NoWrap>
                        )}
                        {!hasMeansFromDifferentSources && carriers.length > 0 && (
                            <NoWrap>
                                <MutedIcon name="carrier" />
                                <Highlighter
                                    searchWords={searchWords}
                                    autoEscape={true}
                                    // @ts-ignore
                                    textToHighlight={carriers[0]}
                                />
                            </NoWrap>
                        )}
                        {!hasMeansFromDifferentSources &&
                            extensionsManagingChildTransports.length > 0 && (
                                <NoWrap>
                                    <MutedIcon name="transfer" />
                                    {extensionsManagingChildTransports[0].name}
                                </NoWrap>
                            )}
                        {!isSubcontracted && !hasMeansFromDifferentSources && isCarrier && (
                            <NoWrap>
                                <MutedIcon name="trucker" />
                                {truckers.length ? (
                                    <Highlighter
                                        searchWords={searchWords}
                                        autoEscape={true}
                                        textToHighlight={truckers
                                            .map((t) => t.display_name)
                                            .join(", ")}
                                    />
                                ) : (
                                    unspecified
                                )}
                            </NoWrap>
                        )}
                        <NoWrap>
                            <MutedIcon name="truck" />
                            {vehicles.length
                                ? vehicles.map((vehicle, index) => (
                                      <React.Fragment key={`vehicle-${vehicle.pk}`}>
                                          <Highlighter
                                              searchWords={searchWords}
                                              autoEscape={true}
                                              textToHighlight={vehicle.license_plate}
                                          />
                                          {isCarrier && (
                                              <Highlighter
                                                  css={css`
                                                      font-style: italic;
                                                  `}
                                                  searchWords={searchWords}
                                                  autoEscape={true}
                                                  // @ts-ignore
                                                  textToHighlight={
                                                      vehicle.fleet_number &&
                                                      " (" + vehicle.fleet_number + ")"
                                                  }
                                              />
                                          )}
                                          {vehicles.length > 1 && index < vehicles.length - 1
                                              ? ", "
                                              : ""}
                                      </React.Fragment>
                                  ))
                                : unspecified}
                        </NoWrap>
                        <NoWrap>
                            <MutedIcon name="trailer" />
                            {trailers.length
                                ? trailers.map((trailer, index) => (
                                      <React.Fragment key={`trailer-${trailer.pk}`}>
                                          <Highlighter
                                              searchWords={searchWords}
                                              autoEscape={true}
                                              textToHighlight={trailer.license_plate}
                                          />
                                          {isCarrier && (
                                              <Highlighter
                                                  css={css`
                                                      font-style: italic;
                                                  `}
                                                  searchWords={searchWords}
                                                  autoEscape={true}
                                                  textToHighlight={
                                                      trailer.fleet_number &&
                                                      " (" + trailer.fleet_number + ")"
                                                  }
                                              />
                                          )}
                                          {trailers.length > 1 && index < trailers.length - 1
                                              ? ", "
                                              : ""}
                                      </React.Fragment>
                                  ))
                                : unspecified}
                        </NoWrap>
                    </>
                );
            }
        },
    },
    all_prices: {
        name: "all_prices",
        width: 120,
        getLabel: () => t("column.totalPrice"),
        getCellContent: function (transport: TransportListWeb) {
            return (
                <PriceCell
                    price={transport.prices?.total ?? ""}
                    currency={getPricingCurrency(transport.prices)}
                    pricesMismatch={transport.prices?.mismatch ?? false}
                    testId={`price-in-table-${transport.sequential_id}`}
                />
            );
        },
    },
    parent_prices: {
        name: "parent_prices",
        width: 120,
        getLabel: () => t("common.sell_price_transport_origin"),
        getCellContent: function (transport: TransportListWeb) {
            return <ParentPriceCell transport={transport} />;
        },
    },
    margin: {
        name: "margin",
        width: 120,
        getLabel: () => t("common.margin"),
        getCellContent: function (transport: TransportListWeb) {
            const transportMargin = transportsListColumnService.getTransportMargin(transport);
            if (transportMargin === null) {
                return null;
            }
            const {margin, percentage} = transportMargin;
            const color = margin > 0 ? "green.dark" : "red.dark";
            return (
                <Flex flexDirection="column">
                    <Text color={color} variant="caption" fontWeight="600">
                        {formatNumber(margin, {style: "currency", currency: "EUR"})}
                    </Text>
                    <Text color={color} variant="caption" fontWeight="600">
                        (
                        {formatNumber(percentage, {
                            style: "percent",
                            maximumFractionDigits: 2,
                        })}
                        )
                    </Text>
                </Flex>
            );
        },
    },
    unit_price: {
        name: "unit_price",
        width: 120,
        getLabel: () => t("column.unitPrice"),
        getCellContent: function (transport: TransportListWeb) {
            return (
                <UnitPriceCell
                    pricingLines={transport.prices?.lines ?? null}
                    testId={`unit-price-in-table-${transport.sequential_id}`}
                />
            );
        },
    },
    purchase_cost_total: {
        name: "purchase_cost_total",
        width: 120,
        getLabel: () => t("column.totalPurchaseCosts"),
        getCellContent: function (transport: TransportListWeb) {
            return `${formatNumber(transport.purchase_costs?.total_without_tax, {
                style: "currency",
                currency: "EUR",
            })}`;
        },
    },
    purchase_cost_unit_price: {
        name: "purchase_cost_unit_price",
        width: 120,
        getLabel: () => t("column.unitPricePurchaseCosts"),
        getCellContent: function (transport: TransportListWeb) {
            return (
                <UnitPriceCell
                    pricingLines={transport.purchase_costs?.lines ?? null}
                    testId={`purchase-cost-unit-price-in-table-${transport.sequential_id}`}
                />
            );
        },
    },
    tags: {
        name: "tags",
        width: 90,
        getLabel: () => t("common.tags"),
        getCellContent: function (transport: TransportListWeb) {
            return <TagTableCell tags={transport.tags} numberOfItemsToDisplay={1} />;
        },
    },
    documents: {
        name: "documents",
        getLabel: () => t("transportColumns.documents"),
        width: 110,
        getButtonCellContent: function (transport: TransportListWeb) {
            let allDocuments: {
                [documentType: string]: DisplayableDocument[];
            } = {};

            for (let message of transport.messages) {
                if (!message || !(message.type === "document" || message.type === "photo")) {
                    continue;
                }

                if (allDocuments[message.document_type] === undefined) {
                    allDocuments[message.document_type] = [
                        {
                            url: message.document,
                            label: message.reference,
                            type: message.document_type,
                            mlDocumentIdentification: message.ml_document_identification,
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
                        type: message.document_type,
                        mlDocumentIdentification: message.ml_document_identification,
                        reference: message.reference,
                        extractedReference: message.extracted_reference,
                        authorCompanyId: message.author_company_id,
                        messageUid: message.uid,
                    });
                }
            }

            for (let doc of transport.documents) {
                const category = doc.category === "ldv" ? "cmr" : doc.category;

                if (DOCUMENT_CATEGORIES_CMR.has(category) && !cmrHasSignature(doc, transport)) {
                    continue;
                }

                if (allDocuments[category] === undefined && !doc.draft) {
                    allDocuments[category] = [
                        {
                            // @ts-ignore
                            url: doc.file,
                            // @ts-ignore
                            deliveryUid: doc.delivery,
                            showInIFrame: true,
                            label: doc.reference,
                        },
                    ];
                } else if (!doc.draft) {
                    allDocuments[category].push({
                        // @ts-ignore
                        url: doc.file,
                        // @ts-ignore
                        deliveryUid: doc.delivery,
                        showInIFrame: true,
                        label: doc.reference,
                    });
                }
            }

            let sortedDocumentsIcons = ICON_ORDER.map((docType: DeliveryDocumentType) => {
                if (!allDocuments[docType]) {
                    return null;
                }
                return (
                    <DocumentsByTypePreview
                        key={`${docType}-${transport.uid}`}
                        documentType={docType}
                        documents={allDocuments[docType]}
                        documentOpenedFrom="transports_list"
                    />
                );
            });

            return (
                <div
                    css={css`
                        display: flex;
                        flex-direction: row;
                        margin-top: 2px;
                    `}
                >
                    {sortedDocumentsIcons}
                </div>
            );
        },
    },
    rfq: {
        name: "rfq",
        getLabel: () => t("rfq.columnTitle"),
        width: 150,
        getCellContent: function (transport: TransportListWeb) {
            return (
                <QuotationRequestTableCell
                    quotationRequest={transport.carrier_quotation_request}
                />
            );
        },
    },
    carbon_footprint: {
        name: "carbon_footprint",
        getLabel: () => t("carbonFootprint.title"),
        width: 150,
        getCellContent: function (transport: TransportListWeb) {
            return `${formatNumber(transport.carbon_footprint, {
                style: "decimal",
                maximumFractionDigits: 2,
            })} ${t("components.carbonFootprint.unit")}`;
        },
    },
};
