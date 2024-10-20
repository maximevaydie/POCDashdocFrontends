import {VAT_NUMBER_REGEX} from "../vatNumberValidation";

describe("VAT Number Validation", () => {
    it("should validate FR VAT number", () => {
        expect(VAT_NUMBER_REGEX.test("FR36813603222")).toBeTruthy();
    });

    it("should validate AT VAT number", () => {
        expect(VAT_NUMBER_REGEX.test("ATU12345678")).toBeTruthy();
    });

    it("should validate BE VAT number", () => {
        expect(VAT_NUMBER_REGEX.test("BE0123456789")).toBeTruthy();
    });

    it("should validate BE VAT number starting with 1", () => {
        // https://linear.app/dashdoc/issue/BUG-3336/change-vat-regex-for-belgium
        expect(VAT_NUMBER_REGEX.test("BE1002559138")).toBeTruthy();
    });

    it("should validate BG VAT number", () => {
        expect(VAT_NUMBER_REGEX.test("BG123456789")).toBeTruthy();
    });

    it("should validate HR VAT number", () => {
        // https://dashdoc.slack.com/archives/CBG87REKU/p1705584882295229?thread_ts=1705583078.865239&cid=CBG87REKU
        expect(VAT_NUMBER_REGEX.test("HR23755929404")).toBeTruthy();
    });

    it("should invalidate incorrect VAT number", () => {
        expect(VAT_NUMBER_REGEX.test("AT12345678")).toBeFalsy();
    });

    it("should invalidate empty string", () => {
        expect(VAT_NUMBER_REGEX.test("")).toBeFalsy();
    });
});
