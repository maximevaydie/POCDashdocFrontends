import {syncSetupI18n} from "@dashdoc/web-core";

import {getShortTitle} from "../textBasedIcon.service";

beforeAll(() => {
    syncSetupI18n();
});

describe("getShortTitle", () => {
    test("should work with a classic title with an uppercase for each word", () => {
        expect(getShortTitle("Atlantique Transport")).toBe("AT");
    });

    test("should work with a classic title with an uppercase for a single word", () => {
        expect(getShortTitle("Atlantique")).toBe("At");
    });

    test("should work with a classic title in lowercase", () => {
        expect(getShortTitle("gogo transport")).toBe("gt");
    });

    test("should work with a sequence of letter in uppercase", () => {
        expect(getShortTitle("JPB")).toBe("JP");
    });

    test("should work with a sequence of letter in lowercase", () => {
        expect(getShortTitle("abc")).toBe("ab");
    });

    test("should work with an empty string", () => {
        expect(getShortTitle("")).toBe("nd"); // nd is the short for not defined
    });

    test("should work with a single character lowercase", () => {
        expect(getShortTitle("x")).toBe("x");
    });

    test("should work with a single character uppercase", () => {
        expect(getShortTitle("X")).toBe("X");
    });
});
