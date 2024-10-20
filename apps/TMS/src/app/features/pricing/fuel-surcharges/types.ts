import {InvoiceItem} from "dashdoc-utils";

// Must be kept in sync with the backend _FuelSurchargeAgreementTransportMatchOutputSerializer
export interface FuelSurchargeAgreementTransportMatch {
    fuel_surcharge_agreement: {
        uid: string;
        name: string;
        created_by: {
            pk: number;
            name: string;
            group_view_id: number | undefined;
        };
        invoice_item: InvoiceItem;
        fuel_price_index: {
            name: string;
        };
    };
    fuel_surcharge_item: {
        start_date: string;
        computed_rate: number;
    };
}
