import {ManagerRole} from "dashdoc-utils";

import {
    aTransport,
    aTransportCarrier,
    aTransportCreator,
    aTransportShipper,
} from "../__mocks__/transportMocks";
import {amendActivityService} from "../amendActivity.service";

import type {Transport, Activity} from "app/types/transport";

describe("canAmendRealDate", () => {
    test("carrier with the done and unverified transport", () => {
        // GIVEN a done and unverified transport
        const transport = {
            ...aTransport,
            global_status: "done",
            invoicing_status: "UNVERIFIED",
        } as Transport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it works
            .toBe(true);
    });

    test("carrier with the ongoing transport ", () => {
        // GIVEN a ungoing transport
        const transport = {
            ...aTransport,
        } as Transport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });

    test("carrier with the done and verified transport", () => {
        // GIVEN a done and verified transport
        const transport = {
            ...aTransport,
            global_status: "done",
            invoicing_status: "VERIFIED",
        } as Transport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });

    test("carrier with the done and verified transport on bulking break activitiy", () => {
        // GIVEN a done and verified transport
        const transport = {
            ...aTransport,
            global_status: "done",
            invoicing_status: "VERIFIED",
        } as Transport;
        // AS a carrier of the transport
        const companyPk = aTransportCarrier.pk;
        const activity = {
            siteType: "bulkingBreak",
        } as Activity;
        // WHEN I edit the bulking break activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });

    test("shipper with the done and unverified transport", () => {
        // GIVEN a done and verified transport
        const transport = {
            ...aTransport,
            global_status: "done",
            invoicing_status: "VERIFIED",
        } as Transport;
        // AS a shipper of the transport
        const companyPk = aTransportShipper.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });
    test("creator with the done and unverified transport", () => {
        // GIVEN a simple transport
        const transport = {
            ...aTransport,
            global_status: "done",
            invoicing_status: "UNVERIFIED",
        } as Transport;
        // AS a creator of the transport
        const companyPk = aTransportCreator.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it works
            .toBe(true);
    });

    test("carrier with a deleted transport", () => {
        // GIVEN a simple deleted transport
        const transport = {...aTransport, deleted: "aDate"};
        const companyPk = aTransportCarrier.pk;
        const activity = {
            siteType: "origin",
        } as Activity;
        // WHEN I edit the activity
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });

    test("with a public company", () => {
        // GIVEN a simple transport
        const transport = aTransport;
        // AS a public viewer of the transport
        const companyPk = 0;
        // WHEN I edit the activity
        const activity = {
            siteType: "origin",
        } as Activity;
        expect(
            amendActivityService.canAmendRealDate(
                activity,
                transport,
                ManagerRole.Admin,
                companyPk
            )
        )
            // THEN it doesn't work
            .toBe(false);
    });
});
