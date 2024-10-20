import {PredefinedLoadCategory} from "dashdoc-utils";

import {loadService} from "app/services/transport/load.service";

function testIsValidWith(
    category: PredefinedLoadCategory,
    expected: {
        quantity: boolean;
        weight: boolean;
        volume: boolean;
        linearMeters: boolean;
        steres: boolean;
        others: boolean;
    }
) {
    //weight
    expect(loadService.isValid(category, "LOADED_WEIGHT_IN_KG")).toBe(expected.weight);
    expect(loadService.isValid(category, "LOADED_WEIGHT_IN_TONNE")).toBe(expected.weight);
    expect(loadService.isValid(category, "UNLOADED_WEIGHT_IN_KG")).toBe(expected.weight);
    expect(loadService.isValid(category, "UNLOADED_WEIGHT_IN_TONNE")).toBe(expected.weight);

    //volume
    expect(loadService.isValid(category, "LOADED_VOLUME_IN_LITRE")).toBe(expected.volume);
    expect(loadService.isValid(category, "LOADED_VOLUME_IN_M3")).toBe(expected.volume);
    expect(loadService.isValid(category, "UNLOADED_VOLUME_IN_LITRE")).toBe(expected.volume);
    expect(loadService.isValid(category, "UNLOADED_VOLUME_IN_M3")).toBe(expected.volume);

    //linear meters
    expect(loadService.isValid(category, "LOADED_LINEAR_METERS")).toBe(expected.linearMeters);
    expect(loadService.isValid(category, "UNLOADED_LINEAR_METERS")).toBe(expected.linearMeters);

    //quantity
    expect(loadService.isValid(category, "LOADED_QUANTITY")).toBe(expected.quantity);
    expect(loadService.isValid(category, "UNLOADED_QUANTITY")).toBe(expected.quantity);

    // steres
    expect(loadService.isValid(category, "LOADED_STERES")).toBe(expected.steres);
    expect(loadService.isValid(category, "UNLOADED_STERES")).toBe(expected.steres);

    //others
    expect(loadService.isValid(category, "FLAT")).toBe(expected.others);
    expect(loadService.isValid(category, "DISTANCE_IN_KM")).toBe(expected.others);
    expect(loadService.isValid(category, "DURATION_IN_MINUTE")).toBe(expected.others);
    expect(loadService.isValid(category, "DURATION_IN_HOUR")).toBe(expected.others);
    expect(loadService.isValid(category, "NB_DELIVERIES")).toBe(expected.others);
    expect(loadService.isValid(category, "NB_ROUNDS")).toBe(expected.others);
}

describe("loadService", () => {
    test("isValid coverage for pallets/packages", () => {
        const categories: PredefinedLoadCategory[] = ["pallets", "packages"];
        const expected = {
            quantity: true,
            weight: true,
            volume: true,
            linearMeters: true,
            steres: false,
            others: true,
        };
        for (const category of categories) {
            testIsValidWith(category, expected);
        }
    });

    test("isValid coverage for other", () => {
        const category = "other";
        const expected = {
            quantity: true,
            weight: true,
            volume: true,
            linearMeters: true,
            steres: true,
            others: true,
        };
        testIsValidWith(category, expected);
    });

    test("isValid coverage for containers", () => {
        const category = "containers";
        const expected = {
            quantity: true,
            weight: true,
            volume: true,
            linearMeters: false,
            steres: false,
            others: true,
        };
        testIsValidWith(category, expected);
    });

    test("isValid form bulk/bulk_qualimat/powder_tank", () => {
        const categories: PredefinedLoadCategory[] = ["bulk", "bulk_qualimat", "powder_tank"];
        const expected = {
            quantity: false,
            weight: true,
            volume: true,
            linearMeters: false,
            steres: false,
            others: true,
        };
        for (const category of categories) {
            testIsValidWith(category, expected);
        }
    });
    test("isValid coverage for roundwood", () => {
        const category = "roundwood";
        const expected = {
            quantity: false,
            weight: true,
            volume: true,
            linearMeters: true,
            steres: true,
            others: true,
        };
        testIsValidWith(category, expected);
    });
    test("isValid coverage for rental", () => {
        const category = "rental";
        const expected = {
            quantity: false,
            weight: false,
            volume: false,
            linearMeters: false,
            steres: false,
            others: true,
        };
        testIsValidWith(category, expected);
    });
});
