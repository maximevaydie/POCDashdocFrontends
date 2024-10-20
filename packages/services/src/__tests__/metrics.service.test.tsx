import {
    MetricsArgs,
    aDayWithOneBooking,
    aDayWithOneBookingAndAllUnavailable,
    aDayWithOneBookingAndAllUnavailableV2,
} from "../__mocks__/metricsMocks";
import {Metrics, metricsService} from "../metrics.service";

describe("Test getMetrics method", () => {
    test("A day with one booking", async () => {
        testMetrics(aDayWithOneBooking, {
            availableSlots: 55,
            bookedSlots: 1,
            freeTime: 55 * 30,
            maxSlots: 56,
            overloadedSlots: 0,
            unavailableSlots: 0,
        });
    });

    test("A day with one booking and all unavailable - overload", async () => {
        testMetrics(aDayWithOneBookingAndAllUnavailable, {
            availableSlots: 0,
            bookedSlots: 1,
            freeTime: 0,
            maxSlots: 56,
            overloadedSlots: 1,
            unavailableSlots: 56,
        });
    });

    test("A day with one booking and all unavailable - overload (each slot time individually)", async () => {
        testMetrics(aDayWithOneBookingAndAllUnavailableV2, {
            availableSlots: 0,
            bookedSlots: 1,
            freeTime: 0,
            maxSlots: 56,
            overloadedSlots: 1,
            unavailableSlots: 56,
        });
    });
});

function testMetrics(args: MetricsArgs, expected: Metrics) {
    const {bookingStatus, zone, timezone} = args;
    const {availableSlots, bookedSlots, freeTime, maxSlots, overloadedSlots, unavailableSlots} =
        metricsService.getMetrics(zone, bookingStatus, timezone);

    expect(availableSlots).toBe(expected.availableSlots);
    expect(bookedSlots).toBe(expected.bookedSlots);
    expect(freeTime).toBe(expected.freeTime);
    expect(maxSlots).toBe(expected.maxSlots);
    expect(overloadedSlots).toBe(expected.overloadedSlots);
    expect(unavailableSlots).toBe(expected.unavailableSlots);
}
