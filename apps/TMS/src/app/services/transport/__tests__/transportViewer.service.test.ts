import {
    aTransport,
    aTransportCarrier,
    aTransportShipper,
    aTransportCreator,
    aTransportCustomerToInvoice,
} from "../__mocks__/transportMocks";
import {transportViewerService} from "../transportViewer.service";

describe("isCarrierOf", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I test if I'm a carrier
        expect(transportViewerService.isCarrierOf(transport, companyPk))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I test if I'm a carrier
        expect(transportViewerService.isCarrierOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I test if I'm a carrier
        expect(transportViewerService.isCarrierOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I test if I'm a carrier
        expect(transportViewerService.isCarrierOf(transport, companyPk))
            // THEN It should be false
            .toBe(false);
    });
});

describe("isShipperOf", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I test if I'm a shipper
        expect(transportViewerService.isShipperOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I test if I'm a shipper
        expect(transportViewerService.isShipperOf(transport, companyPk))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I test if I'm a shipper
        expect(transportViewerService.isShipperOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I test if I'm a shipper
        expect(transportViewerService.isShipperOf(transport, companyPk))
            // THEN It should be false
            .toBe(false);
    });
});

describe("isCreatorOf", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I test if I'm the creator
        expect(transportViewerService.isCreatorOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I test if I'm the creator
        expect(transportViewerService.isCreatorOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I test if I'm the creator
        expect(transportViewerService.isCreatorOf(transport, companyPk))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I test if I'm the creator
        expect(transportViewerService.isCreatorOf(transport, companyPk))
            // THEN It should be false
            .toBe(false);
    });
});

describe("isPrivateViewerOf", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I test if I'm a private viewer
        expect(transportViewerService.isPrivateViewerOf(transport, companyPk))
            // THEN it should be true
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I test if I'm a private viewer
        expect(transportViewerService.isPrivateViewerOf(transport, companyPk))
            // THEN it should be true
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I test if I'm a private viewer
        expect(transportViewerService.isPrivateViewerOf(transport, companyPk))
            // THEN it should be true
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I test if I'm a private viewer
        expect(transportViewerService.isPrivateViewerOf(transport, companyPk))
            // THEN It should be false
            .toBe(false);
    });
});

describe("isCustomerToInvoiceOf", () => {
    test("with the transport customer to invoice", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a customer to invoice of the transport
        const companyPk = aTransportCustomerToInvoice.pk;
        // WHEN I test if I'm a customer to invoice
        expect(transportViewerService.isCustomerToInvoiceOf(transport, companyPk))
            // THEN it works
            .toBe(true);
    });

    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I test if I'm a customer to invoice
        expect(transportViewerService.isCustomerToInvoiceOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });

    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I test if I'm a customer to invoice
        expect(transportViewerService.isCustomerToInvoiceOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I test if I'm a customer to invoice
        expect(transportViewerService.isCustomerToInvoiceOf(transport, companyPk))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I test if I'm a customer to invoice
        expect(transportViewerService.isCustomerToInvoiceOf(transport, companyPk))
            // THEN It should be false
            .toBe(false);
    });
});

describe("isCarrierGroupOf", () => {
    test("with the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the carrier in my group
        const companyPks = [aTransportCarrier.pk];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
    test("with the creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the creator in my group
        const companyPks = [aTransportCreator.pk];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the shipper in my group
        const companyPks = [aTransportShipper.pk];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a shipper and a creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportCreator.pk, aTransportShipper.pk];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a shipper, a creator and the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportCreator.pk, aTransportShipper.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the carrier group
        expect(transportViewerService.isCarrierGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
});

describe("isShipperGroupOf", () => {
    test("with the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the carrier in my group
        const companyPks = [aTransportCarrier.pk];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the creator in my group
        const companyPks = [aTransportCreator.pk];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the shipper in my group
        const companyPks = [aTransportShipper.pk];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
    test("with a public company in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a carrier and a creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportCreator.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a shipper, a creator and the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportCreator.pk, aTransportShipper.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isShipperGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
});

describe("isCreatorGroupOf", () => {
    test("with the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the carrier in my group
        const companyPks = [aTransportCarrier.pk];
        // WHEN I test if I take part of the creator group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the creator in my group
        const companyPks = [aTransportCreator.pk];
        // WHEN I test if I take part of the creator group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
    test("with the shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the shipper in my group
        const companyPks = [aTransportShipper.pk];
        // WHEN I test if I take part of the creator group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0];
        // WHEN I test if I take part of the shipper group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a carrier and a shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportShipper.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the creator group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a shipper, a creator and the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportCreator.pk, aTransportShipper.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the creator group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
});

describe("isCustomerToInvoiceGroupOf", () => {
    test("with the customer to invoice in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the customer to invoice in my group
        const companyPks = [aTransportCustomerToInvoice.pk];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });

    test("with the carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the carrier in my group
        const companyPks = [aTransportCarrier.pk];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the creator in my group
        const companyPks = [aTransportCreator.pk];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it works
            .toBe(false);
    });
    test("with the shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company with the shipper in my group
        const companyPks = [aTransportShipper.pk];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a carrier and a shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0, aTransportShipper.pk, aTransportCarrier.pk];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCreatorGroupOf(transport, companyPks))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company, a shipper, a creator, the carrier and customer to invoice in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [
            0,
            aTransportCreator.pk,
            aTransportShipper.pk,
            aTransportCarrier.pk,
            aTransportCustomerToInvoice.pk,
        ];
        // WHEN I test if I take part of the customer to invoice group
        expect(transportViewerService.isCustomerToInvoiceGroupOf(transport, companyPks))
            // THEN it works
            .toBe(true);
    });
});

describe("isPrivateViewerGroupOf", () => {
    test("with the transport carrier in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier company in my group
        const companyPks = [aTransportCarrier.pk];
        // WHEN I test if I take part of the private viewer group
        expect(transportViewerService.isPrivateViewerGroupOf(transport, companyPks))
            // THEN it should be true
            .toBe(true);
    });
    test("with the transport shipper in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper company in my group
        const companyPks = [aTransportShipper.pk];
        // WHEN I test if I take part of the private viewer group
        expect(transportViewerService.isPrivateViewerGroupOf(transport, companyPks))
            // THEN it should be true
            .toBe(true);
    });
    test("with the transport creator in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator company in my group
        const companyPks = [aTransportCreator.pk];
        // WHEN I test if I take part of the private viewer group
        expect(transportViewerService.isPrivateViewerGroupOf(transport, companyPks))
            // THEN it should be true
            .toBe(true);
    });
    test("with a public company in my group", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public company in my group
        const companyPks = [0];
        // WHEN I test if I take part of the private viewer group
        expect(transportViewerService.isPrivateViewerGroupOf(transport, companyPks))
            // THEN It should be false
            .toBe(false);
    });
});
