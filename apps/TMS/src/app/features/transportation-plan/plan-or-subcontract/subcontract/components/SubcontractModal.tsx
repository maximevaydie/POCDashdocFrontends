import {guid} from "@dashdoc/core";
import {apiService, fetchUsages, getSubcontractUsage} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    Box,
    Flex,
    LoadingWheel,
    Modal,
    ModalFooter,
    ModalProps,
    ModeDescription,
    ModeTypeSelector,
    Text,
} from "@dashdoc/web-ui";
import {Pricing, SimpleContact} from "dashdoc-utils";
import React, {ReactNode, useEffect, useState} from "react";

import {getDatesForFuelSurchargeAgreementMatch} from "app/features/pricing/fuel-surcharges/services/fuelSurcharge.service";
import {AmendTransportWarningBanner} from "app/features/transport/amend-transport-warning-banner";
import {useSendToCarrier} from "app/features/transport/hooks/useSendToCarrier";
import {AssignationHistory} from "app/features/transportation-plan/assignation-history/AssignationHistory";
import {TransportAssignationHistory} from "app/features/transportation-plan/assignation-history/types";
import {OffersSelector} from "app/features/transportation-plan/carrier-offer/components/OffersSelector";
import {RequestForwarded} from "app/features/transportation-plan/plan-or-subcontract/subcontract/components/RequestForwarded";
import {CarrierOffer, SubcontractSubmit} from "app/features/transportation-plan/types";
import {fetchSetTransportRequestedVehicle} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";
import {getPricingPost} from "app/services/invoicing/pricing.service";
import {isTransportRental} from "app/services/transport/transport.service";

import {AssignCarrierOrSubcontractForm} from "../../AssignCarrierOrSubcontractForm";

import {LimitReached} from "./LimitReached";
import {usageService} from "./usage.service";
import {UsageCallout} from "./UsageCallout";

import type {Transport} from "app/types/transport";

const FORM_ID = "manual-charter-form";

type Props = {
    isSubmitting: boolean;
    transport?: Transport;
    parentTransportPricing?: Pricing | null;
    isSubcontractingTrip: boolean;
    isSubcontractingTheWholeTransport?: boolean;
    onClose: ModalProps["onClose"];
    onSubcontract: (values: SubcontractSubmit) => Promise<void>;
};

type ModeType = "manual" | "offers";

export function SubcontractModal({
    isSubmitting,
    transport,
    parentTransportPricing,
    isSubcontractingTrip,
    isSubcontractingTheWholeTransport,
    onSubcontract,
    onClose,
}: Props) {
    const dispatch = useDispatch();
    const usage = useSelector(getSubcontractUsage);
    const usagesLoading = useSelector((state: RootState) => state.loading.usages);
    const alreadyRequested = useSelector(({account}: RootState) => account.requestPlanUpgrade);
    const {sendToCarrier, persistSendToCarrier} = useSendToCarrier();
    const [selectedHistoryTransport, setSelectedHistoryTransport] =
        useState<TransportAssignationHistory>();
    const [subcontractFormKey, setSubcontractFormKey] = useState("_");
    const [transportQuotation, setTransportQuotation] = useState<Pricing | null>(null);
    const isModifyingFinalInfo =
        !isSubcontractingTrip && transport ? transport.status == "done" : false;

    const modeList: ModeDescription<ModeType>[] = [
        {
            value: "manual",
            label: t("common.manual.singular"),
            icon: "select",
        },
        {
            value: "offers",
            label: t("common.services"),
            icon: "star",
        },
    ];

    const datesForFuelSurchargeAgreementMatch =
        !isSubcontractingTrip && transport
            ? getDatesForFuelSurchargeAgreementMatch(transport, true)
            : undefined;

    useEffect(() => {
        if (!isSubcontractingTrip && transport) {
            fetchTransportQuotation();
            dispatch(fetchUsages());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [modeType, setModeType] = useState<ModeType>("manual");
    const limitReached = usageService.limitReached(usage);
    let content: ReactNode;
    if (usagesLoading) {
        content = <LoadingWheel />;
    } else if (alreadyRequested) {
        content = <RequestForwarded />;
    } else if (limitReached) {
        content = <LimitReached />;
    } else {
        content = (
            <Flex>
                <Flex flex={2} flexDirection="column">
                    {isModifyingFinalInfo && (
                        <AmendTransportWarningBanner
                            isRental={transport ? isTransportRental(transport) : false}
                        />
                    )}

                    {!isSubcontractingTrip && (
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
                    )}

                    {modeType === "manual" && (
                        <>
                            <Box p={4} flexGrow={1}>
                                <AssignCarrierOrSubcontractForm
                                    key={subcontractFormKey}
                                    formId={FORM_ID}
                                    disabled={isSubmitting}
                                    initialSendToCarrierValue={sendToCarrier}
                                    initialPrice={
                                        isSubcontractingTrip ? null : parentTransportPricing!
                                    }
                                    transportRequestedVehicle={transport?.requested_vehicle}
                                    datesForFuelSurchargeAgreementMatch={
                                        datesForFuelSurchargeAgreementMatch
                                    }
                                    isSubcontractingTheWholeTransport={
                                        isSubcontractingTheWholeTransport
                                    }
                                    selectedHistoryTransport={selectedHistoryTransport}
                                    transportUid={transport?.uid}
                                    onSubmit={onSubcontract}
                                    onChangeSendToCarrier={persistSendToCarrier}
                                    isBulk={false}
                                    contextType="subcontracting"
                                />
                            </Box>
                            <ModalFooter
                                onClose={onClose}
                                mainButton={{
                                    children: sendToCarrier
                                        ? t("chartering.actions.charter")
                                        : t("chartering.actions.planChartering"),
                                    type: "submit",
                                    loading: isSubmitting,
                                    disabled: isSubmitting,
                                    form: FORM_ID,
                                    ["data-testid"]: "charter-modal-save-button",
                                }}
                            />
                        </>
                    )}
                    {modeType === "offers" && transport && transportQuotation && (
                        <Box p={4} flexGrow={1}>
                            <OffersSelector
                                transport={transport}
                                agreedPrice={transportQuotation}
                                onSelectOffer={onSelectOffer}
                                onSelectVehicleType={handleSelectVehicleType}
                            />
                        </Box>
                    )}
                </Flex>

                {!isSubcontractingTrip && transport && (
                    <>
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
                    </>
                )}
            </Flex>
        );
    }

    return (
        <Modal
            title={t("chartering.actions.charter")}
            onClose={onClose}
            mainButton={null}
            id="charter-modal"
            size={limitReached || isSubcontractingTrip ? "large" : "xlarge"}
            data-testid="charter-modal"
            animation={
                false /* avoid modal animation  (otherwise there is a fade in fade out between charter and ownFleet */
            }
        >
            {!alreadyRequested && <UsageCallout usage={usage} />}
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
        await onSubcontract(values);
    }

    async function handleSelectVehicleType(vehicleType: string) {
        if (transport) {
            await dispatch(fetchSetTransportRequestedVehicle(transport.uid, vehicleType));
        }
    }

    async function fetchTransportQuotation() {
        try {
            const quotation = await apiService.get(`/transports/${transport?.uid}/quotation/`, {
                apiVersion: "v4",
            });
            setTransportQuotation(quotation);
        } catch (error) {
            Logger.log(`Error when trying to retrieve transport ${transport?.uid} quotation.`);
        }
    }
}
