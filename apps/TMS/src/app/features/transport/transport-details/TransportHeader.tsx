import {guid} from "@dashdoc/core";
import {
    getConnectedCompany,
    getConnectedManager,
    HasFeatureFlag,
    HasNotFeatureFlag,
    ModerationButton,
    useTimezone,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    Callout,
    Card,
    Flex,
    Icon,
    IconButton,
    Link,
    Popover,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatDate, Pricing, parseAndZoneDate, deliveryIsQualimat} from "dashdoc-utils";
import React, {FunctionComponent, ReactNode, useMemo, useState} from "react";

import {BusinessPrivacyInformationLabel} from "app/features/transport/business-privacy/BusinessPrivacyInformationLabel";
import {CancelledTransportNotice} from "app/features/transport/transport-details/transport-notices/CancelledTransportNotice";
import {DeclinedTransportNotice} from "app/features/transport/transport-details/transport-notices/DeclinedTransportNotice";
import {TransportNotices} from "app/features/transport/transport-details/transport-notices/TransportNotices";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {useSelector} from "app/redux/hooks";
import {getTransportTotalInvoicedPrice} from "app/services/invoicing/pricing.service";
import {getExternalLink} from "app/services/misc/shippersPlatform.service";
import {
    getDatesConsistency,
    getLastStatusUpdateForCategory,
    isTransportCancelled,
    isTransportRental,
    transportStateService,
} from "app/services/transport";
import {useHasDashdocInvoicingEnabled} from "app/taxation/invoicing/hooks/useHasDashdocInvoicingEnabled";
import {
    isPricingMissingItem,
    isPricingsFuelSurchargeAgreementMissingItem,
} from "app/taxation/pricing/services/pricing-helpers";

import {ParentRentalTransportsBanner} from "../rental/transport-banners/ParentRentalTransportsBanner";
import {RentalLinkedToTransportsBanner} from "../rental/transport-banners/RentalLinkedToTransportsBanner";
import {CustomerToInvoiceEdition} from "../transport-information/CustomerToInvoiceInformation";

import CharteredTransportInfoBanner from "./chartered-transport-info-banner";
import {PageVisits} from "./page-visits/PageVisits";
import {
    SubcontractedTransportInfoBanner,
    SubcontractedTripInfoBanner,
} from "./subcontracted-order-info-banner";
import {TransportStatusBadge} from "./TransportStatusBadge";
import {TransportWasteLinkBanner} from "./TransportWasteLinkBanner";

import type {SharingTabId} from "app/features/transport/transport-details/share-transport-modal/ShareTransportModal";
import type {Transport} from "app/types/transport";

const Status = ({label, date, timezone}: {label: string; date: string; timezone: string}) => (
    <Text as="small" variant="caption">
        {label} {t("common.dateOn")} {formatDate(parseAndZoneDate(date, timezone), "PPp")}
    </Text>
);

const CreatedBy = ({transport, timezone}: {transport: Transport; timezone: string}) => {
    const externalLink = transport.external_transport
        ? getExternalLink(transport.external_transport)
        : "";

    return (
        <Flex flexDirection="column">
            <Status
                label={`${t("transportsColumns.createdBy")} ${transport.created_by.name}`}
                date={transport.created_device || transport.created}
                timezone={timezone}
            />
            {transport.external_transport && externalLink && (
                <Flex mt={1}>
                    <Text variant="caption">
                        <Link href={externalLink} target="_blank" rel="noopener noreferrer">
                            <Icon name="openInNewTab" mr={1} scale={[1.16, 1.16]} />
                            {t("common.seeOn", {
                                source: transport.external_transport.data_source_name,
                            })}
                        </Link>
                    </Text>
                </Flex>
            )}
        </Flex>
    );
};

const DeletedBy = ({transport, timezone}: {transport: Transport; timezone: string}) => {
    const status = transport.status_updates.find(({category}) => category === "deleted");
    if (status?.author?.display_name) {
        return (
            <Status
                label={t("status.deletedBy", {author: status.author.display_name})}
                date={transport.deleted}
                timezone={timezone}
            />
        );
    }

    return null;
};

type HeaderButtonNodes = (clearPopoverState?: () => void) => {
    moreActions: ReactNode[];
    defaults: ReactNode[];
};

export type TransportHeaderProps = {
    transport: Transport;
    isOrder: boolean;
    getButtons: HeaderButtonNodes;
    pricing: Pricing | null | undefined;
    openPricingModal: () => void;
    openSharingModal: (tabId: SharingTabId) => void;
    reloadTransportsToInvoice?: () => void;
    isFullScreen: boolean;
    wasteManagementEnabled: boolean;
};

