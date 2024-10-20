import {tz} from "services/date";
import {unavailabilitiesService} from "services/unavailabilities.service";

const timezone = "Europe/Paris";
const startTime = tz.convert("2023-12-08T07:00:00Z", timezone);
const endTime = tz.convert("2023-12-08T07:30:00Z", timezone);

describe("Test isRelevant method", () => {
    test("Perfect match", async () => {
        testIsRelevant("2023-12-08T07:00:00Z", "2023-12-08T07:30:00Z", true);
    });

    test("Start_time before", async () => {
        testIsRelevant("2023-12-08T06:59:59Z", "2023-12-08T07:30:00Z", true);
    });
    test("End_time before", async () => {
        testIsRelevant("2023-12-08T07:00:00Z", "2023-12-08T07:30:01Z", true);
    });

    test("Start_time after", async () => {
        testIsRelevant("2023-12-08T07:00:01Z", "2023-12-08T07:30:00Z", false);
    });
    test("End_time before", async () => {
        testIsRelevant("2023-12-08T07:00:00Z", "2023-12-08T07:29:59Z", false);
    });
});

function testIsRelevant(start_time: string, end_time: string, expected: boolean) {
    const unavailability = {
        start_time,
        end_time,
        slot_count: null,
    };
    const result = unavailabilitiesService.isRelevant(startTime, endTime, unavailability);
    expect(result).toBe(expected);
}
