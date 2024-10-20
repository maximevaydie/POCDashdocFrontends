import {Company, Pricing} from "dashdoc-utils";
import cloneDeep from "rfdc/default";

import {PricesModalProps} from "app/features/pricing/prices/PricesModal";

import mockedTransport from "../../../../../../../__mocks__/full-transport-web.json";

import type {Transport} from "app/types/transport";

const invoicedPrice: Pricing = {
    real_quantities: {
        distance_in_km: "232.092",
        duration_in_minute: "0",
        duration_in_hour: "0.00",
        loaded_weight_in_kg: "0",
        loaded_weight_in_tonne: "0.000",
        loaded_volume_in_litre: "0",
        loaded_volume_in_m3: "0.000",
        loaded_quantity: "0.00",
        loaded_linear_meters: "0.00",
        loaded_steres: "0.000",
        unloaded_weight_in_kg: "0",
        unloaded_weight_in_tonne: "0.000",
        unloaded_volume_in_litre: "0",
        unloaded_volume_in_m3: "0.000",
        unloaded_quantity: "0.00",
        unloaded_linear_meters: "0.00",
        unloaded_steres: "0.000",
        nb_deliveries: "1.00",
        nb_rounds: "0.00",
    },
    planned_quantities: {
        planned_loaded_weight_in_kg: "23000",
        planned_loaded_weight_in_tonne: "23.000",
        planned_loaded_volume_in_litre: "0",
        planned_loaded_volume_in_m3: "0.000",
        planned_loaded_quantity: "0.00",
        planned_loaded_linear_meters: "0.00",
        planned_loaded_steres: "0.000",
        planned_duration_in_minute: "1439",
        planned_duration_in_hour: "23.98",
    },
    lines: [
        {
            id: 5861812,
            invoice_item: {
                uid: "08180b4c-5dbd-4e1b-a1de-d7bc9175669b",
                description: "TRANSPORTS",
                remote_id: "",
                tax_code: {
                    remote_id: "",
                    tax_rate: "20.00",
                    description: "France 20% VAT rate",
                },
            },
            description: "Transport - TRANSPORTS",
            metric: "FLAT",
            // @ts-ignore
            expected_quantity: null,
            // @ts-ignore
            expected_price: null,
            // @ts-ignore
            real_quantity: null,
            // @ts-ignore
            real_price: null,
            overridden_quantity: "1.000",
            final_quantity: "1.000",
            final_price: "568.00",
            unit_price: "568.000",
            is_gas_indexed: true,
            dismissed_suggested_invoice_item: null,
            final_quantity_source: "OVERRIDDEN",
        },
    ],
    tariff_grid_line: null,
    overridden_gas_index: "0.00",
    final_gas_index: "0.00",
    gas_index_invoice_item: null,
    final_price_without_gas_indexed: "568.00",
    final_price_with_gas_indexed: "568.00",
    fuel_surcharge_agreement: null,
    fuel_surcharge_item: null,
    dismissed_automatic_fuel_surcharge_application: false,
};