const TransportHeader: FunctionComponent<TransportHeaderProps> = ({
    transport,
    isOrder,
    getButtons,
    pricing,
    openPricingModal,
    openSharingModal,
    reloadTransportsToInvoice,
    isFullScreen = false,
    wasteManagementEnabled,
}) => {
    const company = useSelector(getConnectedCompany);
    const manager = useSelector(getConnectedManager);
    const hasDashdocInvoicingEnabled = useHasDashdocInvoicingEnabled();

    const isTransportPartiallyChartered = transport.segments.some(
        ({child_transport}) => !!child_transport
    );

    const hasPendingOrder = transportStateService.hasPendingOrder(transport);
    const isArchived = transportStateService.isArchived(transport, company?.pk);
    const isCheckedByShipper = transportStateService.isCheckedByShipper(transport, company?.pk);
    const isCancelled = isTransportCancelled(transport);
    const isDeleted = transport.deleted;
    const {isCarrier, isShipper, isCreator, isPublicViewer} = useTransportViewer(transport);
    const CreatedOrDeletedBy = isDeleted ? DeletedBy : CreatedBy;
    const timezone = useTimezone();

    const errorNotices = useMemo(() => getErrorNotices(transport), [transport]);
    const warningNotices = useMemo(() => getWarningNotices(transport), [transport]);
    const infoNotices = useMemo(
        () => getInfoNotices(transport, isPublicViewer),
        [transport, isPublicViewer]
    );

    const missingInvoicingData = getMissingInvoicingData();

    const isRental = isTransportRental(transport);

    const [key, setKey] = useState("_");
    const clearPopoverState = () => setKey(guid());
    const buttons = getButtons(clearPopoverState);

    return (
        <Box>
            {/* 1st header section */}
            <Flex alignItems="baseline">
                <Flex flexWrap="wrap" flex={1} justifyContent="space-between">
                    <Flex alignItems="top" flexShrink={0}>
                        <Box alignItems="center">
                            <Box mr={2}>
                                <Flex alignItems="center">
                                    <Text
                                        as="h3"
                                        variant="title"
                                        data-testid={isOrder ? "order-number" : "transport-number"}
                                        mr={2}
                                    >
                                        {t(
                                            isOrder
                                                ? "transportDetails.newOrderNumber"
                                                : "transportDetails.transportNumber",
                                            {
                                                number: transport.sequential_id,
                                            }
                                        )}
                                    </Text>
                                    <TransportStatusBadge
                                        global_status={transport.global_status}
                                        invoicing_status={transport.invoicing_status}
                                        carrier_assignation_status={
                                            transport.carrier_assignation_status
                                        }
                                        isOrder={isOrder}
                                    />
                                    {isCheckedByShipper && (
                                        <Badge
                                            variant="turquoise"
                                            shape="squared"
                                            data-testid="checked-by-shipper-badge"
                                        >
                                            {t("order.check")}
                                        </Badge>
                                    )}

                                    <Flex css={{columnGap: "8px"}}>
                                        {isDeleted && (
                                            <Badge shape="squared" variant="error">
                                                {t("common.deleted")}
                                            </Badge>
                                        )}
                                        {isCancelled && transport.status != "cancelled" && (
                                            <Badge variant="error" shape="squared">
                                                {t("components.cancelled")}
                                            </Badge>
                                        )}
                                        {isArchived && (
                                            <Badge shape="squared" variant="neutral">
                                                {t("common.archived")}
                                            </Badge>
                                        )}
                                    </Flex>
                                </Flex>
                                <CreatedOrDeletedBy transport={transport} timezone={timezone} />
                            </Box>
                        </Box>
                    </Flex>
                    <Flex alignSelf="flex-start" alignItems="center">
                        {transport.invite_code && (
                            <Button
                                onClick={() => openSharingModal("transport-code-tab")}
                                variant="none"
                                backgroundColor="transparent"
                                py={1}
                                px={1}
                                mr={3}
                                data-testid="transport-code-button"
                            >
                                <Text as="span">
                                    {t("components.transportCode")}{" "}
                                    <Text as="b" fontWeight="bold" fontFamily="monospace">
                                        {transport.invite_code}
                                    </Text>
                                </Text>
                            </Button>
                        )}
                        <PageVisits transport={transport} />
                        {(isCarrier || isShipper || isCreator) && (
                            <IconButton
                                ml={2}
                                name="share"
                                onClick={() => openSharingModal("visibility-tab")}
                                label={t("common.sharing")}
                                disabled={!!transport.deleted}
                                data-testid="share-transport-button"
                                color="blue.dark"
                            />
                        )}
                        {!isFullScreen && (
                            <TooltipWrapper content={t("common.openInNewTab")}>
                                <IconButton
                                    name="openInNewTab"
                                    onClick={() =>
                                        window.open(
                                            `/app/${
                                                isOrder ? "orders" : "transports"
                                            }/${transport.uid}`,
                                            "_blank"
                                        )
                                    }
                                />
                            </TooltipWrapper>
                        )}
                    </Flex>
                </Flex>
            </Flex>
            {/* buttons section */}
            <Flex justifyContent="flex-end" flexDirection="column" marginLeft="auto" mb={3}>
                <Box alignItems="baseline" justifyContent="flex-end">
                    <Flex
                        alignItems="center"
                        flexWrap="wrap"
                        justifyContent="flex-end"
                        marginLeft="auto"
                        css={{columnGap: "8px"}}
                    >
                        <ModerationButton manager={manager} path={`transports/${transport.uid}`} />

                        {buttons.moreActions.length > 0 ? (
                            <Popover placement="bottom-end" key={key}>
                                <Popover.Trigger>
                                    <Button variant="plain" data-testid="more-actions-button">
                                        <Text color="grey.dark">{t("common.moreActions")}</Text>
                                        <Icon name="arrowDown" ml={2} color="grey.dark" />
                                    </Button>
                                </Popover.Trigger>
                                <Popover.Content>
                                    <Flex
                                        flexDirection="column"
                                        minWidth="180px"
                                        css={{
                                            rowGap: "4px",
                                            "> *": {
                                                padding: "8px",
                                                margin: 0,
                                            },
                                        }}
                                    >
                                        {buttons.moreActions}
                                    </Flex>
                                </Popover.Content>
                            </Popover>
                        ) : (
                            buttons.moreActions
                        )}
                        {buttons.defaults}
                    </Flex>
                </Box>
            </Flex>

            <TransportNotices variant="error" messages={errorNotices} />
            <TransportNotices variant="warning" messages={warningNotices} />
            <TransportNotices variant="info" messages={infoNotices} />

            {isTransportPartiallyChartered && <CharteredTransportInfoBanner />}

            <HasFeatureFlag flagName="subcontractTrip">
                {transport.parent_trips?.length > 0
                    ? transport.parent_trips.map((parentTrip) => (
                          <SubcontractedTripInfoBanner
                              key={parentTrip.uid}
                              tripName={parentTrip.name}
                              tripUid={parentTrip.uid}
                          />
                      ))
                    : transport.parent_transports.map((parentTransport) => (
                          <SubcontractedTransportInfoBanner
                              key={parentTransport.uid}
                              transportNumber={parentTransport.sequential_id}
                              transportUid={parentTransport.uid}
                          />
                      ))}
            </HasFeatureFlag>
            <HasNotFeatureFlag flagName="subcontractTrip">
                {transport.parent_transports.map((parentTransport) => (
                    <SubcontractedTransportInfoBanner
                        key={parentTransport.uid}
                        transportNumber={parentTransport.sequential_id}
                        transportUid={parentTransport.uid}
                    />
                ))}
            </HasNotFeatureFlag>

            {isRental && (
                <RentalLinkedToTransportsBanner linkedTransports={transport.linked_transports} />
            )}
            <ParentRentalTransportsBanner
                parentRentalTransports={transport.parent_rental_transports}
            />
            <TransportWasteLinkBanner
                transportUid={transport.uid}
                wasteManagementEnabled={wasteManagementEnabled}
            />

            {hasPendingOrder && (
                <Card px={6} py={3} mb={3}>
                    <Flex style={{gap: "24px"}}>
                        <Flex alignItems="center" justifyContent="center" minWidth="2em">
                            <Icon name="AppWindowCheck" scale={2} />
                        </Flex>
                        <Flex flexDirection="column">
                            <Text fontWeight="bold">{t("components.orderPendingHelpTitle")}</Text>
                            <Text color="grey.dark">{t("components.orderPendingHelpBody")}</Text>
                        </Flex>
                    </Flex>
                </Card>
            )}

            {missingInvoicingData.length > 0 && transport.status === "verified" && (
                <Callout variant="danger" mb={2}>
                    <Text>{t("invoicing.missingData")}</Text>
                    {missingInvoicingData.map((missingData) => (
                        <Flex key={missingData.key} alignItems="baseline">
                            <Text as="li" mr={2} data-testid={missingData.testid}>
                                {missingData.message}
                            </Text>
                            {missingData.link}
                        </Flex>
                    ))}
                </Callout>
            )}
        </Box>
    );

    function getMissingInvoicingData() {
        let missingData = [];
        if (!transport.customer_to_invoice) {
            missingData.push({
                key: "customer_to_invoice",
                message: t("invoicing.missingData.customerToInvoice"),
                testid: "invoicing-missing-data",
                link: (
                    <CustomerToInvoiceEdition
                        transport={transport}
                        reloadTransportsToInvoice={reloadTransportsToInvoice}
                        getTriggerButton={(openEdition, updateAllowed) =>
                            updateAllowed ? (
                                <Link
                                    onClick={openEdition}
                                    data-testid="modify-transport-customer-to-invoice-if-missing"
                                >
                                    {t("invoicing.ModifyTransportCustomerToInvoiceIfMissing")}
                                </Link>
                            ) : null
                        }
                    />
                ),
            });
        }

        const transportPrice = getTransportTotalInvoicedPrice(transport);
        if (transportPrice === null) {
            missingData.push({
                key: "price",
                message: t("invoicing.missingData.price"),
                testid: "invoicing-price-warning",
                link: (
                    <Link
                        onClick={openPricingModal}
                        data-testid="modify-transport-price-if-missing-price"
                    >
                        {t("invoicing.ModifyTransportPriceIfMissingPrice")}
                    </Link>
                ),
            });
        }

        if (hasDashdocInvoicingEnabled && pricing !== null && pricing !== undefined) {
            if (isPricingMissingItem(pricing)) {
                missingData.push({
                    key: "invoice_item",
                    message: t("invoicing.missingData.invoice_item"),
                    testid: "missing-invoice-item-warning",
                    link: (
                        <Link
                            onClick={openPricingModal}
                            data-testid="modify-transport-price-if-missing-invoice-item"
                        >
                            {t("invoicing.ModifyTransportPriceIfMissingInvoiceItem")}
                        </Link>
                    ),
                });
            }
            if (isPricingsFuelSurchargeAgreementMissingItem(pricing)) {
                missingData.push({
                    key: "invoice_item_in_fuel_surcharge",
                    message: t("invoicing.missingData.invoice_item_in_fuel_surcharge"),
                    testid: "missing-invoice-item-in-fuel-surcharge-warning",
                    link: (
                        <Link
                            href={`/app/fuel-surcharges/${pricing.fuel_surcharge_agreement.uid}/`}
                            data-testid="modify-fuel-surcharge-agreement-if-missing-invoice-item"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t("invoicing.ModifyFuelSurchargeAgreementIfMissingInvoiceItem")}
                            <Icon name="openInNewTab" ml={3} />
                        </Link>
                    ),
                });
            }
        }
        return missingData;
    }
};

