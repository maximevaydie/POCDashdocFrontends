import {
    aTransport,
    aTransportCarrier,
    aTransportCustomerToInvoice,
    aTransportShipper,
} from "../../transport/__mocks__/transportMocks";
import {invoicingRightService} from "../invoicingRight.service";

import type {Transport} from "app/types/transport";

const anOrder = {
    ...aTransport,
    created_by: {...aTransport.created_by, pk: aTransportShipper.pk},
};

describe("canEditAgreedPrice", () => {
    describe("as the transport shipper and creator", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: false};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a verified transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "verified",
                global_status: "done",
                invoicing_status: "VERIFIED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a invoiced transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "invoiced",
                global_status: "done",
                invoicing_status: "INVOICED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
    });

    describe("as the transport carrier and not creator with the `shipperFinalPrice` FF", () => {
        test("for a transport awaiting acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: true};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I cannot
                .toBe(false);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I cannot
                .toBe(false);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I cannot
                .toBe(false);
        });
        test("for a verified transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "verified",
                global_status: "done",
                invoicing_status: "VERIFIED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I cannot
                .toBe(false);
        });
        test("for a invoiced transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "invoiced",
                global_status: "done",
                invoicing_status: "INVOICED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I cannot
                .toBe(false);
        });
    });

    describe("as the transport carrier and not creator without the `shipperFinalPrice` FF", () => {
        test("for a transport awaiting acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: true};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, false))
                // THEN I cannot
                .toBe(false);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, false))
                // THEN I cannot
                .toBe(false);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, false))
                // THEN I can
                .toBe(true);
        });
        test("for a verified transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "verified",
                global_status: "done",
                invoicing_status: "VERIFIED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, false))
                // THEN I cannot
                .toBe(false);
        });
        test("for a invoiced transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "invoiced",
                global_status: "done",
                invoicing_status: "INVOICED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, false))
                // THEN I cannot
                .toBe(false);
        });
    });

    describe("as the transport customer to invoice", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: false};
            // AS the shipper of the transport
            const companyPk = aTransportCustomerToInvoice.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the shipper of the transport
            const companyPk = aTransportCustomerToInvoice.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the shipper of the transport
            const companyPk = aTransportCustomerToInvoice.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a verified transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "verified",
                global_status: "done",
                invoicing_status: "VERIFIED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCustomerToInvoice.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
        test("for a invoiced transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {
                ...anOrder,
                status: "invoiced",
                global_status: "done",
                invoicing_status: "INVOICED",
            };
            // AS the shipper of the transport
            const companyPk = aTransportCustomerToInvoice.pk;
            // WHEN I test if I can edit the quotation
            expect(invoicingRightService.canEditAgreedPrice(transport, companyPk, true))
                // THEN I can
                .toBe(true);
        });
    });
});

describe("canEditInvoicedPrice", () => {
    describe("with the carrierAndShipperPrice FF enabled", () => {
        const carrierAndShipperPriceFFEnabled = true;

        test("as the transport shipper and creator", () => {
            // GIVEN a transport
            const transport = anOrder;
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the pricing
            expect(
                invoicingRightService.canEditInvoicedPrice(
                    transport,
                    companyPk,
                    carrierAndShipperPriceFFEnabled,
                    [companyPk]
                )
            )
                // THEN I cannot
                .toBe(false);
        });

        describe("as the transport carrier and not creator", () => {
            test("for a transport awaiting carrier acceptation", () => {
                // GIVEN a transport awaiting acceptation
                const transport: Transport = {...anOrder, requires_acceptance: true};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFEnabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(false);
            });
            test("for a declined transport", () => {
                // GIVEN a declined transport
                const transport: Transport = {...anOrder, global_status: "declined"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFEnabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(false);
            });
            test("for a cancelled transport", () => {
                // GIVEN a cancelled transport
                const transport: Transport = {...anOrder, global_status: "cancelled"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFEnabled,
                        [companyPk]
                    )
                )
                    // THEN I can
                    .toBe(true);
            });
            test("for a confirmed transport", () => {
                // GIVEN a confirmed transport
                const transport: Transport = {...anOrder, global_status: "accepted"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFEnabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(true);
            });
            test("for a started transport", () => {
                // GIVEN a confirmed transport
                const transport: Transport = anOrder;
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFEnabled,
                        [companyPk]
                    )
                )
                    // THEN I can
                    .toBe(true);
            });
        });
    });
    describe("with the carrierAndShipperPrice FF disabled", () => {
        const carrierAndShipperPriceFFDisabled = false;

        test("as the transport shipper and creator", () => {
            // GIVEN a transport
            const transport = anOrder;
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I can edit the pricing
            expect(
                invoicingRightService.canEditInvoicedPrice(
                    transport,
                    companyPk,
                    carrierAndShipperPriceFFDisabled,
                    [companyPk]
                )
            )
                // THEN I cannot
                .toBe(false);
        });

        describe("as the transport carrier and not creator", () => {
            test("for a transport awaiting carrier acceptation", () => {
                // GIVEN a transport awaiting acceptation
                const transport: Transport = {...anOrder, requires_acceptance: true};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFDisabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(false);
            });
            test("for a declined transport", () => {
                // GIVEN a declined transport
                const transport: Transport = {...anOrder, global_status: "declined"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFDisabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(false);
            });
            test("for a cancelled transport", () => {
                // GIVEN a cancelled transport
                const transport: Transport = {...anOrder, global_status: "cancelled"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFDisabled,
                        [companyPk]
                    )
                )
                    // THEN I can
                    .toBe(true);
            });
            test("for a confirmed transport", () => {
                // GIVEN a confirmed transport
                const transport: Transport = {...anOrder, global_status: "accepted"};
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFDisabled,
                        [companyPk]
                    )
                )
                    // THEN I cannot
                    .toBe(false);
            });
            test("for a started transport", () => {
                // GIVEN a confirmed transport
                const transport: Transport = anOrder;
                // AS the carrier of the transport
                const companyPk = aTransportCarrier.pk;
                // WHEN I test if I can edit the pricing
                expect(
                    invoicingRightService.canEditInvoicedPrice(
                        transport,
                        companyPk,
                        carrierAndShipperPriceFFDisabled,
                        [companyPk]
                    )
                )
                    // THEN I can
                    .toBe(true);
            });
        });
    });
});
