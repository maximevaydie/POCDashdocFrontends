/* eslint-disable @typescript-eslint/no-var-requires */
import memoize from "lodash.memoize";

import {getTransportSortedSegments} from "app/services/transport/transport.service";

import {aTransport} from "../__mocks__/transportMocks";
import {activityService} from "../activity.service";

import type {Transport} from "app/types/transport";

describe("getDateRangeToMarkDone", () => {
    test("segment without date", () => {
        // GIVEN a segment without planned and asked date
        const segment = {
            ...aTransport.segments[0],
            origin: {...aTransport.segments[0].origin, slots: []},
        };
        // WHEN I get the date range to mark done
        const dateRange = activityService.getDateRangeToMarkDone(segment, "loading");
        // THEN it should be equal to today
        const today = new Date();
        today.setSeconds(0);
        today.setMilliseconds(0);
        expect(dateRange).toMatchObject({
            start: new Date(today),
            end: new Date(today),
        });
    });

    test("segment with asked date", () => {
        // GIVEN a segment  asked date
        const segment = {...aTransport.segments[0]};
        // WHEN I get the date range to mark done
        const dateRange = activityService.getDateRangeToMarkDone(segment, "loading");
        // THEN it should be equal to asked date
        expect(dateRange).toMatchObject({
            start: "2020-05-22T00:00:00.000Z",
            end: "2020-05-22T00:00:00.000Z",
        });
    });

    test("segment with planned date", () => {
        // GIVEN a segment planned date
        const segment = {
            ...aTransport.segments[0],
            scheduled_start_range: {
                start: "2020-05-22T00:00:00.000Z",
                end: "2020-05-22T00:00:00.000Z",
            },
        };
        // WHEN I get the date range to mark done
        const dateRange = activityService.getDateRangeToMarkDone(segment, "loading");
        // THEN it should be equal to planned date
        expect(dateRange).toMatchObject({
            start: "2020-05-22T00:00:00.000Z",
            end: "2020-05-22T00:00:00.000Z",
        });
    });

    test("segment with planned date and asked date", () => {
        // GIVEN a segment planned date and asked date
        const segment = {
            ...aTransport.segments[0],
            origin: {
                ...aTransport.segments[0].origin,
                slots: [
                    {
                        start: "2020-05-23T00:00:00.000Z",
                        end: "2020-05-24T00:00:00.000Z",
                    },
                ],
            },
            scheduled_start_range: {
                start: "2020-05-22T00:00:00.000Z",
                end: "2020-05-22T00:00:00.000Z",
            },
        };
        // WHEN I get the date range to mark done
        const dateRange = activityService.getDateRangeToMarkDone(segment, "loading");
        // THEN it should be equal to planned date
        expect(dateRange).toMatchObject({
            start: "2020-05-22T00:00:00.000Z",
            end: "2020-05-22T00:00:00.000Z",
        });
    });
});

