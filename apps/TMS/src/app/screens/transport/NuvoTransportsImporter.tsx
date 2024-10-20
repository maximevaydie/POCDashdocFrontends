import {getConnectedCompany, useTimezone} from "@dashdoc/web-common";
import {
    Address,
    PredefinedLoadCategory,
    type CountryCode,
    type TransportAddress,
    type Company,
    type Vehicle,
    type Trailer,
} from "dashdoc-utils";
import {OnEntryInit, ResultValues, type CurrencyValue, type FieldValue} from "nuvo-react";
import React from "react";

import {NuvoDataImporterModal} from "app/common/nuvo-importer/NuvoDataImporterModal";
import {TransportToCreateDeprecated} from "app/features/transport/transport-form/transport-form.types";
import {fetchAddTransport} from "app/redux/actions/transports";
import {useDispatch, useSelector} from "app/redux/hooks";

import {
    createEmptyReport,
    formatResultsDatetime,
    importAndFillReport,
    removeEmptyEntries,
    removeEmptyFieldInEntries,
    transportsModel,
} from "../../common/nuvo-importer/nuvoImporter.service";

import type {Load, Site} from "app/types/transport";

type NuvoTransportsImporter = {
    onClose: () => void;
    onImportDone: () => void;
    displayDateFormatPicker?: boolean;
    onEntryInit?: OnEntryInit;
    isNuvoImportModalOpen: boolean;
};

export const NuvoTransportsImporter = (props: NuvoTransportsImporter) => {
    const dispatch = useDispatch();
    const connectedCompany = useSelector(getConnectedCompany);
    const timezone = useTimezone();

    return (
        <>
            {props.isNuvoImportModalOpen && (
                <NuvoDataImporterModal
                    onImportDone={() => props.onImportDone()}
                    onClose={() => props.onClose()}
                    model={transportsModel}
                    importData={handleImportData}
                    displayDateFormatPicker
                />
            )}
        </>
    );
    async function handleImportData(entries: ResultValues) {
        const purgedEntries = removeEmptyFieldInEntries(removeEmptyEntries(entries));
        const newReport = createEmptyReport(["common.transport"]);
        const filteredEntry = formatResultsDatetime(transportsModel, purgedEntries, timezone);
        let lineNumber = 2;
        for (const entry of filteredEntry) {
            const payload: TransportToCreateDeprecated = getTransportPayload(
                entry,
                connectedCompany
            );
            await importAndFillReport(
                newReport,
                "common.transport",
                async () => {
                    const response = await dispatch(fetchAddTransport(payload));
                    if (response.error) {
                        throw response.error;
                    }
                },
                entry.transport_order_number
                    ? `${entry.transport_order_number} : ${entry.loading_site_name} (${entry.loading_site_city}) -> ${entry.unloading_site_name} (${entry.unloading_site_city})`
                    : `${entry.loading_site_name} (${entry.loading_site_city}) -> ${entry.unloading_site_name} (${entry.unloading_site_city})`,
                lineNumber
            );

            lineNumber++;
        }

        return newReport;
    }
};

function getStringValue(value: FieldValue | CurrencyValue) {
    if (!value) {
        return "";
    }
    return `${value}`;
}

function getCountryCode(value: FieldValue | CurrencyValue): CountryCode | null {
    const shipper_country = getStringValue(value);
    return shipper_country ? (shipper_country as CountryCode) : null;
}

function getShipperAddress(
    entry: Record<string, FieldValue | CurrencyValue>,
    defaultCountry: CountryCode
): Omit<Address, "pk"> {
    const shipperAddress: Omit<Address, "pk"> = {
        name: getStringValue(entry.shipper_name),
        address: getStringValue(entry.shipper_address),
        city: getStringValue(entry.shipper_city),
        postcode: getStringValue(entry.shipper_postcode),
        country: getCountryCode(entry.shipper_country) ?? defaultCountry,
        remote_id: getStringValue(entry.shipper_remote_id),
        latitude: null,
        longitude: null,
        radius: null,
        coords_validated: false,
        company: {
            name: getStringValue(entry.shipper_name),
            siren: "",
            country: getCountryCode(entry.shipper_country) ?? defaultCountry,
        },
        is_shipper: true,
        flow_site: null,
    };
    return shipperAddress;
}

function getOrigin(
    entry: Record<string, FieldValue | CurrencyValue>,
    defaultCountry: CountryCode
): Partial<Site> {
    const origin: Partial<Site> = {
        category: "loading",
        address: {
            name: getStringValue(entry.loading_site_name),
            address: getStringValue(entry.loading_site_address),
            city: getStringValue(entry.loading_site_city),
            postcode: getStringValue(entry.loading_site_postcode),
            country: getCountryCode(entry.loading_site_country_code) ?? defaultCountry,
            coords_validated: false,
            remote_id: getStringValue(entry.loading_site_remote_id),
            company: null,
        } as TransportAddress, // cast because it's POST request
        supports_exchanges: [],
        reference: "",
        eta: null,
        eta_tracking: false,
        trucker_instructions:
            entry.shipper_remote_id != undefined ? `${entry.trucker_instructions}` : undefined,
        slots: [
            {
                start: entry.unloading_datetime != null ? `${entry.unloading_datetime}` : "",
                end: entry.unloading_datetime != null ? `${entry.unloading_datetime}` : "",
            },
        ],
    };
    return origin;
}

