import {guid} from "@dashdoc/core";
import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    Modal,
    ModalFooter,
    ModalProps,
    ModeDescription,
    ModeTypeSelector,
    Text,
} from "@dashdoc/web-ui";
import {Company, Pricing, SimpleContact} from "dashdoc-utils";
import React, {ReactNode, useEffect, useState} from "react";

import {getDatesForFuelSurchargeAgreementMatch} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {AssignationHistory} from "app/features/transportation-plan/assignation-history/AssignationHistory";
import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {OffersSelector} from "app/features/transportation-plan/carrier-offer/components/OffersSelector";
import {AssignCarrierOrSubcontractForm} from "app/features/transportation-plan/plan-or-subcontract/AssignCarrierOrSubcontractForm";
import {QuotationRequest} from "app/features/transportation-plan/rfq/quotation-request/QuotationRequest";
import {CarrierOffer, SubcontractSubmit} from "app/features/transportation-plan/types";
import {fetchSetTransportRequestedVehicle} from "app/redux/actions/transports";
import {useDispatch} from "app/redux/hooks";
import {getPricingPost} from "app/services/invoicing/pricing.service";
import {isTransportRental} from "app/services/transport/transport.service";
import {transportViewerService} from "app/services/transport/transportViewer.service";

import type {Transport} from "app/types/transport";

const FORM_ID = "manual-charter-form";

type Props = {
    isSubmitting: boolean;
    onClose: ModalProps["onClose"];
    onAssign: (values: SubcontractSubmit) => Promise<void>;
};

type WithTransportProps = Props & {
    transport: Transport;
    company: Company | null;
    carrierOffersCount: number;
};

export type ModeType = "manual" | "offers" | "rfq";

export function AssignModal({
    isSubmitting,
    onAssign,
    onClose,
    transport,
    company,
    carrierOffersCount,
}: WithTransportProps) {
    const dispatch = useDispatch();
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();
    const [selectedHistoryTransport, setSelectedHistoryTransport] = useState<
        TransportAssignationHistory | undefined
    >();
    const [subcontractFormKey, setSubcontractFormKey] = useState("_");
    const [transportAgreedPrice, setTransportAgreedPrice] = useState<Pricing | null>(null);
    const isModifyingFinalInfo = transport.status == "done";

    const datesForFuelSurchargeAgreementMatch = transport
        ? getDatesForFuelSurchargeAgreementMatch(transport, false)
        : undefined;

    useEffect(() => {
        fetchTransportAgreedPrice();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const canDisplayTransportOffers =
        transportViewerService.isShipperOf(transport, company?.pk) ||
        transportViewerService.isCreatorOf(transport, company?.pk);

    const canDisplayQuotationRequest =
        transportViewerService.isShipperOf(transport, company?.pk) ||
        transportViewerService.isCreatorOf(transport, company?.pk);

    const initMode = canDisplayTransportOffers && carrierOffersCount > 0 ? "offers" : "manual";

    const [modeType, setModeType] = useState<ModeType>(initMode);
    let content: ReactNode;

    const modeList: ModeDescription<ModeType>[] = [
        {
            value: "manual",
            label: t("common.manual.singular"),
            icon: "select",
            display: canDisplayTransportOffers,
        },
        {
            value: "offers",
            label: t("common.services"),
            icon: "star",
            display: canDisplayTransportOffers,
        },
        {
            value: "rfq",
            label: t("component.requestForQuotations"),
            icon: "requestForQuotations",
            display: canDisplayQuotationRequest,
        },
    ];

    content = (
        <Flex>
            <Box width="66%">
                {isModifyingFinalInfo && (
                    <AmendTransportWarningBanner isRental={isTransportRental(transport)} />
                )}

                <Box pb={5}>
                    <Text mb={3} variant="h1" color="grey.dark">
                        {t("common.assignment")}
                    </Text>
                    <ModeTypeSelector<ModeType>
                        modeList={modeList}
                        currentMode={modeType}
                        setCurrentMode={setModeType}
                    />
                </Box>

                {modeType === "manual" && (
                    <>
                        <Box p={4} flexGrow={1}>
                            <AssignCarrierOrSubcontractForm
                                key={subcontractFormKey}
                                formId={FORM_ID}
                                disabled={isSubmitting}
                                initialSendToCarrierValue={sendToCarrier}
                                initialPrice={transportAgreedPrice}
                                datesForFuelSurchargeAgreementMatch={
                                    datesForFuelSurchargeAgreementMatch
                                }
                                selectedHistoryTransport={selectedHistoryTransport}
                                onSubmit={onAssign}
                                onChangeSendToCarrier={persistSendToCarrier}
                                isBulk={false}
                                transportRequestedVehicle={transport.requested_vehicle}
                                transportUid={transport.uid}
                                contextType="assignation"
                            />
                        </Box>
                        <ModalFooter
                            onClose={onClose}
                            mainButton={{
                                children: t("chartering.actions.assign"),
                                type: "submit",
                                loading: isSubmitting,
                                disabled: isSubmitting,
                                form: FORM_ID,
                                ["data-testid"]: "charter-modal-save-button",
                            }}
                        />
                    </>
                )}
                {modeType === "offers" && transport && (
                    <Box p={4} flexGrow={1}>
                        <OffersSelector
                            transport={transport}
                            agreedPrice={transportAgreedPrice}
                            onSelectOffer={onSelectOffer}
                            onSelectVehicleType={handleSelectVehicleType}
                        />
                    </Box>
                )}
                {modeType === "rfq" && transport && (
                    <Box p={4} flexGrow={1}>
                        <QuotationRequest transport={transport} />
                    </Box>
                )}
            </Box>
            <Box
                mr={5}
                ml={4}
                borderLeftWidth={1}
                borderLeftStyle="solid"
                borderLeftColor="grey.light"
            />
            <Box width="34%" pt={1}>
                <AssignationHistory
                    transport={transport}
                    onSelect={(selectedHistoryTransport) => {
                        setSelectedHistoryTransport(selectedHistoryTransport);
                        setSubcontractFormKey(guid());
                    }}
                />
            </Box>
        </Flex>
    );

    return (
        <Modal
            title={t("chartering.actions.assign")}
            onClose={onClose}
            mainButton={null}
            id="charter-modal"
            size="xlarge"
            data-testid="charter-modal"
            animation={
                false /* avoid modal animation  (otherwise there is a fade in fade out between charter and ownFleet */
            }
        >
            {content}
        </Modal>
    );

    async function onSelectOffer(
        offer: CarrierOffer,
        contacts: SimpleContact[],
        sendToCarrier: boolean
    ) {
        const {carrierPk: pk, pricing} = offer;
        const values: SubcontractSubmit = {
            carrier: {pk},
            carrier_contacts: contacts.map((contact) => contact.uid),
            send_to_carrier: sendToCarrier,
            analytics: {
                assigned_from_transportation_plan: true,
                has_price: true,
            },
            instructions: "",
            quotation: getPricingPost(pricing),
        };
        await onAssign(values);
    }

    async function handleSelectVehicleType(vehicleType: string) {
        if (transport) {
            await dispatch(fetchSetTransportRequestedVehicle(transport.uid, vehicleType));
        }
    }

    async function fetchTransportAgreedPrice() {
        try {
            const quotation = await apiService.get(`/transports/${transport?.uid}/quotation/`, {
                apiVersion: "v4",
            });
            setTransportAgreedPrice(quotation);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${transport?.uid} quotation.`);
        }
    }
}
