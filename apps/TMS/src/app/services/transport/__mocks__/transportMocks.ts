import {type InvoiceableCompany} from "dashdoc-utils";

import mockedTransport from "../../../../../../__mocks__/full-transport-web.json";

import type {Transport} from "app/types/transport";

const transportMock: Transport = {
    // @ts-ignore
    ...(mockedTransport as Transport),
};

export const aTransport: Transport = {
    ...transportMock,
    created_by: {...transportMock.created_by, pk: 1000},
    customer_to_invoice: {pk: 50} as InvoiceableCompany,
};
// @ts-ignore
export const aTransportCarrier = aTransport.carrier_address.company;
export const aTransportShipper = aTransport.deliveries[0].shipper_address.company;
export const aTransportCreator = aTransport.created_by;
export const aTransportCustomerToInvoice = aTransport.customer_to_invoice as InvoiceableCompany;
