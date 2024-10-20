import {aTransport, aTransportCarrier, aTransportShipper} from "../__mocks__/transportMocks";
import {transportStateService} from "../transportState.service";

import type {SubcontractingChildTransport, Transport} from "app/types/transport";

const anOrder = {
    ...aTransport,
    created_by: {...aTransport.created_by, pk: aTransportShipper.pk},
};

describe("hasDeclinedOrder", () => {
    describe("as the transport shipper and creator", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: false};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have not
                .toBe(false);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have not
                .toBe(false);
        });
        test("for a confirmed transport", () => {
            // GIVEN a transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have not
                .toBe(false);
        });
    });

    describe("as the transport carrier and not creator", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: true};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have not
                .toBe(false);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have
                .toBe(true);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I declined the order
            expect(transportStateService.hasDeclinedOrder(transport, companyPk))
                // THEN I have not
                .toBe(false);
        });
    });
});

describe("hasPendingOrDeclinedOrder", () => {
    describe("as the transport shipper and creator", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting carrier acceptation
            const transport: Transport = {...anOrder, requires_acceptance: false};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do not
                .toBe(false);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do not
                .toBe(false);
        });
        test("for a confirmed transport", () => {
            // GIVEN a transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the shipper of the transport
            const companyPk = aTransportShipper.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do not
                .toBe(false);
        });
    });

    describe("as the transport carrier and not creator", () => {
        test("for a transport awaiting carrier acceptation", () => {
            // GIVEN a transport awaiting acceptation
            const transport: Transport = {...anOrder, requires_acceptance: true};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do
                .toBe(true);
        });
        test("for a declined transport", () => {
            // GIVEN a declined transport
            const transport: Transport = {...anOrder, global_status: "declined"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do
                .toBe(true);
        });
        test("for a confirmed transport", () => {
            // GIVEN a confirmed transport
            const transport: Transport = {...anOrder, global_status: "accepted"};
            // AS the carrier of the transport
            const companyPk = aTransportCarrier.pk;
            // WHEN I test if I need still need to accept the order or if it was declined
            expect(transportStateService.hasPendingOrDeclinedOrder(transport, companyPk))
                // THEN I do not
                .toBe(false);
        });
    });
});

const aChildTransport: SubcontractingChildTransport = {
    uid: "uid",
    sequential_id: 0,
    carrier_name: "carrier_name",
    draft_carrier_name: "draft_carrier_name",
    prices: null,
    instructions: null,
    status: "assigned",
    carrier_assignation_status: null,
    managed_through: null,
};

describe("hasAtLeastOneChildTransport", () => {
    test("for a transport without children", () => {
        // GIVEN a transport with child
        const transport: Transport = {
            ...aTransport,
        };
        // WHEN I test if it has at least one child transport
        expect(transportStateService.hasAtLeastOneChildTransport(transport))
            // THEN it's false
            .toBe(false);
    });

    test("for a transport with child", () => {
        // GIVEN a transport with child
        const transport: Transport = {
            ...aTransport,
            segments: [{...aTransport.segments[0], child_transport: aChildTransport}],
        };
        // WHEN I test if it has at least one child transport
        expect(transportStateService.hasAtLeastOneChildTransport(transport))
            // THEN it's true
            .toBe(true);
    });

    test("for a transport with children (one canceled)", () => {
        // GIVEN a transport with children (one canceled)
        const transport: Transport = {
            ...aTransport,
            segments: [
                {...aTransport.segments[0], child_transport: aChildTransport},
                {
                    ...aTransport.segments[0],
                    child_transport: {
                        ...aChildTransport,
                        status: "cancelled",
                    },
                },
            ],
        };
        // WHEN I test if it has at least one child transport
        expect(transportStateService.hasAtLeastOneChildTransport(transport))
            // THEN it's true
            .toBe(true);
    });

    test("for a transport with canceled child", () => {
        // GIVEN a transport with a canceled child
        const transport: Transport = {
            ...aTransport,
            segments: [
                {
                    ...aTransport.segments[0],
                    child_transport: {...aChildTransport, status: "cancelled"},
                },
            ],
        };
        // WHEN I test if it has at least one child transport
        expect(transportStateService.hasAtLeastOneChildTransport(transport))
            // THEN it's false
            .toBe(false);
    });
});
