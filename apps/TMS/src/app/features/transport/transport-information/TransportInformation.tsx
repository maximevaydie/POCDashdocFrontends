import {
    HasFeatureFlag,
    HasNotFeatureFlag,
    getConnectedCompany,
    useFeatureFlag,
    type CarrierInTransport,
} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    BoxProps,
    ClickableUpdateRegion,
    EditableField,
    Flex,
    NonClickableUpdateRegionStyle,
    Text,
} from "@dashdoc/web-ui";
import {OriginalAddress, Pricing, formatNumber, isEmptyPricing, useToggle} from "dashdoc-utils";
import flatten from "lodash.flatten";
import uniqBy from "lodash.uniqby";
import React, {FunctionComponent, useState} from "react";

import {UpdateAddressModal} from "app/features/address/modal/update-address-modal";
import {EditableReferenceList} from "app/features/address/reference/list/editable-reference-list";
import {UpdatableAddress} from "app/features/address/updatable-address";
import {UpdatableCarrier} from "app/features/address-book/partner/UpdatableCarrier";
import {UpdatableShipper} from "app/features/address-book/partner/UpdatableShipper";
import {
    DistanceBySegment,
    getTotalDistanceBySegmentUid,
} from "app/features/transport/distance/getTotalDistanceBySegmentUid";
import {CustomerToInvoiceInformation} from "app/features/transport/transport-information/CustomerToInvoiceInformation";
import {carrierApprovalService} from "app/features/transportation-plan/services/carrierApproval.service";
import {useTransportViewer} from "app/hooks/useTransportViewer";
import {
    fetchSetTransportCarrier,
    fetchSetTransportCarrierAddress,
    fetchSetTransportDraftCarrier,
    fetchSetTransportDraftCarrierAddress,
    fetchSetTransportShipper,
    fetchSetTransportShipperAddress,
} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {isTransportRental, transportRightService} from "app/services/transport";

import {UpdateReferenceListModal} from "../../address/reference/list/update-reference-list-modal";
import {ViewReferenceListModal} from "../../address/reference/list/view-reference-list-modal";

import {CarbonFootprintBanner} from "./carbon-footprint/CarbonFootprintBanner";
import {InformationBlockTitle} from "./information-block-title";
import {
    InvoiceInfoForTransport,
    TransportInvoicingInformation,
} from "./TransportInvoicingInformation";

import type {Transport} from "app/types/transport";

const TransportWarning: FunctionComponent<BoxProps> = (props) => (
    <Box backgroundColor="yellow.default" py={2} px={4} {...props} />
);

export type TransportInformationProps = {
    transport: Transport;
    invoice: InvoiceInfoForTransport | null;
    isInvoiceLoading: boolean;
    isPricesLoading: boolean;
    agreedPrice: Pricing | null;
    invoicedPrice: Pricing | null;
    shipperFinalPrice: Pricing | null;
    isCarrierDraftAssigned: boolean;
    onSetInvoiceNumber: () => void;
    onClickOnAgreedPrice: () => void;
    onClickOnInvoicedPrice: () => void;
    onClickOnDistance: () => void;
    onClickOnTrackingContacts: () => void;
    reloadTransportsToInvoice?: () => void;
    refetchTransports?: () => void;
};

type UpdatedReferenceState =
    | undefined
    | {
          role: "carrier" | "shipper" | "origin" | "destination";
          reference: string;
      };