describe("getTransportActivities as trucker", () => {
    beforeEach(() => {
        (activityService.getTransportActivities as any).cache = new memoize.Cache();
    });

    it("should handle simple transport", () => {
        const simpleTransport: Transport = require("./fixtures/simple-transport.json");
        const activities = activityService.getTransportActivities(simpleTransport, {
            forTrucker: true,
        });
        // Expected activities :
        // 0. Loading - can be done
        // 1. Unloading - cannot be done because loading has not been done

        expect(activities.length).toBe(2);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle 2 loadings 1 unloading", () => {
        const transportWithTwoLoadingsOneUnloading: Transport = require("./fixtures/multiple-loading.json");
        const activities = activityService.getTransportActivities(
            transportWithTwoLoadingsOneUnloading,
            {
                forTrucker: true,
            }
        );
        // Expected activities :
        // 0. Loading - can be done
        // 1. Loading #2 - can be done (because same activity in a row)
        // 2. Unloading - cannot be done because loading has not been done

        expect(activities.length).toBe(3);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("loading");
        expect(activities[2].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(true);
        expect(activities[2].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle 1 loading 2 unloadings", () => {
        const transportWithOneLoadingTwoUnloadings: Transport = require("./fixtures/multiple-unloading.json");
        const activities = activityService.getTransportActivities(
            transportWithOneLoadingTwoUnloadings,
            {
                forTrucker: true,
            }
        );
        // Deliveries A > B & A > B'
        // Expected activities :
        // 0. Loading A - both deliveries, can be done
        // 1. Unloading B - delivery A>B, cannot be done because A hasn't been done
        // 2. Unloading B' - delivery A>B', cannot be done because A hasn't been done

        expect(activities.length).toBe(3);
        expect(activities[0].type).toBe("loading");
        expect(activities[0].deliveries.length).toBe(2);
        expect(activities[1].type).toBe("unloading");
        expect(activities[1].deliveries.length).toBe(1);
        expect(activities[2].type).toBe("unloading");
        expect(activities[2].deliveries.length).toBe(1);

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle two consecutive deliveries", () => {
        const transportWithTwoConsecutiveDeliveries: Transport = require("./fixtures/multiple-consequent-deliveries.json");
        const activities = activityService.getTransportActivities(
            transportWithTwoConsecutiveDeliveries,
            {
                forTrucker: true,
            }
        );
        // Deliveries A > B & B > C (Not supposed to be handled by the product)
        // Expected activities :
        // 0. Loading A - can be done
        // 1. Unloading B - cannot be done because A has not been done
        // 2. Loading B - cannot be done because previous activities for the same trucker have not been done
        // 2. Unloading C - cannot be done because previous activities for the same trucker have not been done

        expect(activities.length).toBe(4);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");
        expect(activities[2].type).toBe("loading");
        expect(activities[3].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(false);
        expect(activities[3].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle complex transports", () => {
        const transportComplex: Transport = require("./fixtures/complex-transport.json");
        const activities = activityService.getTransportActivities(transportComplex, {
            forTrucker: true,
        });
        // Deliveries A > B & C > D
        // Expected activities :
        // 0. Loading A - can be done
        // 1. Unloading B - cannot be done because A has not been done
        // 2. Loading C - can done because it is the loading from a different delivery than previous activities
        // 2. Unloading D - cannot be done because previous activities for the same trucker have not been done

        expect(activities.length).toBe(4);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");
        expect(activities[2].type).toBe("loading");
        expect(activities[3].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(true);
        expect(activities[3].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle simple transport with driver change", () => {
        const simpleTransportWithDriverChange: Transport = require("./fixtures/simple-transport-trucker-change.json");
        const activities = activityService.getTransportActivities(
            simpleTransportWithDriverChange,
            {
                forTrucker: true,
            }
        );
        // Expected activities :
        // 0. Loading - can be done
        // 1. Bulking break start - cannot be done because loading has not been done
        // 2. Bulking break end - can be done because we allow truckers to continue a transport after a bulk break
        // 3. Unloading - cannot be done because bulking break end has not been done

        expect(activities.length).toBe(4);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("bulkingBreakStart");
        expect(activities[2].type).toBe("bulkingBreakEnd");
        expect(activities[3].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(true);
        expect(activities[3].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle activityTypesToOmit option", () => {
        const simpleTransportWithDriverChange: Transport = require("./fixtures/simple-transport-trucker-change.json");
        const activities = activityService.getTransportActivities(
            simpleTransportWithDriverChange,
            {
                activityTypesToOmit: ["bulkingBreakEnd"],
                forTrucker: true,
            }
        );
        // Expected activities :
        // 0. Loading - can be done
        // 1. Bulking break start - cannot be done because loading has not been done
        // Omitted by getTransportActivities' activityTypesToOmit option. Bulking break end
        // 2. Unloading - can be done because we allow truckers to continue a transport after a bulk break

        expect(activities.length).toBe(3);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("bulkingBreakStart");
        expect(activities[2].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(true);

        expect(activities).toMatchSnapshot();
    });

    it("should handle simple transport without segment", () => {
        const simpleTransportWithoutSegment: Transport = require("./fixtures/simple-transport-without-segment.json");
        const activities = activityService.getTransportActivities(simpleTransportWithoutSegment, {
            forTrucker: true,
        });
        // Note by @aouaki: I don't know what's the use case for this test
        // Expected activities :
        // 0. Loading - can be done
        // 1. Unloading - cannot be done because loading has not been done

        expect(activities.length).toBe(2);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle declare on the way transport", () => {
        const simpleTransport: Transport = require("./fixtures/simple-transport.json");
        const transport = {...simpleTransport};
        transport.segments[0].origin.action = "declare_on_the_way_and_handling_started";
        transport.segments[0].destination.action = "declare_on_the_way_and_handling_started";
        transport.deliveries[0].origin.action = "declare_on_the_way_and_handling_started";
        transport.deliveries[0].destination.action = "declare_on_the_way_and_handling_started";
        const activities = activityService.getTransportActivities(transport, {forTrucker: true});
        // Expected activities :
        // 0. Loading "declare_on_the_way_and_handling_started" - can be done
        // 1. Unloading "declare_on_the_way_and_handling_started" - cannot be done because loading has not been done

        expect(activities.length).toBe(2);
        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(true);
        expect(activities[1].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should handle transport with one loading two unloading for one trucker, all done, and another unloading for another trucker", () => {
        const transportWithOneLoadingTwoUnloadingsAndATruckerChange: Transport = require("./fixtures/multiple-delivery-trucker-change-status.json");
        const activities = activityService.getTransportActivities(
            transportWithOneLoadingTwoUnloadingsAndATruckerChange,
            {forTrucker: true}
        );
        // Expected activities :
        // 0. Loading "done" - cannot be done, because already done
        // 1. Unloading "done" - cannot be done, because already done
        // 2. Unloading "done" - cannot be done, because already done
        // 3. Bulking break start - can be done, because previous activities done and this one is not done yet
        // 4. Bulking break end - can be done, because we allow truckers to continue a transport after a bulk break
        // 5. Unloading - cannot be done, because bulking break end not done yet

        expect(activities.length).toBe(6);

        expect(activities[0].type).toBe("loading");
        expect(activities[1].type).toBe("unloading");
        expect(activities[2].type).toBe("unloading");
        expect(activities[3].type).toBe("bulkingBreakStart");
        expect(activities[4].type).toBe("bulkingBreakEnd");
        expect(activities[5].type).toBe("unloading");

        expect(activities[0].canBeDone).toBe(false);
        expect(activities[1].canBeDone).toBe(false);
        expect(activities[2].canBeDone).toBe(false);
        expect(activities[3].canBeDone).toBe(true);
        expect(activities[4].canBeDone).toBe(true);
        expect(activities[5].canBeDone).toBe(false);

        const breakStart = activities[3];
        const breakEnd = activities[4];

        expect(breakStart.type).toBe("bulkingBreakStart");

        expect(breakEnd.type).toBe("bulkingBreakEnd");

        expect(breakStart.site).toBe(breakEnd.site);
        expect(breakStart.segment).not.toBe(breakEnd.segment);
        expect(breakEnd.segment).toBe(activities[5].segment);

        expect(activities).toMatchSnapshot();
    });

    it("should handle transport with two consecutive trucker changes, with loading and first bulking break complete but not started", () => {
        const transport: Transport = require("./fixtures/simple-transport-double-trucker-change.json");
        const activities = activityService.getTransportActivities(transport, {forTrucker: true});
        // Expected activities :
        // 0. Loading "done" - cannot be done, because already done
        // 1. Bulking break start - can be done, because not done yet and transport is not done
        // 2. Bulking break end "done" - cannot be done, because already done
        // 3. Bulking break start - can be done, because previous activities for the same trucker have not been done
        // 4. Bulking break end - cannot be done, because we allow truckers to continue a transport after a bulk break
        // 5. Unloading - cannot be done, because bulking break end not done yet

        expect(activities.length).toBe(6);

        expect(activities[0].type).toBe("loading");
        expect(activities[0].site.uid).toBe(
            "MAUFFREY_7517281_7517281C_6ade3e42-eac6-481f-8485-da780d89ad4b"
        );

        expect(activities[1].type).toBe("bulkingBreakStart");
        expect(activities[1].site.uid).toBe("81dc952a-8615-11ea-b376-0242ac110007");
        expect(activities[1].segment?.trucker?.display_name).toBe("Kevin Chevrier");

        expect(activities[2].type).toBe("bulkingBreakEnd");
        expect(activities[2].site.uid).toBe("81dc952a-8615-11ea-b376-0242ac110007");
        expect(activities[2].status).toBe("done");
        expect(activities[2].segment?.trucker?.display_name).toBe("Franck Seguin");

        expect(activities[3].type).toBe("bulkingBreakStart");
        expect(activities[3].site.uid).toBe("6f13b4ac-85fa-11ea-bc96-0242ac110007");
        expect(activities[3].status).toBe("done");
        expect(activities[3].segment?.trucker?.display_name).toBe("Franck Seguin");

        expect(activities[4].type).toBe("bulkingBreakEnd");
        expect(activities[4].site.uid).toBe("6f13b4ac-85fa-11ea-bc96-0242ac110007");
        expect(activities[4].status).toBe("not_started");
        expect(activities[4].segment?.trucker?.display_name).toBe("Franck Seguin");

        expect(activities[5].type).toBe("unloading");
        expect(activities[5].site.uid).toBe(
            "MAUFFREY_7530007_7530007L_33f7e90c-e000-43c5-8c29-b6bc54637bbf"
        );

        expect(activities[0].canBeDone).toBe(false);
        expect(activities[1].canBeDone).toBe(true);
        expect(activities[2].canBeDone).toBe(false);
        expect(activities[3].canBeDone).toBe(false);
        expect(activities[4].canBeDone).toBe(true);
        expect(activities[5].canBeDone).toBe(false);

        expect(activities).toMatchSnapshot();
    });

    it("should mark activities with departed status can not be done", () => {
        const simpleTransport: Transport = require("./fixtures/simple-transport.json");
        simpleTransport.status_updates.push({
            uid: "bb4abf52-8728-11eb-91e9-0242ac140004",
            created: "2021-03-17T13:57:37.561794Z",
            created_device: null,
            creation_method: "telematic",
            category: "departed",
            author: null,
            author_email: null,
            content: "",
            content_signatory: "",
            target: null,
            site: "15511075521dFIpFbY",
            delivery: null,
            segment: null,
            transport: "d5186ccc-390f-11e9-a9f3-4c32759a9ce3",
            signature: null,
            latitude: null,
            longitude: null,
            update_details: null,
            author_company: null,
            credit_note: null,
            invoice: null,
        });
        // Expected activities :
        // 0. Loading - cannot be done because departed status is accounted as activity done
        // 1. Unloading - can be done

        const activities = activityService.getTransportActivities(simpleTransport, {
            forTrucker: true,
        });

        expect(activities.length).toBe(2);
        expect(activities[0].canBeDone).toBe(false);
        expect(activities[1].canBeDone).toBe(true);
    });
});

describe("getTransportActivitiesByMeans as trucker", () => {
    beforeEach(() => {
        (activityService.getTransportActivitiesByMeans as any).cache = new memoize.Cache();
    });

    it("should handle simple transports", () => {
        const simpleTransport: Transport = require("./fixtures/simple-transport.json");
        const activities = activityService.getTransportActivities(simpleTransport, {
            forTrucker: true,
        });
        const activitiesByMeans = activityService.getTransportActivitiesByMeans(simpleTransport, {
            forTrucker: true,
        });
        expect(activitiesByMeans.size).toBe(1);
        expect(Array.from(activitiesByMeans.entries())).toEqual([
            [
                {
                    trucker: simpleTransport.segments[0].trucker,
                    vehicle: simpleTransport.segments[0].vehicle,
                    trailers: simpleTransport.segments[0].trailers,
                    child_transport: simpleTransport.segments[0].child_transport,
                    breakSite: null,
                },
                activities,
            ],
        ]);
        expect(activitiesByMeans).toMatchSnapshot();
    });

    it("should handle grouping tranports", () => {
        const groupingTransport: Transport = require("./fixtures/multiple-loading.json");
        const activities = activityService.getTransportActivities(groupingTransport, {
            forTrucker: true,
        });
        const activitiesByMeans = activityService.getTransportActivitiesByMeans(
            groupingTransport,
            {
                forTrucker: true,
            }
        );
        expect(activitiesByMeans.size).toBe(1);
        expect(Array.from(activitiesByMeans.entries())).toEqual([
            [
                {
                    trucker: groupingTransport.segments[0].trucker,
                    vehicle: groupingTransport.segments[0].vehicle,
                    trailers: groupingTransport.segments[0].trailers,
                    child_transport: groupingTransport.segments[0].child_transport,
                    breakSite: null,
                },
                activities,
            ],
        ]);
        expect(activitiesByMeans).toMatchSnapshot();
    });

    it("should handle ungrouping transports", () => {
        const ungroupingTransport: Transport = require("./fixtures/multiple-unloading.json");
        const activities = activityService.getTransportActivities(ungroupingTransport, {
            forTrucker: true,
        });
        const activitiesByMeans = activityService.getTransportActivitiesByMeans(
            ungroupingTransport,
            {
                forTrucker: true,
            }
        );
        expect(activitiesByMeans.size).toBe(1);
        expect(Array.from(activitiesByMeans.entries())).toEqual([
            [
                {
                    trucker: ungroupingTransport.segments[0].trucker,
                    vehicle: ungroupingTransport.segments[0].vehicle,
                    trailers: ungroupingTransport.segments[0].trailers,
                    child_transport: ungroupingTransport.segments[0].child_transport,
                    breakSite: null,
                },
                activities,
            ],
        ]);
        expect(activitiesByMeans).toMatchSnapshot();
    });

    it("should handle trucker changes", () => {
        const transportWithATruckerChange: Transport = require("./fixtures/simple-transport-trucker-change.json");
        const activities = activityService.getTransportActivities(transportWithATruckerChange, {
            forTrucker: true,
        });
        const activitiesByMeans = activityService.getTransportActivitiesByMeans(
            transportWithATruckerChange,
            {
                forTrucker: true,
            }
        );
        const segments = getTransportSortedSegments(transportWithATruckerChange);
        expect(activitiesByMeans.size).toBe(2);
        expect(Array.from(activitiesByMeans.entries())).toEqual([
            [
                {
                    trucker: segments[0].trucker,
                    vehicle: segments[0].vehicle,
                    trailers: segments[0].trailers,
                    child_transport: segments[0].child_transport,
                    breakSite: null,
                },
                [activities[0], activities[1]],
            ],
            [
                {
                    trucker: segments[1].trucker,
                    vehicle: segments[1].vehicle,
                    trailers: segments[1].trailers,
                    child_transport: segments[1].child_transport,
                    breakSite: segments[0].destination,
                },
                [activities[2], activities[3]],
            ],
        ]);
        expect(activitiesByMeans).toMatchSnapshot();
    });
});
