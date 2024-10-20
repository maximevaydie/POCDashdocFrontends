import {createContext} from "react";

import {TransportOperationCategoryOption} from "app/features/carbon-footprint/transport-operation-category/TransportOperationCategorySelect";
import {isTransportRental} from "app/services/transport/transport.service";

import {TransportFormContextData, TransportFormValues} from "./transport-form.types";
import {getTransportShape} from "./TransportForm";

import type {Segment, Transport} from "app/types/transport";

export function getFormContextUpdates(
    formValues: TransportFormValues,
    formContext: TransportFormContextData,
    isComplexMode: boolean,
    groupSimilarActivities: boolean
): Partial<TransportFormContextData> {
    const loads = isComplexMode
        ? formValues.deliveries.flatMap((delivery) => delivery.loads)
        : formValues.loads;

    const updates: Partial<TransportFormContextData> = {};
    const isVehicleUsedForQualimat =
        formValues.means?.vehicle?.used_for_qualimat_transports || false;
    const isTrailerUsedForQualimat =
        formValues.means?.trailer?.used_for_qualimat_transports || false;
    const businessPrivacyEnabled = formValues.settings?.businessPrivacy;
    const volumeDisplayUnit = formValues.settings?.volumeDisplayUnit;
    const loadsCount = loads.length;
    const isMultipleRounds = loads[0]?.isMultipleRounds || false;
    const isRental = loads[0]?.category === "rental";
    const transportShape = getTransportShape(formValues.loadings, formValues.unloadings);
    const isMultipleCompartments = loads.some((load) => load.isMultipleCompartments);
    const requiresWashing = loads.some((load) => load.requiresWashing);
    if (isVehicleUsedForQualimat !== formContext.isVehicleUsedForQualimat) {
        updates.isVehicleUsedForQualimat = isVehicleUsedForQualimat;
    }
    if (isTrailerUsedForQualimat !== formContext.isTrailerUsedForQualimat) {
        updates.isTrailerUsedForQualimat = isTrailerUsedForQualimat;
    }
    if (businessPrivacyEnabled !== formContext.businessPrivacyEnabled) {
        updates.businessPrivacyEnabled = businessPrivacyEnabled;
    }
    if (volumeDisplayUnit !== formContext.volumeDisplayUnit) {
        updates.volumeDisplayUnit = volumeDisplayUnit;
    }
    if (loadsCount !== formContext.loadsCount) {
        updates.loadsCount = loadsCount;
    }
    if (transportShape !== formContext.transportShape) {
        updates.transportShape = transportShape;
    }
    if (isMultipleRounds !== formContext.isMultipleRounds) {
        updates.isMultipleRounds = isMultipleRounds;
    }
    if (isRental !== formContext.isRental) {
        updates.isRental = isRental;
    }
    if (isMultipleCompartments !== formContext.isMultipleCompartments) {
        updates.isMultipleCompartments = isMultipleCompartments;
    }
    if (requiresWashing !== formContext.requiresWashing) {
        updates.requiresWashing = requiresWashing;
    }
    if (formContext.isComplexMode !== isComplexMode) {
        updates.isComplexMode = isComplexMode;
    }

    if (formContext.groupSimilarActivities !== groupSimilarActivities) {
        updates.groupSimilarActivities = groupSimilarActivities;
    }

    return updates;
}

export function getContextFromTransport({
    transport,
    companyPk,
    isCreatingTemplate,
    isComplexMode,
    isDuplicating,
}: {
    transport: Transport;
    companyPk: number;
    isCreatingTemplate: boolean;
    isComplexMode: boolean;
    isDuplicating: boolean;
}): TransportFormContextData {
    return {
        isMultipleCompartments: transport.is_multiple_compartments,
        isVehicleUsedForQualimat: transport.segments.some(
            (segment) => segment?.vehicle?.used_for_qualimat_transports
        ),
        isTrailerUsedForQualimat: transport.segments.some((segment: Segment) => {
            const trailers = segment?.trailers;
            return trailers?.some((trailer) => trailer.used_for_qualimat_transports);
        }),
        businessPrivacyEnabled: transport.business_privacy,
        isOrder: !transport.carrier?.pk || transport.carrier?.pk !== companyPk,
        loadsCount: 0,
        volumeDisplayUnit: transport.volume_display_unit,
        isMultipleRounds: transport.deliveries[0].multiple_rounds,
        transportShape: transport.shape,
        requiresWashing: transport.requires_washing,
        isRental: isTransportRental(transport),
        isTemplate: isCreatingTemplate ?? false,
        loadsSmartSuggestionsMap: new Map(),
        isComplexMode,
        transportOperationCategory: transport.transport_operation_category?.uid
            ? (transport.transport_operation_category as TransportOperationCategoryOption)
            : undefined,
        isDuplicating,
    };
}

export const TransportFormContext = createContext<TransportFormContextData>({
    isMultipleCompartments: false,
    isVehicleUsedForQualimat: false,
    isTrailerUsedForQualimat: false,
    businessPrivacyEnabled: false,
    isOrder: false,
    loadsCount: 0,
    volumeDisplayUnit: "m3",
    isMultipleRounds: false,
    transportShape: "simple",
    requiresWashing: false,
    isRental: false,
    isTemplate: false,
    loadsSmartSuggestionsMap: new Map(),
    isComplexMode: false,
    groupSimilarActivities: false,
    setGroupSimilarActivities: () => {},
    isDuplicating: false,
});
