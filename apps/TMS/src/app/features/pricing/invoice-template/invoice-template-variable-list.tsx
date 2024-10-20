import {isTranslationKey, t, TranslationKeys} from "@dashdoc/web-core";

import {GroupedVariableList} from "./InvoiceTemplateEditionModal";

export type GroupedVariableListToTranslate = {
    groupId: string;
    groupLabel: TranslationKeys;
    groupVariables: {
        id: string;
        label: TranslationKeys;
        mockValue?: string; // TODO: translate all mockValues to make sure all of them are translation keys
    }[];
}[];

/** Must be in sync with the enum of `description_template_integration.py` */
export enum DescriptionTemplateVariables {
    DASHDOC_TRANSPORT_NUMBER = "dashdoc-transport-number",
    SHIPPER_NAME = "shipper-name",
    SHIPPER_REF = "shipper-reference",
    CARRIER_REF = "carrier-reference",
    CMR_NUMBER = "cmr-number",
    ORIGIN_ADDRESS_NAME = "origin-address-name",
    ORIGIN_REF = "origin-reference",
    ORIGIN_ASKED_DATE = "origin-asked-date",
    ORIGIN_PLANNED_DATE = "origin-planned-date",
    ORIGIN_REAL_DATE = "origin-real-date",
    ORIGIN_CITY = "origin-city",
    ORIGIN_POSTCODE = "origin-postcode",
    ORIGIN_COUNTRY = "origin-country",
    DESTINATION_ADDRESS_NAME = "destination-address-name",
    DESTINATION_REF = "destination-reference",
    DESTINATION_ASKED_DATE = "destination-asked-date",
    DESTINATION_PLANNED_DATE = "destination-planned-date",
    DESTINATION_REAL_DATE = "destination-real-date",
    DESTINATION_CITY = "destination-city",
    DESTINATION_POSTCODE = "destination-postcode",
    DESTINATION_COUNTRY = "destination-country",
    LOADS = "loads",
    LOADS_QUANTITY = "loads-quantity",
    TRANSPORT_TAGS = "transport-tags",
    VEHICLE_TAGS = "vehicle-tags",
    TRAILERS_TAGS = "trailers-tags",
    VEHICLE_LICENSE_PLATE = "vehicle-license-plate",
    TRAILERS_LICENSE_PLATES = "trailers-license-plates",
    RENTAL_ORDER_ID = "rental-order-id",
    TRUCKER_NAMES = "trucker-names",
    REAL_TRANSPORT_DISTANCE = "real-transport-distance",
    ESTIMATED_TRANSPORT_DISTANCE = "estimated-transport-distance",
    CARBON_FOOTPRINT = "carbon-footprint",
    WEIGHT_OF_MULTIPLE_ROUND_TRANSPORT = "weight-of-multiple-round-transport",
    CONTAINER_NUMBERS = "container-numbers",
}

