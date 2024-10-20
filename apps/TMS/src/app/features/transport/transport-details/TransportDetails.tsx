import {
    apiService,
    getConnectedGroupViews,
    getConnectedManager,
    HasFeatureFlag,
    HasNotFeatureFlag,
    managerService,
    useFeatureFlag,
} from "@dashdoc/web-common";
import {Logger, queryService, t} from "@dashdoc/web-core";
import {Box, Card, Flex, LoadingWheel, Text, themeAwareCss, toast} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import {Company, Pricing, PricingPost, Tag, PurchaseCostLine, GroupView} from "dashdoc-utils";
import {TelematicDistanceResponse} from "dashdoc-utils/dist/api/scopes/transports";
import flatten from "lodash.flatten";
import React, {ReactNode, useEffect, useState} from "react";

import {TransportMap} from "app/features/maps/TransportMap";
import {fuelSurchargeService} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {TransportPriceTabs} from "app/features/pricing/transport-price/TransportPriceTabs";
import {SetInvoiceNumberModal} from "app/features/transport/actions/set-invoice-number-modal";
import {TransportDocumentsPanelWithTrackDechets} from "app/features/transport/track-dechets/TransportDocumentsPanelWithTrackDechets";
import {ArchiveButton} from "app/features/transport/transport-details/actions/ArchiveButton";
import {CancelOrderButton} from "app/features/transport/transport-details/actions/CancelOrderButton";
import {CheckOrderButton} from "app/features/transport/transport-details/actions/CheckOrderButton";
import {ConfirmOrderButton} from "app/features/transport/transport-details/actions/ConfirmOrderButton";
import {DeclineOrderButton} from "app/features/transport/transport-details/actions/DeclineOrderButton";
import {DeleteButton} from "app/features/transport/transport-details/actions/DeleteButton";
import {DuplicateOrderButton} from "app/features/transport/transport-details/actions/DuplicateOrderButton";
import {
    InvoiceTransportButton,
    InvoiceTransportModals,
    InvoiceTransportWrapper,
} from "app/features/transport/transport-details/actions/InvoiceTransportAction";
import {MarkDoneButton} from "app/features/transport/transport-details/actions/markDoneButton";
import {MarkNotPaidButton} from "app/features/transport/transport-details/actions/MarkNotPaidButton";
import {MarkNotVerifiedButton} from "app/features/transport/transport-details/actions/MarkNotVerifiedButton";
import {MarkPaidButton} from "app/features/transport/transport-details/actions/MarkPaidButton";
import {MarkTransportInvoicedButton} from "app/features/transport/transport-details/actions/MarkTransportInvoicedButton";
import {RestoreButton} from "app/features/transport/transport-details/actions/RestoreButton";
import {
    ActionButtonType,
    transportActionButtonsService,
} from "app/features/transport/transport-details/actions/transportActionButtons.service";
import {UncheckOrderButton} from "app/features/transport/transport-details/actions/UncheckOrderButton";
import {
    ShareTransportModal,
    type SharingTabId,
} from "app/features/transport/transport-details/share-transport-modal/ShareTransportModal";
import {StatusButtonName} from "app/features/transport/transport-details/statusButtonPermissions";
import {CustomerToInvoiceInformation} from "app/features/transport/transport-information/CustomerToInvoiceInformation";
import {InformationBlockTitle} from "app/features/transport/transport-information/information-block-title";
import {TransportInvoiceNumber} from "app/features/transport/transport-information/transport-invoice-number";
import {InvoiceInfoForTransport} from "app/features/transport/transport-information/TransportInvoicingInformation";
import {AssignmentCard} from "app/features/transportation-plan/AssignmentCard";
import {useRefreshTransportLists} from "app/hooks/useRefreshTransportLists";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {
    fetchAddNote,
    fetchRetrieveTransport,
    fetchUpdateTransportDistances,
    fetchUpdateTransportTags,
    fetchUpdateTransportTelematic,
    fetchUpsertPurchaseCost,
} from "app/redux/actions";
import {useDispatch, useSelector} from "app/redux/hooks";
import {
    getLastPricingUpdatedEvent,
    getLastQuotationUpdatedEvent,
    getLastShipperFinalPriceUpdatedEvent,
    getLastTransportEventByUid,
} from "app/redux/selectors";
import {
    computePricingBeforeSubmit,
    computeShipperFinalPriceBeforeSubmit,
    getInitialPricingForm,
    invoicingRightService,
    PricingFormData,
    pricingService,
} from "app/services/invoicing";
import {isTransportOrder, transportViewerService} from "app/services/transport";
import {activityService} from "app/services/transport/activity.service";

import {TagSection} from "../../core/tags/TagSection";
import {PricesModal} from "../../pricing/prices/PricesModal";
import PricingModal from "../../pricing/pricing-modal";
import {DistanceModal} from "../distance/distance-modal";
import {PublicTransportCarbonFootprintSection} from "../transport-information/carbon-footprint/public-transport-carbon-footprint-section";
import {TransportInformation} from "../transport-information/TransportInformation";