function getDestination(
    entry: Record<string, FieldValue | CurrencyValue>,
    defaultCountry: CountryCode
): Partial<Site> {
    const destination: Partial<Site> = {
        category: "unloading",
        address: {
            name: getStringValue(entry.unloading_site_name),
            address: getStringValue(entry.unloading_site_address),
            city: getStringValue(entry.unloading_site_city),
            postcode: getStringValue(entry.unloading_site_postcode),
            country: getCountryCode(entry.unloading_site_country_code) ?? defaultCountry,
            coords_validated: false,
            remote_id: getStringValue(entry.unloading_site_remote_id),
            company: null,
        } as TransportAddress, // cast because it's POST request
        supports_exchanges: [],
        reference: "",
        eta: null,
        eta_tracking: false,
        trucker_instructions:
            entry.trucker_instructions != undefined ? `${entry.trucker_instructions}` : undefined,
        slots: [
            {
                start: entry.unloading_datetime != null ? `${entry.unloading_datetime}` : "",
                end: entry.unloading_datetime != null ? `${entry.unloading_datetime}` : "",
            },
        ],
    };
    return destination;
}

function getLoads(entry: Record<string, FieldValue | CurrencyValue>): Partial<Load>[] {
    const load: Partial<Load> = {
        height: null,
        width: null,
        length: null,
        weight: entry.weight != undefined ? (entry.weight as Load["weight"]) : undefined,
        volume: null,
        steres: null,
        linear_meters: null,
        description:
            entry.delivery_description != undefined ? `${entry.delivery_description}` : undefined,
        category:
            entry.delivery_category != undefined
                ? (`${entry.delivery_category}` as PredefinedLoadCategory)
                : undefined,
        quantity: entry.quantity != undefined ? parseInt(`${entry.quantity}`) : undefined,
        complementary_information:
            entry.complementary_informations_deliveries != undefined
                ? `${entry.complementary_informations_deliveries}`
                : undefined,
        container_seal_number: "",
        is_dangerous: false,
        adr_un_code: "",
        adr_un_description_by_language: {},
        legal_mentions: null,
        refrigerated: false,
        temperature: "",
        container_number: "",
        tare_weight: null,
        idtf_number: "",
    };
    return [load];
}

function getTransportPayload(
    entry: Record<string, FieldValue | CurrencyValue>,
    connectedCompany: Company | null
): TransportToCreateDeprecated {
    const defaultCountry: CountryCode = connectedCompany?.country ?? ("EN" as CountryCode);
    const shipperAddress = getShipperAddress(entry, defaultCountry);
    const origin = getOrigin(entry, defaultCountry);
    const destination = getDestination(entry, defaultCountry);
    const loads = getLoads(entry);
    const license_plate = getStringValue(entry.vehicle_license_plate);
    const trailer_license_plate = getStringValue(entry.trailer_license_plate);
    const payload: TransportToCreateDeprecated = {
        carrier_address: connectedCompany?.primary_address?.pk ?? null,
        carrier_reference: "",
        deliveries: [
            {
                shipper_address: shipperAddress,
                shipper_reference: "",
                planned_loads: [loads],
                origin: origin,
                destination: destination,
                tracking_contacts: [],
                multiple_rounds: false,
            },
        ],
        segments: [
            {
                trucker_id:
                    entry.trucker_code != undefined
                        ? {pk: parseInt(`${entry.trucker_code}`)}
                        : undefined,
                origin: origin,
                destination: destination,
                vehicle: license_plate
                    ? ({license_plate: license_plate} as Partial<Vehicle>)
                    : undefined,
                trailers: trailer_license_plate
                    ? ([{license_plate: trailer_license_plate}] as Partial<Trailer>[])
                    : [],
            },
        ],
        instructions: "",
        template_name: "",
        requested_vehicle:
            entry.vehicle_license_plate != undefined ? `${entry.vehicle_license_plate}` : "",
        business_privacy: false,
        volume_display_unit:
            entry.volume_display_unit != undefined
                ? entry.volume_display_unit === "L"
                    ? "L"
                    : "m3"
                : "m3",
        is_template: false,
        send_to_trucker: true,
        is_multiple_compartments: false,
        requires_washing: false,
        remote_id:
            entry.transport_order_number != undefined
                ? `${entry.transport_order_number}`
                : undefined,
    };
    return payload;
}