/** The label must be translated before use */
const VARIABLE_LIST: GroupedVariableListToTranslate = [
    {
        groupId: "general",
        groupLabel: "invoiceTemplate.variables.General",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.DASHDOC_TRANSPORT_NUMBER,
                label: "invoiceTemplate.variables.TransportNumber",
                mockValue: "12345",
            },
            {
                id: DescriptionTemplateVariables.TRANSPORT_TAGS,
                label: "invoiceTemplate.variables.TransportWordings",
                mockValue: "invoiceTemplate.variables.MockTransportWordings",
            },
            {
                id: DescriptionTemplateVariables.SHIPPER_NAME,
                label: "invoiceTemplate.variables.ShipperName",
                mockValue: "invoiceTemplate.variables.MockShipperName",
            },
            {
                id: DescriptionTemplateVariables.SHIPPER_REF,
                label: "invoiceTemplate.variables.ShipperReference",
                mockValue: "MO4598",
            },
            {
                id: DescriptionTemplateVariables.CARRIER_REF,
                label: "invoiceTemplate.variables.CarrierReference",
                mockValue: "CO7185",
            },
            {
                id: DescriptionTemplateVariables.ESTIMATED_TRANSPORT_DISTANCE,
                label: "invoiceTemplate.variables.EstimatedTransportDistance",
                mockValue: "62",
            },
            {
                id: DescriptionTemplateVariables.REAL_TRANSPORT_DISTANCE,
                label: "invoiceTemplate.variables.RealTransportDistance",
                mockValue: "328",
            },
            {
                id: DescriptionTemplateVariables.CARBON_FOOTPRINT,
                label: "invoiceTemplate.variables.carbonFootprint",
                mockValue: "12",
            },
        ],
    },
    {
        groupId: "document",
        groupLabel: "invoiceTemplate.variables.Documents",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.CMR_NUMBER,
                label: "invoiceTemplate.variables.CMRNumber",
                mockValue: "34059",
            },
            {
                id: DescriptionTemplateVariables.RENTAL_ORDER_ID,
                label: "invoiceTemplate.variables.RentalOrderId",
                mockValue: "54689",
            },
        ],
    },
    {
        groupId: "loading",
        groupLabel: "invoiceTemplate.variables.Loading",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.ORIGIN_ADDRESS_NAME,
                label: "invoiceTemplate.variables.LoadingPlaceName",
                mockValue: "invoiceTemplate.variables.MockLoadingPlaceName",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_REF,
                label: "invoiceTemplate.variables.LoadingReference",
                mockValue: "4958QP3",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_ASKED_DATE,
                label: "invoiceTemplate.variables.LoadingAskedDate",
                mockValue: "invoiceTemplate.variables.MockLoadingAskedDate",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_PLANNED_DATE,
                label: "invoiceTemplate.variables.LoadingPlannedDate",
                mockValue: "invoiceTemplate.variables.MockLoadingPlannedDate",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_REAL_DATE,
                label: "invoiceTemplate.variables.LoadingRealDate",
                mockValue: "invoiceTemplate.variables.MockLoadingRealDate",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_CITY,
                label: "invoiceTemplate.variables.LoadingCity",
                mockValue: "invoiceTemplate.variables.MockLoadingCity",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_POSTCODE,
                label: "invoiceTemplate.variables.LoadingPostcode",
                mockValue: "invoiceTemplate.variables.MockLoadingPostcode",
            },
            {
                id: DescriptionTemplateVariables.ORIGIN_COUNTRY,
                label: "invoiceTemplate.variables.LoadingCountry",
                mockValue: "invoiceTemplate.variables.MockLoadingCountry",
            },
        ],
    },
    {
        groupId: "unloading",
        groupLabel: "invoiceTemplate.variables.Unloading",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.DESTINATION_ADDRESS_NAME,
                label: "invoiceTemplate.variables.UnloadingPlaceName",
                mockValue: "invoiceTemplate.variables.MockUnloadingPlaceName",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_REF,
                label: "invoiceTemplate.variables.UnloadingReference",
                mockValue: "4958QP3",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_ASKED_DATE,
                label: "invoiceTemplate.variables.UnloadingAskedDate",
                mockValue: "invoiceTemplate.variables.MockUnloadingAskedDate",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_PLANNED_DATE,
                label: "invoiceTemplate.variables.UnloadingPlannedDate",
                mockValue: "invoiceTemplate.variables.MockUnloadingPlannedDate",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_REAL_DATE,
                label: "invoiceTemplate.variables.UnloadingRealDate",
                mockValue: "invoiceTemplate.variables.MockUnloadingRealDate",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_CITY,
                label: "invoiceTemplate.variables.UnloadingCity",
                mockValue: "invoiceTemplate.variables.MockUnloadingCity",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_POSTCODE,
                label: "invoiceTemplate.variables.UnloadingPostcode",
                mockValue: "invoiceTemplate.variables.MockUnloadingPostcode",
            },
            {
                id: DescriptionTemplateVariables.DESTINATION_COUNTRY,
                label: "invoiceTemplate.variables.UnloadingCountry",
                mockValue: "invoiceTemplate.variables.MockUnloadingCountry",
            },
        ],
    },
    {
        groupId: "loads",
        groupLabel: "invoiceTemplate.variables.Loads",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.LOADS,
                label: "invoiceTemplate.variables.TransportedLoads",
                mockValue: "invoiceTemplate.variables.MockTransportedLoads",
            },
            {
                id: DescriptionTemplateVariables.LOADS_QUANTITY,
                label: "invoiceTemplate.variables.TransportedQuantity",
                mockValue: "invoiceTemplate.variables.MockTransportedQuantity",
            },
            {
                id: DescriptionTemplateVariables.WEIGHT_OF_MULTIPLE_ROUND_TRANSPORT,
                label: "invoiceTemplate.variables.WeightOfMultipleRoundTransport",
                mockValue: "4521",
            },
            {
                id: DescriptionTemplateVariables.CONTAINER_NUMBERS,
                label: "invoiceTemplate.variables.ContainerNumbers",
                mockValue: "abc12, def34",
            },
        ],
    },
    {
        groupId: "means",
        groupLabel: "invoiceTemplate.variables.Means",
        groupVariables: [
            {
                id: DescriptionTemplateVariables.VEHICLE_TAGS,
                label: "invoiceTemplate.variables.TruckWordings",
                mockValue: "invoiceTemplate.variables.MockTruckWordings",
            },
            {
                id: DescriptionTemplateVariables.TRAILERS_TAGS,
                label: "invoiceTemplate.variables.TrailersTags",
                mockValue: "invoiceTemplate.variables.MockTrailersTags",
            },
            {
                id: DescriptionTemplateVariables.TRUCKER_NAMES,
                label: "invoiceTemplate.variables.TruckerName",
                mockValue: "Pierre Dupont",
            },
            {
                id: DescriptionTemplateVariables.VEHICLE_LICENSE_PLATE,
                label: "invoiceTemplate.variables.VehicleLicensePlate",
                mockValue: "invoiceTemplate.variables.MockVehicleLicensePlate",
            },
            {
                id: DescriptionTemplateVariables.TRAILERS_LICENSE_PLATES,
                label: "invoiceTemplate.variables.TrailersLicensePlates",
                mockValue: "invoiceTemplate.variables.MockTrailersLicensePlates",
            },
        ],
    },
];

export const getTranslatedVariableList = (): GroupedVariableList => {
    const translateOrLabel = (label: string) => {
        if (isTranslationKey(label)) {
            return t(label);
        }
        return label;
    };
    return VARIABLE_LIST.map((group) => ({
        groupId: group.groupId,
        groupLabel: t(group.groupLabel),
        groupVariables: group.groupVariables.map((variable) => ({
            id: variable.id,
            label: t(variable.label),
            // @ts-ignore
            mockValue: translateOrLabel(variable.mockValue),
        })),
    }));
};