import {CreateTemplateButton} from "./actions/CreateTemplateButton";
import {MarkNotBilledButton} from "./actions/MarkNotBilledButton";
import {MarkVerifiedButton} from "./actions/MarkVerifiedButton";
import {UnarchiveButton} from "./actions/UnarchiveButton";
import {TransportDetailsActivities} from "./transport-details-activities/TransportDetailsActivities";
import {TransportStats} from "./transport-stats/TransportStats";
import TransportStatusList from "./transport-status-list/TransportStatusList";
import {TransportHeader} from "./TransportHeader";
import TransportProgressBarDetail from "./TransportProgressBarDetail";

import type {Activity, Transport} from "app/types/transport";

const Row = styled(Flex)(
    themeAwareCss({
        flexWrap: "wrap",
        marginLeft: -3,
    })
);

type Props = {
    transport: Transport;
    isDelivery?: boolean;
    company: Company | null;
    onTransportDeleted?: () => void;
    refetchTransports?: (onlyCounters?: boolean) => void;
    reloadTransportsToInvoice?: (invoicesCreated?: boolean) => void;
    isFullScreen?: boolean;
};

function TransportComponent({
    transport,
    isDelivery,
    company,
    onTransportDeleted,
    refetchTransports,
    reloadTransportsToInvoice,
    isFullScreen,
}: Props) {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [isStatusButtonLoading, setIsStatusButtonLoading] = useState(false);
    const [publicToken, setPublicToken] = useState<string | null>(null);
    const [isRestoring, setIsRestoring] = useState(false);

    const [sharingModal, setSharingModal] = useState<{open: boolean; initialTab: SharingTabId}>({
        open: false,
        initialTab: "visibility-tab",
    });
    const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
    const [invoice, setInvoice] = useState<InvoiceInfoForTransport | null>(null);

    const [isPricesLoading, setIsPricesLoading] = useState(true);
    const [agreedPrice, setAgreedPrice] = useState<Pricing | null>(null);
    const [invoicedPrice, setInvoicedPrice] = useState<Pricing | null>(null);
    const [shipperFinalPrice, setShipperFinalPrice] = useState<Pricing | null>(null);

    const [setInvoiceNumberModalOpen, setSetInvoiceNumberModalOpen] = useState(false);
    const [agreedPriceModalOpen, setAgreedPriceModalOpen] = useState(false);
    const [invoicedPriceModalOpen, setInvoicedPriceModalOpen] = useState(false);
    const [pricesModalOpen, setPricesModalOpen] = useState<"pricing" | "purchaseCost" | null>(
        null
    );

    const [segmentDistanceModalOpen, setSegmentDistanceModalOpen] = useState(false);

    const connectedManager = useSelector(getConnectedManager);
    const groupViews = useSelector(getConnectedGroupViews);
    const hasCarrierAndShipperPriceEnabled = useFeatureFlag("carrierAndShipperPrice");
    const hasShipperFinalPriceEnabled = useFeatureFlag("shipperFinalPrice");
    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");
    const lastAgreedPriceUpdatedEvent = useSelector(getLastQuotationUpdatedEvent);
    const lastInvoicedPriceUpdatedEvent = useSelector(getLastPricingUpdatedEvent);
    const lastShipperFinalPriceUpdatedEvent = useSelector(getLastShipperFinalPriceUpdatedEvent);

    useEffect(() => {
        const init = async () => {
            fetchPrices();
            // PublicToken will be used for PublicAcceptDecline flow.
            const publicToken = queryService.getQueryParameterByName("public_token");
            if (!publicToken) {
                // At this point we do not want to show this information
                // in the PublicAcceptDeclineOrder screen, so we don't call
                // the endpoints.
                fetchTransportInvoice();
            }
            setPublicToken(publicToken);
        };
        init();
    }, []);

    useEffect(() => {
        if (transport.uid === lastAgreedPriceUpdatedEvent?.data.transport_uid) {
            dispatch(fetchRetrieveTransport(lastAgreedPriceUpdatedEvent.data.transport_uid));
            fetchTransportAgreedPrice();
        }
    }, [lastAgreedPriceUpdatedEvent?.timestamp]);

    useEffect(() => {
        if (transport.uid === lastInvoicedPriceUpdatedEvent?.data.transport_uid) {
            dispatch(fetchRetrieveTransport(lastInvoicedPriceUpdatedEvent.data.transport_uid));
            fetchTransportInvoicedPrice();
        }
    }, [lastInvoicedPriceUpdatedEvent?.timestamp]);

    useEffect(() => {
        if (transport.uid === lastShipperFinalPriceUpdatedEvent?.data.transport_uid) {
            dispatch(fetchRetrieveTransport(lastShipperFinalPriceUpdatedEvent.data.transport_uid));
            fetchTransportShipperFinalPrice();
        }
    }, [lastShipperFinalPriceUpdatedEvent?.timestamp]);

    useEffect(() => {
        // Update children pricing
        if (
            transport.segments
                .filter((segment) => segment.child_transport)
                .map((segment) => segment.child_transport?.uid)
                .includes(lastAgreedPriceUpdatedEvent?.data.transport_uid)
        ) {
            dispatch(fetchRetrieveTransport(transport.uid));
        }
    }, [lastAgreedPriceUpdatedEvent?.timestamp]);

    useEffect(() => {
        if (
            transport.segments
                .filter((segment) => segment.child_transport)
                .map((segment) => segment.child_transport?.uid)
                .includes(lastAgreedPriceUpdatedEvent?.data.transport_uid)
        ) {
            dispatch(fetchRetrieveTransport(transport.uid));
        }
    }, [lastInvoicedPriceUpdatedEvent?.timestamp]);

    // if transport has been restored, hide loading wheel
    // (using .then after fetchRestoreTransport is too soon, transport has not been updated in props yet)

    const fetchTransportInvoice = async () => {
        if (!hasInvoiceEntityEnabled) {
            return;
        }

        setIsInvoiceLoading(true);

        try {
            const invoice: InvoiceInfoForTransport = await apiService.get(
                `/transports/${transport.uid}/invoice-document-number/`,
                {apiVersion: "web"}
            );
            setInvoice(invoice);
        } catch (error) {
            Logger.log(`Transport ${transport.uid} has no invoice.`);
        }

        setIsInvoiceLoading(false);
    };

    const fetchPrices = async () => {
        setIsPricesLoading(true);
        await Promise.all([
            fetchTransportAgreedPrice(),
            fetchTransportInvoicedPrice(),
            fetchTransportShipperFinalPrice(),
        ]);
        setIsPricesLoading(false);
    };

    const fetchTransportAgreedPrice = async () => {
        try {
            const agreedPrice: Pricing = await apiService.get(
                `/transports/${transport.uid}/quotation/`,
                {
                    apiVersion: "v4",
                }
            );

            setAgreedPrice(agreedPrice);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${transport.uid} agreedPrice.`);
            setAgreedPrice(null);
        }
    };

    const fetchTransportInvoicedPrice = async () => {
        try {
            const invoicedPrice: Pricing = await apiService.get(
                `/transports/${transport.uid}/pricing/`
            );
            setInvoicedPrice(invoicedPrice);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${transport.uid} invoicedPrice.`);
            setInvoicedPrice(null);
        }
    };

    const fetchTransportShipperFinalPrice = async () => {
        if (!hasShipperFinalPriceEnabled) {
            return;
        }
        try {
            const shipperFinalPrice: Pricing = await apiService.get(
                `/transports/${transport.uid}/shipper-final-price/`,
                {apiVersion: "web"}
            );
            setShipperFinalPrice(shipperFinalPrice);
        } catch (error) {
            Logger.log(
                `Error when trying to retrieve transport ${transport.uid} shipperFinalPrice.`
            );
            setShipperFinalPrice(null);
        }
    };

    const openSharingModal = (tab: SharingTabId) => {
        setSharingModal({open: true, initialTab: tab});
    };

    const isOrder = () => isTransportOrder(transport, company?.pk);

    const handleShowPricesModal = (tab: "pricing" | "purchaseCost") => {
        setPricesModalOpen(tab ?? "pricing");
    };

    const handleClosePricesModal = async () => {
        setPricesModalOpen(null);

        // If the shipper final price was copied from another price but wasn't submitted,
        // it will still be in this component state, so we need to refetch it to be correct.
        setIsPricesLoading(true);
        await fetchTransportShipperFinalPrice();
        setIsPricesLoading(false);
    };

    const handleShowQuotationModal = () => {
        setAgreedPriceModalOpen(true);
    };

    const handleShowInvoiceNumberModal = () => {
        setSetInvoiceNumberModalOpen(true);
    };

    const handleShowInvoicedPriceModal = () => {
        setInvoicedPriceModalOpen(true);
    };

    const handleSubmitQuotation = async (newQuotation: PricingFormData) => {
        const isCarrier = transportViewerService.isCarrierOf(transport, company?.pk);
        const agreedPriceToSubmit = computePricingBeforeSubmit(newQuotation, isCarrier);
        await submitQuotation(agreedPriceToSubmit);
    };

    const submitQuotation = async (
        agreedPriceToSubmit: PricingPost,
        sendOrderUpdatedMail = true
    ) => {
        try {
            const agreedPrice: Pricing = await apiService.post(
                `/transports/${transport.uid}/quotation/`,
                {...agreedPriceToSubmit, send_order_updated_mail: sendOrderUpdatedMail},
                {
                    apiVersion: "v4",
                }
            );
            setAgreedPrice(agreedPrice);
            setAgreedPriceModalOpen(false);
            setPricesModalOpen(null);
            toast.success(t("components.upsertQuotationSuccess"));
        } catch (error) {
            Logger.error("Couldn't upsert agreedPrice", error);
            toast.error(t("common.error"));
        }
    };

    const handleSubmitShipperFinalPrice = async (newPricing: PricingFormData) => {
        const shipperFinalPriceToSubmit = computeShipperFinalPriceBeforeSubmit(newPricing);

        try {
            const shipperFinalPrice: Pricing = await apiService.post(
                `/transports/${transport.uid}/shipper-final-price/`,
                shipperFinalPriceToSubmit,
                {
                    apiVersion: "web",
                }
            );
            setShipperFinalPrice(shipperFinalPrice);
            setInvoicedPriceModalOpen(false);
            setPricesModalOpen(null);
            toast.success(t("components.upsertShipperFinalPrice"));
            reloadTransportsToInvoice?.();
        } catch (error) {
            Logger.error("Couldn't upsert shipperFinalPrice", error);
            toast.error(t("common.error"));
        }
    };

    const handleSubmitPricing = async (newPricing: PricingFormData) => {
        const isCarrier = transportViewerService.isCarrierOf(transport, company?.pk);
        const invoicedPriceToSubmit = computePricingBeforeSubmit(newPricing, isCarrier);

        try {
            const invoicedPrice: Pricing = await apiService.post(
                `/transports/${transport.uid}/pricing/`,
                invoicedPriceToSubmit,
                {
                    apiVersion: "v4",
                }
            );
            setInvoicedPrice(invoicedPrice);
            setInvoicedPriceModalOpen(false);
            setPricesModalOpen(null);
            toast.success(t("components.upsertPricingSuccess"));
            reloadTransportsToInvoice?.();
        } catch (error) {
            Logger.error("Couldn't upsert invoicedPrice", error);
            toast.error(t("common.error"));
        }
    };
    const _renderPriceModal = (canOnlyReadPricing: boolean) => {
        if (!invoicedPriceModalOpen) {
            return null;
        }

        const isCarrierOfTransport = transportViewerService.isCarrierOf(transport, company?.pk);
        const isOwnerOfCurrentFuelSurchargeAgreement =
            fuelSurchargeService.isOwnerOfPricingFuelSurchargeAgreement(agreedPrice, company);

        return (
            <PricingModal
                isCarrierOfTransport={isCarrierOfTransport}
                isOwnerOfCurrentFuelSurchargeAgreement={isOwnerOfCurrentFuelSurchargeAgreement}
                isPricing
                initialPricing={getInitialPricingForm(invoicedPrice, company)}
                readOnly={canOnlyReadPricing}
                onClose={() => setInvoicedPriceModalOpen(false)}
                onSubmitPricing={handleSubmitPricing}
                initialRealQuantities={invoicedPrice?.real_quantities}
                initialPlannedQuantities={invoicedPrice?.planned_quantities}
                transport={transport}
            />
        );
    };

    const _renderPricesModal = () => {
        if (!pricesModalOpen) {
            return null;
        }
        return (
            <PricesModal
                defaultTab={pricesModalOpen}
                agreedPrice={agreedPrice}
                invoicedPrice={invoicedPrice}
                shipperFinalPrice={shipperFinalPrice}
                transport={transport}
                connectedCompany={company}
                onSubmitAgreedPrice={handleSubmitQuotation}
                onSubmitInvoicedPrice={handleSubmitPricing}
                onSubmitShipperFinalPrice={handleSubmitShipperFinalPrice}
                onClose={handleClosePricesModal}
                onCopyToFinalPrice={handleCopyToFinalPrice}
                onSubmitPurchaseCost={handleUpsertPurchaseCost}
            />
        );
    };

    const handleOnAddTag = (tag: Tag) => {
        dispatch(fetchUpdateTransportTags(transport.uid, [...transport.tags, tag]));
    };

    const handleOnDeleteTag = (tag: Tag) => {
        dispatch(
            fetchUpdateTransportTags(transport.uid, [
                ...transport.tags.filter((t) => t.pk !== tag.pk),
            ])
        );
    };

    const handleCopyToFinalPrice = (source: "agreedPrice" | "invoicedPrice") => {
        const sourcePricing = source === "agreedPrice" ? agreedPrice : invoicedPrice;
        const newShipperFinalPrice = pricingService.copyPricingAsFinalPrice(sourcePricing);

        setShipperFinalPrice(newShipperFinalPrice);
    };

    const handleUpsertPurchaseCost = (purchaseCostLines: PurchaseCostLine[]) => {
        dispatch(fetchUpsertPurchaseCost(transport.uid, purchaseCostLines));
        setPricesModalOpen(null);
    };

    if (!transport || transport.__partial || isRestoring) {
        return <LoadingWheel />;
    }

    let companiesFromConnectedGroupView: number[] = [];
    if (company?.pk) {
        const connectedGroupView = groupViews.find((gv: GroupView) =>
            gv.companies.includes(company?.pk as number)
        );
        if (connectedGroupView?.companies) {
            companiesFromConnectedGroupView = connectedGroupView?.companies;
        }
    }

    const activitiesByMeans = activityService.getTransportActivitiesByMeans(transport, {
        activityTypesToOmit: ["bulkingBreakStart", "bulkingBreakEnd"],
    });
    const activities = flatten(Array.from(activitiesByMeans.values())) as Activity[];
    const sites = activities.map((activity) => activity.site);

    const isPrivateViewer = transportViewerService.isPrivateViewerOf(transport, company?.pk);
    const isCarrier = transportViewerService.isCarrierOf(transport, company?.pk);
    const isOwnerOfCurrentFuelSurchargeAgreement =
        fuelSurchargeService.isOwnerOfPricingFuelSurchargeAgreement(agreedPrice, company);

    const canSeePricingBlock =
        invoicingRightService.canReadPrices(transport, companiesFromConnectedGroupView) ||
        queryService.isPublicTokenAuthorized();

    const canUpdatePricing = invoicingRightService.canEditInvoicedPrice(
        transport,
        company?.pk,
        hasCarrierAndShipperPriceEnabled,
        companiesFromConnectedGroupView
    );

    const canReadPrices =
        invoicingRightService.canReadPrices(transport, companiesFromConnectedGroupView) ||
        !!publicToken;

    const canUpdateQuotation = invoicingRightService.canEditAgreedPrice(
        transport,
        company?.pk,
        hasShipperFinalPriceEnabled
    );

    const canOnlyReadPricing = !canUpdatePricing && canReadPrices;
    const canOnlyReadQuotation = !canUpdateQuotation && canReadPrices;

    /**
     * In the case of a draft assigned carrier,
     * for display and edition, we'll use the carrier_draft_assigned field instead of carrier_address
     **/
    const isCarrierDraftAssigned = transportViewerService.isCarrierDraftAssigned(transport);

    const canUpdateTags = managerService.hasAtLeastUserRole(connectedManager);

    const pricing = pricingService.getTransportPricing({
        transport,
        companyPk: company?.pk,
        agreedPrice: agreedPrice,
        invoicedPrice: invoicedPrice,
        shipperFinalPrice: shipperFinalPrice,
        hasCarrierAndShipperPriceEnabled: hasCarrierAndShipperPriceEnabled,
        hasShipperFinalPriceEnabled: hasShipperFinalPriceEnabled,
        includeEmpty: true, // This is needed to get the quantities when subcontracting
        companiesFromConnectedGroupView,
    });

    return (
        <>
            <InvoiceTransportWrapper>
                <TransportHeader
                    transport={transport}
                    isOrder={isOrder()}
                    getButtons={getHeaderButtons}
                    pricing={invoicedPrice}
                    openPricingModal={() => {
                        setInvoicedPriceModalOpen(true);
                    }}
                    openSharingModal={openSharingModal}
                    reloadTransportsToInvoice={reloadTransportsToInvoice}
                    isFullScreen={isFullScreen ?? false}
                    wasteManagementEnabled={company?.settings?.flanders_waste_management ?? false}
                />
                <InvoiceTransportModals
                    transportUid={transport.uid}
                    refetchTransports={refetchTransports}
                    setInvoice={setInvoice}
                    reloadTransportsToInvoice={reloadTransportsToInvoice}
                />
            </InvoiceTransportWrapper>
            <AssignmentCard
                transport={transport}
                company={company}
                agreedPrice={agreedPrice}
                onAssign={fetchTransportAgreedPrice}
                onConfirmAssignation={fetchTransportAgreedPrice}
                onCancelAssignation={fetchTransportAgreedPrice}
                onAbortOffer={fetchTransportAgreedPrice}
            />
            <Box
                css={
                    transport.deleted &&
                    css`
                        opacity: 0.7;
                        pointer-events: none;
                    `
                }
            >
                <Row>
                    <Box flex={2} flexBasis={600}>
                        <Card pt={3} ml={3} mb={3}>
                            <Box px={3}>
                                {isDelivery && (
                                    <TransportProgressBarDetail transport={transport} />
                                )}
                            </Box>
                            <TransportInformation
                                transport={transport}
                                invoice={invoice}
                                isInvoiceLoading={isInvoiceLoading}
                                isPricesLoading={isPricesLoading}
                                agreedPrice={agreedPrice}
                                invoicedPrice={invoicedPrice}
                                shipperFinalPrice={shipperFinalPrice}
                                isCarrierDraftAssigned={isCarrierDraftAssigned}
                                onSetInvoiceNumber={handleShowInvoiceNumberModal}
                                onClickOnAgreedPrice={handleShowQuotationModal}
                                onClickOnInvoicedPrice={handleShowInvoicedPriceModal}
                                onClickOnDistance={() => setSegmentDistanceModalOpen(true)}
                                onClickOnTrackingContacts={() =>
                                    openSharingModal("notifications-tab")
                                }
                                reloadTransportsToInvoice={reloadTransportsToInvoice}
                                refetchTransports={refetchTransports}
                            />
                        </Card>
                        <HasFeatureFlag flagName="carrierAndShipperPrice">
                            {canSeePricingBlock ? (
                                <Flex
                                    backgroundColor="grey.white"
                                    boxShadow="medium"
                                    borderRadius={2}
                                    flex={1}
                                    flexDirection={"column"}
                                    ml={3}
                                    mb={3}
                                >
                                    <Box
                                        flex={1}
                                        mt={5}
                                        pb={0}
                                        borderBottomStyle="solid"
                                        borderBottomWidth="1px"
                                        borderBottomColor="grey.light"
                                    >
                                        <Flex flexDirection="row" px={3}>
                                            <CustomerToInvoiceInformation
                                                transport={transport}
                                                reloadTransportsToInvoice={
                                                    reloadTransportsToInvoice
                                                }
                                            />

                                            <InformationBlockTitle
                                                iconName="invoice"
                                                label={t("components.invoiceNumberLabel")}
                                            >
                                                <Box my={1}>
                                                    <TransportInvoiceNumber
                                                        transport={transport}
                                                        invoice={invoice}
                                                        isInvoiceLoading={isInvoiceLoading}
                                                        onClickOnInvoiceNumber={
                                                            handleShowInvoiceNumberModal
                                                        }
                                                        hideLabel={true}
                                                    />
                                                </Box>
                                            </InformationBlockTitle>
                                        </Flex>
                                    </Box>
                                    <Flex flex={2} mt={3} mb={4} px={3}>
                                        {isPricesLoading ? (
                                            <LoadingWheel noMargin />
                                        ) : (
                                            <TransportPriceTabs
                                                transport={transport}
                                                agreedPrice={agreedPrice}
                                                invoicedPrice={invoicedPrice}
                                                shipperFinalPrice={shipperFinalPrice}
                                                onClickOnPrice={handleShowPricesModal}
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            ) : (
                                <Box
                                    backgroundColor="grey.white"
                                    boxShadow="medium"
                                    borderRadius={2}
                                    flex={1}
                                    ml={3}
                                    mb={3}
                                >
                                    <TransportStats
                                        transport={transport}
                                        onClickOnDistance={() => setSegmentDistanceModalOpen(true)}
                                    />
                                </Box>
                            )}
                        </HasFeatureFlag>
                    </Box>
                    <Flex flex={1} flexBasis={300} flexDirection="column">
                        <Card flex={3} ml={3} mb={3} minHeight={200}>
                            <TransportMap transport={transport} activities={activities} />
                        </Card>
                        <HasFeatureFlag flagName="carrierAndShipperPrice">
                            {canSeePricingBlock && (
                                <Box
                                    backgroundColor="grey.white"
                                    boxShadow="medium"
                                    borderRadius={2}
                                    flex={1}
                                    ml={3}
                                    mb={3}
                                >
                                    <TransportStats
                                        transport={transport}
                                        onClickOnDistance={() => setSegmentDistanceModalOpen(true)}
                                    />
                                </Box>
                            )}
                        </HasFeatureFlag>
                    </Flex>
                </Row>
                {!isPrivateViewer && (
                    <HasNotFeatureFlag flagName="carrierAndShipperPrice">
                        <Row>
                            <PublicTransportCarbonFootprintSection transport={transport} />
                        </Row>
                    </HasNotFeatureFlag>
                )}

                <Row>
                    <Box
                        backgroundColor="grey.white"
                        boxShadow="medium"
                        borderRadius={2}
                        flex="1"
                        ml={3}
                        mb={3}
                        p={3}
                    >
                        <Text variant="h1" mb={1}>
                            {t("common.tags")}
                        </Text>
                        <Flex flexWrap="wrap">
                            <TagSection
                                tags={transport.tags}
                                canUpdateTags={canUpdateTags}
                                onAdd={handleOnAddTag}
                                onDelete={handleOnDeleteTag}
                            />
                        </Flex>
                    </Box>
                </Row>

                <TransportDetailsActivities
                    transport={transport}
                    pricing={pricing}
                    activitiesByMeans={activitiesByMeans}
                    onClickOnActivityDistance={() => setSegmentDistanceModalOpen(true)}
                />

                <Row>
                    <Card flex="1 1 500px" p={3} ml={3} mb={3}>
                        <TransportDocumentsPanelWithTrackDechets
                            transport={transport}
                            readOnly={!isPrivateViewer}
                            hasTrackDechetEnabled={company?.settings?.trackdechets ?? false}
                        />
                    </Card>
                    <Card flex="1 1 550px" p={3} ml={3} mb={3}>
                        <h5>{t("components.events")}</h5>
                        <TransportStatusList
                            isOrder={isOrder()}
                            transport={transport}
                            onAddNote={(transportUid, deliveryUid, message) =>
                                dispatch(fetchAddNote(transportUid, deliveryUid, message))
                            }
                            showInput={isPrivateViewer}
                        />
                    </Card>
                </Row>

                {setInvoiceNumberModalOpen && (
                    <SetInvoiceNumberModal
                        transport={transport}
                        onClose={() => {
                            setSetInvoiceNumberModalOpen(false);
                        }}
                    />
                )}

                {sharingModal.open && (
                    <ShareTransportModal
                        onClose={() => {
                            setSharingModal({open: false, initialTab: "visibility-tab"});
                        }}
                        transport={transport}
                        sites={sites}
                        initialTab={sharingModal.initialTab}
                    />
                )}
                {/*
                        //ANCHOR[id=pricing-modal-use]
                    */}
                {agreedPriceModalOpen && (
                    <PricingModal
                        isCarrierOfTransport={isCarrier}
                        isOwnerOfCurrentFuelSurchargeAgreement={
                            isOwnerOfCurrentFuelSurchargeAgreement
                        }
                        initialPricing={getInitialPricingForm(agreedPrice, company)}
                        initialPlannedQuantities={agreedPrice?.planned_quantities}
                        initialRealQuantities={agreedPrice?.real_quantities}
                        onClose={() => setAgreedPriceModalOpen(false)}
                        readOnly={canOnlyReadQuotation}
                        onSubmitPricing={handleSubmitQuotation}
                        transport={transport}
                    />
                )}
                {_renderPriceModal(canOnlyReadPricing)}
                {_renderPricesModal()}

                {segmentDistanceModalOpen && transport.carrier?.pk == company?.pk && (
                    <DistanceModal
                        transport={transport}
                        onClose={() => setSegmentDistanceModalOpen(false)}
                        onSubmit={({totalTransportDistance, distancesBySegmentUid}) => {
                            dispatch(
                                fetchUpdateTransportDistances(
                                    transport.uid,
                                    totalTransportDistance,
                                    distancesBySegmentUid
                                )
                            );
                        }}
                    />
                )}
            </Box>
        </>
    );

    function getHeaderButtons(clearPopoverState: () => void) {
        const unarchiveButton = (
            <UnarchiveButton
                key="unarchive"
                transportUid={transport.uid}
                isDeleted={!!transport.deleted}
                isLoading={isLoading}
                refetchTransports={refetchTransports}
                clearPopoverState={clearPopoverState}
            />
        );

        const archiveButton = (
            <ArchiveButton
                key="archive"
                transportUid={transport.uid}
                isDeleted={!!transport.deleted}
                isLoading={isLoading}
                refetchTransports={refetchTransports}
                clearPopoverState={clearPopoverState}
            />
        );

        const duplicateOrderButton = (
            <DuplicateOrderButton
                key="duplicate-order"
                transportIsDeleted={!!transport.deleted}
                isLoading={isLoading}
                transportNumber={transport.sequential_id}
                transportUid={transport.uid}
                refetchTransports={refetchTransports}
            />
        );

        const createTemplateButton = (
            <CreateTemplateButton
                key="create-template"
                transportUid={transport.uid}
                isDeleted={!!transport.deleted}
                isLoading={isLoading}
                isComplex={transport.shape === "complex"}
            />
        );
        const deleteButton = (
            <DeleteButton
                key="delete"
                transportUid={transport.uid}
                transportCarrierPk={transport.carrier?.pk}
                companyPk={company?.pk}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onTransportDeleted={onTransportDeleted}
                refetchTransports={refetchTransports}
                clearPopoverState={clearPopoverState}
            />
        );

        const restoreButton = (
            <RestoreButton
                key="restore"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isRestoring={isRestoring}
                setIsRestoring={setIsRestoring}
                refetchTransports={refetchTransports}
            />
        );

        const cancelOrderButton = (
            <CancelOrderButton
                key="cancel-order"
                transportUid={transport.uid}
                isLoading={isLoading}
                refetchTransports={refetchTransports}
                clearPopoverState={clearPopoverState}
            />
        );

        const declineOrderButton = (
            <DeclineOrderButton
                key="decline-button"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                refetchTransports={refetchTransports}
            />
        );
        const confirmOrderButton = (
            <ConfirmOrderButton
                key="confirm-order"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                refetchTransports={refetchTransports}
            />
        );

        const checkButton = (
            <CheckOrderButton
                key="check-order"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                refetchTransports={refetchTransports}
            />
        );

        const uncheckButton = (
            <UncheckOrderButton
                key="uncheck-order"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                refetchTransports={refetchTransports}
                clearPopoverState={clearPopoverState}
            />
        );
        const markDoneButton = (
            <MarkDoneButton
                key="mark-done"
                transport={transport}
                loading={isStatusButtonLoading}
                disabled={!!transport.deleted || isLoading}
            />
        );

        const markVerifiedButton = (
            <MarkVerifiedButton
                key="markVerifiedButton"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                setIsStatusButtonLoading={setIsStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );
        const invoiceTransportButton = (
            <InvoiceTransportButton
                key="invoicedButton"
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );

        const markTransportInvoicedButton = (
            <MarkTransportInvoicedButton
                key="markInvoicedButton"
                transport={transport}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );

        const markNotVerifiedButton = (
            <MarkNotVerifiedButton
                key="cancel-set-status-verified"
                transport={transport}
                isLoading={isLoading}
                isStatusButtonLoading={isStatusButtonLoading}
                setIsStatusButtonLoading={setIsStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );
        const markNotBilledButton = (
            <MarkNotBilledButton
                key={`cancel-set-status-invoiced`}
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                setIsStatusButtonLoading={setIsStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );

        const markPaidButton = (
            <MarkPaidButton
                key="markPaidButton"
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                setIsStatusButtonLoading={setIsStatusButtonLoading}
            />
        );

        const markNotPaidButton = (
            <MarkNotPaidButton
                key={`cancel-set-status-paid`}
                transportUid={transport.uid}
                isLoading={isLoading}
                isDeleted={!!transport.deleted}
                isStatusButtonLoading={isStatusButtonLoading}
                setIsStatusButtonLoading={setIsStatusButtonLoading}
                refetchTransports={refetchTransports}
            />
        );

        const buttonDict: Record<ActionButtonType | StatusButtonName, ReactNode> = {
            //actions
            confirmOrder: confirmOrderButton,
            declineOrder: declineOrderButton,
            cancelOrder: cancelOrderButton,
            duplicateOrder: duplicateOrderButton,
            checkOrder: checkButton,
            uncheckOrder: uncheckButton,
            delete: deleteButton,
            restore: restoreButton,
            archive: archiveButton,
            unarchive: unarchiveButton,
            createTemplate: createTemplateButton,
            // status
            "mark-done-button": markDoneButton,
            "mark-verified-button": markVerifiedButton,
            "invoice-transport-button": invoiceTransportButton,
            "mark-transport-invoiced-button": markTransportInvoicedButton,
            "mark-not-verified-button": markNotVerifiedButton,
            "mark-not-billed-button": markNotBilledButton,
            "mark-paid-button": markPaidButton,
            "mark-not-paid-button": markNotPaidButton,
        };
        const {moreActions, defaults} = transportActionButtonsService.getHeaderButtons({
            transport,
            company,
            connectedManager,
            publicToken,
            hasInvoiceEntityEnabled,
        });
        return {
            moreActions: moreActions.map((buttonName) => buttonDict[buttonName]),
            defaults: defaults.map((buttonName) => buttonDict[buttonName]),
        };
    }
}

export const TransportContext = React.createContext<Transport | null>(null);

export function TransportDetails({
    transport,
    isDelivery,
    company,
    onTransportDeleted,
    refetchTransports,
    reloadTransportsToInvoice,
    isFullScreen,
}: Props) {
    const dispatch = useDispatch();
    const transportListRefresher = useRefreshTransportLists();
    const {isPublicViewer} = useTransportViewer(transport);

    const [lastTransportEventTimeStamp, setLastTransportEventTimeStamp] = useState<number | null>(
        null
    );
    const lastTransportEvent = useSelector((state) =>
        getLastTransportEventByUid(state, transport.uid)
    );
    if (
        lastTransportEvent != null &&
        lastTransportEvent.timestamp != lastTransportEventTimeStamp
    ) {
        setLastTransportEventTimeStamp(lastTransportEvent.timestamp);
    }

    useEffect(() => {
        async function fetchTelematicsDistance() {
            const response: TelematicDistanceResponse = await apiService.get(
                `/telematics/distance/${transport.uid}/`,
                {
                    apiVersion: "v4",
                }
            );
            dispatch(fetchUpdateTransportTelematic(transport.uid, response));
        }
        const publicToken = queryService.getQueryParameterByName("public_token");
        if (publicToken) {
            // At this point we do not want to show this information
            // in the PublicAcceptDeclineOrder screen, so we don't call
            // the endpoints.
            return;
        }
        fetchTelematicsDistance();
    }, [transport.uid, lastTransportEventTimeStamp, transport.deleted, isPublicViewer, dispatch]);

    return (
        <TransportContext.Provider value={transport}>
            <TransportComponent
                transport={transport}
                isDelivery={isDelivery}
                company={company}
                onTransportDeleted={onTransportDeleted}
                reloadTransportsToInvoice={reloadTransportsToInvoice}
                isFullScreen={isFullScreen}
                refetchTransports={(onlyCounter) => {
                    // There are cases where we want to avoid calling
                    // the transports-list and transports-list-count
                    // endpoints. For example:
                    // - a transport deletion automatically navigates to the deletion tab
                    //   which triggers those calls itself.
                    transportListRefresher(onlyCounter);
                    refetchTransports?.(onlyCounter);
                }}
            />
        </TransportContext.Provider>
    );
}
