import {aTransport} from "../__mocks__/transportMocks";
import {getTransportChildrenUIDs} from "../transport.service";

import type {SubcontractingChildTransport, Transport} from "app/types/transport";

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

describe("Test getTransportChildrenUIDs", () => {
    test("for a transport without child", async () => {
        // GIVEN a transport without child
        const transport: Transport = {
            ...aTransport,
        };
        // WHEN I get the children UIDs
        expect(getTransportChildrenUIDs(transport))
            // THEN I get an empty array
            .toStrictEqual([]);
    });
    test("for a transport with one child", async () => {
        // GIVEN a transport with one child
        const transport: Transport = {
            ...aTransport,
            segments: [{...aTransport.segments[0], child_transport: aChildTransport}],
        };
        // WHEN I get the children UIDs
        expect(getTransportChildrenUIDs(transport))
            // THEN I get the child uid
            .toStrictEqual([aChildTransport.uid]);
    });
    test("for a transport with 2 children", async () => {
        // GIVEN a transport with 2 children
        const transport: Transport = {
            ...aTransport,
            segments: [
                {...aTransport.segments[0], child_transport: aChildTransport},
                {...aTransport.segments[0], child_transport: {...aChildTransport, uid: "uid2"}},
            ],
        };
        // WHEN I get the children UIDs
        expect(getTransportChildrenUIDs(transport))
            // THEN I get the children uids
            .toStrictEqual(["uid", "uid2"]);
    });
});