export {TransportHeader};

function getErrorNotices(transport: Transport) {
    const errorNotices: React.JSX.Element[] = [];

    /* DECLINED TRANSPORT */
    if (transport.status === "declined") {
        errorNotices.push(
            <DeclinedTransportNotice transport={transport} key="declined-transport" />
        );
    }

    /* CANCELLED TRANSPORT */
    const cancelledStatusUpdate = getLastStatusUpdateForCategory("cancelled", transport);
    if (cancelledStatusUpdate) {
        errorNotices.push(
            <CancelledTransportNotice transport={transport} key="cancelled-transport" />
        );
    }

    return errorNotices;
}

function getWarningNotices(transport: Transport) {
    const warningNotices: React.JSX.Element[] = [];

    /* INCONSISTENT DATES */
    const transportIsNotFinished = !transportStateService.isFinished(transport);

    const {hasAskedDatesInconsistency, hasScheduledDates, hasScheduledDatesInconsistency} =
        getDatesConsistency(transport);
    const datesHaveInconsistencies =
        (hasAskedDatesInconsistency && !hasScheduledDates) || hasScheduledDatesInconsistency;

    if (transportIsNotFinished && datesHaveInconsistencies) {
        warningNotices.push(
            <Text
                color="inherit"
                key="inconsistent-dates-transport"
                data-testid="inconsistent-dates-transport"
            >
                {t("transport.inconsistentDates")}
            </Text>
        );
    }

    return warningNotices;
}

function getInfoNotices(transport: Transport, isPublicViewer: boolean) {
    const infoNotices: React.JSX.Element[] = [];

    /* BUSINESS PRIVACY (keep it first) */
    if (!isPublicViewer && transport.business_privacy) {
        infoNotices.push(<BusinessPrivacyInformationLabel key="business-privacy" />);
    }

    /* QUALIMAT / IDTF CERTIFICATION */
    if (
        !transport.carrier?.enforce_qualimat_standard &&
        deliveryIsQualimat(transport.deliveries[0])
    ) {
        infoNotices.push(
            <Text
                color="inherit"
                key="qualimat"
                data-testid="idtf-load-without-carrier-certification-information-label"
            >
                {t("qualimat.carrierUnknown")}
            </Text>
        );
    }

    /* DANGEROUS LOADS */
    const transportHasDangerousLoads = transport.deliveries.some((delivery) =>
        delivery.loads.some((load) => load?.is_dangerous)
    );
    if (transportHasDangerousLoads) {
        infoNotices.push(
            <Text
                color="inherit"
                key="dangerous-loads"
                data-testid="dangerous-load-information-label"
            >
                {t("adr.warningPaperVersionNeededForControl")}
            </Text>
        );
    }

    return infoNotices;
}
