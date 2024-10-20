import {tz} from "services/date";
import {PartialBookingStatus, Zone} from "types";

import {availabilities} from "../__mocks__/availabilities";
import {zoneService} from "../zone.service";

const timezone = "Europe/Paris";

const zone: Zone = {
    id: 27,
    name: "KNAUF-DC - Hall A",
    description: "",
    site: 14,
    slot_duration: 30,
    concurrent_slots: 1,
    opening_hours: {
        friday: [],
        monday: [],
        sunday: [],
        tuesday: [],
        saturday: [],
        thursday: [],
        wednesday: [],
    },
    delegable: true,
    booking_in_turns: false,
    max_visibility: 1,
    notice_period_mode: null,
    notice_period: 24,
    notice_period_days_before_booking: 0,
    notice_period_time_of_day: "00:00:00",
    custom_fields: [],
};

const bookingStatus: PartialBookingStatus = {
    availability_status: availabilities,
    unavailabilities: [],
};

/**
 * Reproduce the bug:
 * https://linear.app/dashdoc/issue/BUG-3062/wrong-display-of-the-activity-bar-on-dashdoc-flow
 *
 * Friday opening hours: [["08:00", "11:25"], ["13:30", "17:00"]]
 */
describe("Test getDayDensitySamples method", () => {
    test("should return 2 hits at 15 and 16 (22 september 2023)", async () => {
        const start = tz.convert("2023-09-22T06:00:00.000Z", timezone);
        const end = tz.convert("2023-09-22T14:30:00.000Z", timezone);
        const [at8, at9, at10, at11, at12, at13, at14, at15, at16, ...shouldBeEmpty] =
            zoneService.getDayDensitySamples(start, end, bookingStatus, zone);

        expect(at8).toBe(0);
        expect(at9).toBe(0);
        expect(at10).toBe(0);
        expect(at11).toBe(0);
        expect(at12).toBe("unavailable");
        expect(at13).toBe(0);
        expect(at14).toBe(0);
        expect(at15).toBe(1);
        expect(at16).toBe(2);
        expect(shouldBeEmpty.length).toBe(0);
    });

    test("should return 2 hits at 15 and 16 with offsets (22 september 2023)", async () => {
        const start = tz.convert("2023-09-22T05:00:00.000Z", timezone);
        const end = tz.convert("2023-09-22T15:30:00.000Z", timezone);
        const [at7, at8, at9, at10, at11, at12, at13, at14, at15, at16, at17, ...shouldBeEmpty] =
            zoneService.getDayDensitySamples(start, end, bookingStatus, zone);

        expect(at7).toBe("unavailable");
        expect(at8).toBe(0);
        expect(at9).toBe(0);
        expect(at10).toBe(0);
        expect(at11).toBe(0);
        expect(at12).toBe("unavailable");
        expect(at13).toBe(0);
        expect(at14).toBe(0);
        expect(at15).toBe(1);
        expect(at16).toBe(2);
        expect(at17).toBe("unavailable");
        expect(shouldBeEmpty.length).toBe(0);
    });

    /**
     * Reproduce the bug:
     * https://linear.app/dashdoc/issue/BUG-3062/wrong-display-of-the-activity-bar-on-dashdoc-flow
     *
     * Friday opening hours: [["08:00", "11:25"], ["13:30", "17:00"]]
     */
    test("should return 1 hit at 15 (22 september 2023)", async () => {
        const time = tz.convert("2023-09-22T13:00:00.000Z", timezone);
        const sample = zoneService.getDayDensitySample(time, bookingStatus, zone);
        expect(sample).toBe(1);
    });

    /**
     * Reproduce the bug:
     * https://linear.app/dashdoc/issue/BUG-3062/wrong-display-of-the-activity-bar-on-dashdoc-flow
     *
     * Friday opening hours: [["08:00", "11:25"], ["13:30", "17:00"]]
     */
    test("should return 1 hit at 16 (22 september 2023)", async () => {
        const time = tz.convert("2023-09-22T14:00:00.000Z", timezone);
        const sample = zoneService.getDayDensitySample(time, bookingStatus, zone);
        expect(sample).toBe(2);
    });
});