export function TransportInformation(props: TransportInformationProps) {
    const connectedCompany = useSelector(getConnectedCompany);
    const {
        transport,
        invoice,
        isInvoiceLoading,
        isPricesLoading,
        agreedPrice,
        invoicedPrice,
        shipperFinalPrice,
        isCarrierDraftAssigned,
        onSetInvoiceNumber,
        onClickOnAgreedPrice,
        onClickOnInvoicedPrice,
        onClickOnDistance,
        onClickOnTrackingContacts,
        reloadTransportsToInvoice,
        refetchTransports,
    } = props;

    const dispatch = useDispatch();

    const [
        updateCarrierAddressModalOpened,
        openUpdateCarrierAddressModal,
        closeUpdateCarrierAddressModal,
    ] = useToggle(false);
    const [
        updateShipperAddressModalOpened,
        openUpdateShipperAddressModal,
        closeUpdateShipperAddressModal,
    ] = useToggle(false);

    const {isCarrier, isShipper, isCreator, isPublicViewer, isPublicTokenAuthorized} =
        useTransportViewer(transport);

    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const [updatedReference, setUpdatedReference] = useState<UpdatedReferenceState>(undefined);

    const [viewedReference, setViewedReference] = useState<string | undefined>(undefined);

    const carrierApprovalStatus = carrierApprovalService.getStatus(transport);
    const carrierApproved = ["done", "accepted", "cancelled"].includes(carrierApprovalStatus);

    const canEditTransport = transportRightService.canEditTransport(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const contactsUpdateAllowed = canEditTransport;

    const canEditTransportDistance = transportRightService.canEditTransportDistance(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const shipperAddressUpdatesAllowed = transportRightService.canEditShipperAddress(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const trackingContacts = uniqBy(
        flatten(transport.deliveries.map(({tracking_contacts}) => tracking_contacts)),
        "contact.uid"
    );

    const shipperReferenceUpdateAllowed = transportRightService.canEditShipperReference(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const carrierReferenceUpdateAllowed = transportRightService.canEditCarrierReference(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const totalTransportDistance = getTotalDistanceBySegmentUid(
        transport.segments as any as DistanceBySegment
    );

    let carrier: CarrierInTransport | null = null;
    if (isCarrierDraftAssigned) {
        carrier = transport.carrier_draft_assigned ?? null;
    } else {
        carrier = transport.carrier ?? null;
    }

    let shipper_reference: string | undefined;
    if (transport.deliveries.length > 0 && transport.deliveries[0]) {
        shipper_reference = transport.deliveries[0].shipper_reference;
    }

    return (
        <>
            {/* Main information */}
            <Flex flex={1} flexWrap="wrap" marginTop="-1em" p={3}>
                <Flex flex={1} minWidth={360} mt={3}>
                    <InformationBlockTitle iconName="shipper" label={t("common.shipper")} pr={1}>
                        <>
                            <HasFeatureFlag flagName="betterCompanyRoles">
                                <Box data-testid="updatable-shipper">
                                    <UpdatableShipper
                                        onUpdated={handleUpdateTransportShipper}
                                        shipper={transport.shipper}
                                        isModifyingFinalInfo={transport.status === "done"}
                                        isRental={isTransportRental(transport)}
                                        updateAllowed={canEditTransport} // we allow to update the carrier address even if the transport is in a prepared trip
                                    />

                                    {(shipperAddressUpdatesAllowed || shipper_reference) && (
                                        <EditableReferenceList
                                            reference={shipper_reference}
                                            label={t("components.ref")}
                                            placeholder={t("components.addReference")}
                                            updateAllowed={shipperAddressUpdatesAllowed}
                                            onEditReferenceClick={(reference) =>
                                                setUpdatedReference({
                                                    role: "shipper",
                                                    reference,
                                                })
                                            }
                                            onViewReferenceClick={(reference) =>
                                                setViewedReference(reference)
                                            }
                                            data-testid="updatable-carrier"
                                        />
                                    )}
                                </Box>
                            </HasFeatureFlag>
                            <HasNotFeatureFlag flagName="betterCompanyRoles">
                                {transport.deliveries[0]?.shipper_address && (
                                    <UpdatableAddress
                                        onClick={openUpdateShipperAddressModal}
                                        onEditReferenceClick={(reference) =>
                                            setUpdatedReference({role: "shipper", reference})
                                        }
                                        onViewReferenceClick={(reference) =>
                                            setViewedReference(reference)
                                        }
                                        address={transport.deliveries[0].shipper_address}
                                        reference={shipper_reference}
                                        addressUpdateAllowed={shipperAddressUpdatesAllowed}
                                        refUpdateAllowed={shipperReferenceUpdateAllowed}
                                        data-testid="updatable-shipper"
                                    />
                                )}
                            </HasNotFeatureFlag>
                        </>
                    </InformationBlockTitle>
                    <InformationBlockTitle iconName="carrier" label={t("common.carrier")} pl={1}>
                        {carrierApproved ? (
                            <>
                                <HasFeatureFlag flagName="betterCompanyRoles">
                                    <Box data-testid="updatable-carrier">
                                        <UpdatableCarrier
                                            onUpdated={handleUpdateTransportCarrier}
                                            carrier={carrier}
                                            isModifyingFinalInfo={transport.status === "done"}
                                            isRental={isTransportRental(transport)}
                                            updateAllowed={canEditTransport} // we allow to update the carrier address even if the transport is in a prepared trip
                                        />
                                        {(carrierReferenceUpdateAllowed ||
                                            transport.carrier_reference) && (
                                            <EditableReferenceList
                                                reference={transport.carrier_reference}
                                                label={t("components.ref")}
                                                placeholder={t("components.addReference")}
                                                updateAllowed={carrierReferenceUpdateAllowed}
                                                onEditReferenceClick={(reference) =>
                                                    setUpdatedReference({
                                                        role: "carrier",
                                                        reference,
                                                    })
                                                }
                                                onViewReferenceClick={(reference) =>
                                                    setViewedReference(reference)
                                                }
                                            />
                                        )}
                                    </Box>
                                </HasFeatureFlag>
                                <HasNotFeatureFlag flagName="betterCompanyRoles">
                                    <UpdatableAddress
                                        onClick={openUpdateCarrierAddressModal}
                                        onEditReferenceClick={(reference) =>
                                            setUpdatedReference({role: "carrier", reference})
                                        }
                                        onViewReferenceClick={(reference) =>
                                            setViewedReference(reference)
                                        }
                                        // @ts-ignore
                                        address={
                                            isCarrierDraftAssigned
                                                ? transport.carrier_address_draft_assigned
                                                : transport.carrier_address
                                        }
                                        reference={transport.carrier_reference}
                                        addressUpdateAllowed={canEditTransport} // we allow to update the carrier address even if the transport is in a prepared trip
                                        refUpdateAllowed={carrierReferenceUpdateAllowed}
                                        data-testid="updatable-carrier"
                                    />
                                </HasNotFeatureFlag>
                            </>
                        ) : (
                            <>
                                {carrierApprovalStatus === "requested" && (
                                    <NonClickableUpdateRegionStyle data-testid="carrier-approval-requested-info">
                                        {t("shipper.requestInProgress")}
                                    </NonClickableUpdateRegionStyle>
                                )}
                                {(carrierReferenceUpdateAllowed ||
                                    transport.carrier_reference) && (
                                    <EditableReferenceList
                                        reference={transport.carrier_reference}
                                        label={t("components.ref")}
                                        placeholder={t("components.addReference")}
                                        updateAllowed={carrierReferenceUpdateAllowed}
                                        onEditReferenceClick={(reference) =>
                                            setUpdatedReference({role: "carrier", reference})
                                        }
                                        onViewReferenceClick={(reference) =>
                                            setViewedReference(reference)
                                        }
                                        data-testid="updatable-carrier"
                                    />
                                )}
                            </>
                        )}
                    </InformationBlockTitle>
                </Flex>
                <HasNotFeatureFlag flagName="carrierAndShipperPrice">
                    <Flex flex={1} minWidth={360} mt={3}>
                        <CustomerToInvoiceInformation
                            transport={transport}
                            reloadTransportsToInvoice={reloadTransportsToInvoice}
                        />
                        {(!isPublicViewer || isPublicTokenAuthorized) && (
                            <>
                                <InformationBlockTitle
                                    iconName="euro"
                                    label={t("common.billing")}
                                    pl={1}
                                >
                                    <TransportInvoicingInformation
                                        transport={transport}
                                        invoice={invoice}
                                        isInvoiceLoading={isInvoiceLoading}
                                        isPricesLoading={isPricesLoading}
                                        agreedPrice={agreedPrice}
                                        invoicedPrice={invoicedPrice}
                                        shipperFinalPrice={shipperFinalPrice}
                                        onClickOnInvoiceNumber={onSetInvoiceNumber}
                                        onClickOnAgreedPrice={onClickOnAgreedPrice}
                                        onClickOnInvoicedPrice={onClickOnInvoicedPrice}
                                    />
                                </InformationBlockTitle>
                            </>
                        )}
                    </Flex>
                </HasNotFeatureFlag>
            </Flex>
            {/* Tracking contacts */}
            {!isPublicViewer && (
                <Flex p={3}>
                    <InformationBlockTitle
                        iconName="alarmBell"
                        label={t("transportDetails.emailNotifications")}
                    >
                        <Flex>
                            <Box maxWidth="100%">
                                <ClickableUpdateRegion
                                    clickable={contactsUpdateAllowed}
                                    onClick={onClickOnTrackingContacts}
                                    data-testid="transport-details-tracking-contacts"
                                >
                                    <Text ellipsis>
                                        {trackingContacts.length === 0 &&
                                            t("trackingContactsModal.noTrackingContacts")}
                                        {trackingContacts
                                            .map(
                                                (contact) =>
                                                    `${contact.contact.first_name} ${
                                                        contact.contact.last_name
                                                    } ${
                                                        contact.contact.email &&
                                                        `(${contact.contact.email})`
                                                    }`
                                            )
                                            .join(", ")}
                                    </Text>
                                </ClickableUpdateRegion>
                            </Box>
                        </Flex>
                    </InformationBlockTitle>
                    <HasNotFeatureFlag flagName="carrierAndShipperPrice">
                        <InformationBlockTitle
                            iconName="roadStraight"
                            label={t("activity.distanceSubtitle")}
                            maxWidth="100%"
                        >
                            <EditableField
                                clickable={canEditTransportDistance}
                                label={t("activity.distanceSubtitle")}
                                value={`${formatNumber(totalTransportDistance, {
                                    maximumFractionDigits: 0,
                                })} km`}
                                onClick={onClickOnDistance}
                                data-testid="transport-details-distance"
                            />
                        </InformationBlockTitle>
                    </HasNotFeatureFlag>
                </Flex>
            )}
            {/* Not carrier or shipper warning */}
            {isCreator && !(isCarrier || isShipper) && (
                <TransportWarning>
                    <Text>{t("components.notCarrierOrShipper")}</Text>
                </TransportWarning>
            )}

            {updatedReference !== undefined && (
                <UpdateReferenceListModal
                    onClose={() => {
                        setUpdatedReference(undefined);
                    }}
                    transportUid={transport.uid}
                    referenceType={updatedReference.role}
                    initialReference={updatedReference.reference}
                />
            )}

            {!isPublicViewer && (
                <HasNotFeatureFlag flagName="carrierAndShipperPrice">
                    <CarbonFootprintBanner
                        borderTopColor="grey.light"
                        borderTopWidth={1}
                        borderTopStyle="solid"
                        py={3}
                        px={4}
                        transport={transport}
                    />
                </HasNotFeatureFlag>
            )}

            {viewedReference !== undefined && (
                <ViewReferenceListModal
                    onClose={() => {
                        // @ts-ignore
                        setViewedReference(undefined);
                    }}
                    reference={viewedReference}
                />
            )}

            <HasNotFeatureFlag flagName="betterCompanyRoles">
                {updateCarrierAddressModalOpened && (
                    <UpdateAddressModal
                        onSubmit={(address, sendToCarrier) =>
                            handleSubmitCarrierAddress(
                                address ? address.pk : null,
                                {has_price: !isEmptyPricing(agreedPrice)},
                                !!sendToCarrier
                            )
                        }
                        initialAddress={
                            isCarrierDraftAssigned
                                ? transport.carrier_address_draft_assigned
                                : transport.carrier_address
                        }
                        addressCategory={"carrier"}
                        onClose={closeUpdateCarrierAddressModal}
                        isClearable={true}
                        disableSubmit={
                            connectedCompany?.pk !== transport.created_by.pk &&
                            connectedCompany?.settings?.default_role === "shipper"
                        }
                    />
                )}
                {updateShipperAddressModalOpened && (
                    <UpdateAddressModal
                        onSubmit={(address: OriginalAddress) =>
                            dispatch(fetchSetTransportShipperAddress(transport.uid, address.pk))
                        }
                        initialAddress={transport.shipper.administrative_address}
                        addressCategory={"shipper"}
                        isModifyingFinalInfo={transport.status === "done"}
                        isRental={isTransportRental(transport)}
                        onClose={closeUpdateShipperAddressModal}
                        isClearable={false}
                    />
                )}
            </HasNotFeatureFlag>
        </>
    );

    async function handleSubmitCarrierAddress(
        addressPk: number | null,
        analytics: {},
        sendToCarrier: boolean
    ) {
        if (sendToCarrier || addressPk === null) {
            await dispatch(fetchSetTransportCarrierAddress(transport.uid, addressPk, analytics));
            refetchTransports?.();
            return;
        }

        await dispatch(fetchSetTransportDraftCarrierAddress(transport.uid, addressPk, analytics));
        refetchTransports?.();
    }

    async function handleUpdateTransportCarrier(carrierPk: number | null, sendToCarrier: boolean) {
        const analyticsData = {has_price: !isEmptyPricing(agreedPrice)};
        if (sendToCarrier || carrierPk === null) {
            await dispatch(fetchSetTransportCarrier(transport.uid, carrierPk, analyticsData));
            refetchTransports?.();
            return;
        }
        await dispatch(fetchSetTransportDraftCarrier(transport.uid, carrierPk, analyticsData));
        refetchTransports?.();
    }

    async function handleUpdateTransportShipper(shipperPk: number) {
        await dispatch(fetchSetTransportShipper(transport.uid, shipperPk));
        refetchTransports?.();
    }
}