const agreedPrice: Pricing = {
    real_quantities: {
        distance_in_km: "232.092",
        duration_in_minute: "0",
        duration_in_hour: "0.00",
        loaded_weight_in_kg: "0",
        loaded_weight_in_tonne: "0.000",
        loaded_volume_in_litre: "0",
        loaded_volume_in_m3: "0.000",
        loaded_quantity: "0.00",
        loaded_linear_meters: "0.00",
        loaded_steres: "0.000",
        unloaded_weight_in_kg: "0",
        unloaded_weight_in_tonne: "0.000",
        unloaded_volume_in_litre: "0",
        unloaded_volume_in_m3: "0.000",
        unloaded_quantity: "0.00",
        unloaded_linear_meters: "0.00",
        unloaded_steres: "0.000",
        nb_deliveries: "1.00",
        nb_rounds: "0.00",
    },
    planned_quantities: {
        planned_loaded_weight_in_kg: "23000",
        planned_loaded_weight_in_tonne: "23.000",
        planned_loaded_volume_in_litre: "0",
        planned_loaded_volume_in_m3: "0.000",
        planned_loaded_quantity: "0.00",
        planned_loaded_linear_meters: "0.00",
        planned_loaded_steres: "0.000",
        planned_duration_in_minute: "1439",
        planned_duration_in_hour: "23.98",
    },
    lines: [
        {
            id: 5874471,
            invoice_item: {
                uid: "52251a3d-c0ee-4be9-b119-9218b70e68eb",
                description: "TRANSPORTS AISNE RECYCLLAGE",
                remote_id: "",
                tax_code: {
                    remote_id: "",
                    tax_rate: "20.00",
                    description: "France 20% VAT rate",
                },
            },
            description: "Transport - TRANSPORTS AISNE RECYCLLAGE",
            metric: "FLAT",
            // @ts-ignore
            expected_quantity: null,
            // @ts-ignore
            expected_price: null,
            // @ts-ignore
            real_quantity: null,
            // @ts-ignore
            real_price: null,
            overridden_quantity: "1.000",
            final_quantity: "1.000",
            final_price: "500.00",
            unit_price: "500.000",
            is_gas_indexed: true,
            dismissed_suggested_invoice_item: null,
            final_quantity_source: "OVERRIDDEN",
        },
    ],
    tariff_grid_line: null,
    overridden_gas_index: "0.00",
    final_gas_index: "0.00",
    gas_index_invoice_item: null,
    final_price_without_gas_indexed: "500.00",
    final_price_with_gas_indexed: "500.00",
    fuel_surcharge_agreement: null,
    fuel_surcharge_item: null,
    dismissed_automatic_fuel_surcharge_application: false,
};

const shipperFinalPrice: Pricing = {...agreedPrice};

// @ts-ignore
const transport: Transport = {...(mockedTransport as Transport)};

const onSubmitAgreedPrice = () => alert(`onSubmitAgreedPrice`);
const onSubmitInvoicedPrice = () => alert(`onSubmitInvoicedPrice`);
const onSubmitShipperFinalPrice = () => alert(`onSubmitShipperFinalPrice`);
const onClose = () => alert(`onClose`);
const onCopyToFinalPrice = () => alert(`onCopyToFinalPrice`);
const onSubmitPurchaseCost = () => alert(`onSubmitPurchaseCost`);

const shipperCompany = {...transport.deliveries[0].shipper_address.company} as Company;
export const shipperProps: PricesModalProps = {
    transport,
    connectedCompany: shipperCompany,
    defaultTab: "pricing",
    agreedPrice,
    invoicedPrice,
    shipperFinalPrice,
    onSubmitAgreedPrice,
    onSubmitInvoicedPrice,
    onSubmitShipperFinalPrice,
    onSubmitPurchaseCost,
    onClose,
    onCopyToFinalPrice,
};

const carrierCompany = {...transport.carrier_address?.company} as Company;
export const carrierProps: PricesModalProps = {
    transport,
    connectedCompany: carrierCompany,
    defaultTab: "pricing",
    agreedPrice,
    invoicedPrice,
    shipperFinalPrice,
    onSubmitAgreedPrice,
    onSubmitInvoicedPrice,
    onSubmitShipperFinalPrice,
    onSubmitPurchaseCost,
    onClose,
    onCopyToFinalPrice,
};

const transportCarrierAndShipper: Transport = cloneDeep(transport);
for (const delivery of transportCarrierAndShipper.deliveries) {
    delivery.shipper_address.company = carrierCompany;
}

export const carrierAndShipperProps: PricesModalProps = {
    transport: transportCarrierAndShipper,
    connectedCompany: carrierCompany,
    defaultTab: "pricing",
    agreedPrice,
    invoicedPrice,
    shipperFinalPrice,
    onSubmitAgreedPrice,
    onSubmitInvoicedPrice,
    onSubmitShipperFinalPrice,
    onSubmitPurchaseCost,
    onClose,
    onCopyToFinalPrice,
};
