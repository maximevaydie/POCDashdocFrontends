import {
    aTransport,
    aTransportCarrier,
    aTransportCreator,
    aTransportCustomerToInvoice,
    aTransportShipper,
} from "../__mocks__/transportMocks";
import {transportRightService} from "../transportRight.service";

import type {Transport} from "app/types/transport";

describe("canEditTransport", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });

    test("with a deleted transport", () => {
        // GIVEN a simple deleted transport
        const transport = {...aTransport, deleted: "aDate"};
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });

    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
});

describe("canEditInvoicingAddress Deprecated with FF customerToInvoice activated", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public pk", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
});
describe("canReadCustomerToInvoice/canEditCustomerToInvoice", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it works
            .toBe(true);
    });
    test("with a company from the same group as the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company from the same group as the transport carrier
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, 0, [companyPk]))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, 0, [companyPk], true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it works
            .toBe(false);
    });
    test("with the transport customer to invoice", () => {
        const transport = aTransport;
        // AS a customer to invoice of the transport
        const companyPk = aTransportCustomerToInvoice.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it doesn't work
            .toBe(false);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public pk", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it doesn't work
            .toBe(false);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport: Transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], true))
            // THEN it doesn't work
            .toBe(false);
    });
});

describe("canEditShipperAddress", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        let transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator and a done transport", () => {
        // GIVEN a simple done transport
        const transport: Transport = {...aTransport, status: "done"};
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator and a verified transport", () => {
        // GIVEN a simple verified transport
        const transport: Transport = {...aTransport, status: "verified"};
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
});

describe("canEditShipperReference", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const expected = true;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it works
            .toBe(expected);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });

    const transportWithSettingsConstrainReferenceEdition = {
        ...aTransport,
        created_by: {...aTransport.created_by, settings_constrain_reference_edition: true},
    };

    test("with the transport carrier and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator and settings_constrain_reference_edition", () => {
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with a public company and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
});

describe("canEditCarrierReference", () => {
    test("with the transport carrier", () => {
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });

    const transportWithSettingsConstrainReferenceEdition = {
        ...aTransport,
        created_by: {...aTransport.created_by, settings_constrain_reference_edition: true},
    };

    test("with the transport carrier and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, true))
            // THEN it doesn't work
            .toBe(false);
    });
});

describe("canEditBreaks", () => {
    test("with groupview company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a groupView company
        const companyPk = 1;
        const groupViewCompanies = [1, 102];
        // WHEN I edit a break
        expect(transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, true))
            // THEN it does work
            .toBe(true);
    });

    test("with not groupview company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a groupView company
        const companyPk = 1;
        const groupViewCompanies = [1, 100];
        // WHEN I edit a break
        expect(transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, true))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = 1;
        const groupViewCompanies = [1, 102];
        // WHEN I edit a break
        expect(transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, true))
            // THEN it doesn't work
            .toBe(false);
    });
});

// SECTION: WITH FF invoice-entity disabled
describe("canEditTransport", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });

    test("with a deleted transport", () => {
        // GIVEN a simple deleted transport
        const transport = {...aTransport, deleted: "aDate"};
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit the transport
        expect(transportRightService.canEditTransport(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
});

describe("canEditInvoicingAddress Deprecated with FF customerToInvoice activated", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public pk", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit an invoicing address
        expect(transportRightService.canEditInvoicingAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
});
describe("canReadCustomerToInvoice/canEditCustomerToInvoice", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it works
            .toBe(true);
    });
    test("with a company from the same group as the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a company from the same group as the transport carrier
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, 0, [companyPk]))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, 0, [companyPk], false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it works
            .toBe(false);
    });
    test("with the transport customer to invoice", () => {
        const transport = aTransport;
        // AS a customer to invoice of the transport
        const companyPk = aTransportCustomerToInvoice.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it doesn't work
            .toBe(false);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public pk", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it doesn't works
            .toBe(false);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I read a customer to invoice
        expect(transportRightService.canReadCustomerToInvoice(transport, companyPk, []))
            // THEN it works
            .toBe(true);
        // WHEN I edit a customer to invoice
        expect(transportRightService.canEditCustomerToInvoice(transport, companyPk, [], false))
            // THEN it works
            .toBe(true);
    });
});

describe("canEditShipperAddress", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        let transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator and a done transport", () => {
        // GIVEN a simple done transport
        const transport: Transport = {...aTransport, status: "done"};
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator and a verified transport", () => {
        // GIVEN a simple verified transport
        const transport: Transport = {...aTransport, status: "verified"};
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper address
        expect(transportRightService.canEditShipperAddress(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
});

describe("canEditShipperReference", () => {
    test("with the transport carrier", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const expected = true;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it works
            .toBe(expected);
    });
    test("with the transport shipper", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });

    const transportWithSettingsConstrainReferenceEdition = {
        ...aTransport,
        created_by: {...aTransport.created_by, settings_constrain_reference_edition: true},
    };

    test("with the transport carrier and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport shipper and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator and settings_constrain_reference_edition", () => {
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with a public company and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a shipper reference
        expect(transportRightService.canEditShipperReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
});

describe("canEditCarrierReference", () => {
    test("with the transport carrier", () => {
        const transport = aTransport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper", () => {
        const transport = aTransport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport creator", () => {
        const transport = aTransport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with a public company", () => {
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });

    const transportWithSettingsConstrainReferenceEdition = {
        ...aTransport,
        created_by: {...aTransport.created_by, settings_constrain_reference_edition: true},
    };

    test("with the transport carrier and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
    test("with the transport shipper and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with the transport creator and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with a public company and settings_constrain_reference_edition", () => {
        // GIVEN a simple transport with settings_constrain_reference_edition
        const transport = transportWithSettingsConstrainReferenceEdition;
        // AS a public viewer of the transport
        const companyPk = undefined;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        const companyPk = aTransportCarrier.pk;
        // WHEN I edit a carrier reference
        expect(transportRightService.canEditCarrierReference(transport, companyPk, false))
            // THEN it works
            .toBe(true);
    });
});

describe("canEditBreaks", () => {
    test("with groupview company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a groupView company
        const companyPk = 1;
        const groupViewCompanies = [1, 102];
        // WHEN I edit a break
        expect(
            transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, false)
        )
            // THEN it does work
            .toBe(true);
    });

    test("with not groupview company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a groupView company
        const companyPk = 1;
        const groupViewCompanies = [1, 100];
        // WHEN I edit a break
        expect(
            transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, false)
        )
            // THEN it doesn't work
            .toBe(false);
    });
    test("with an invoiced transport", () => {
        // GIVEN an invoiced transport
        const transport = {
            ...aTransport,
            invoicing_status: "INVOICED" as Transport["invoicing_status"],
        };
        // AS a groupView company
        const companyPk = 1;
        const groupViewCompanies = [1, 102];
        // WHEN I edit a break
        expect(
            transportRightService.canEditBreaks(transport, companyPk, groupViewCompanies, false)
        )
            // THEN it works
            .toBe(true);
    });
});

// !SECTION
