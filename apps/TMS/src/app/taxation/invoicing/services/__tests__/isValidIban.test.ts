import {isValidIban} from "app/taxation/invoicing/services/isValidIban";

describe("isValidIban", () => {
    it("should return true for valid IBAN", () => {
        expect(isValidIban("DE89370400440532013000")).toBe(true);
    });
    it("should return false for invalid IBAN", () => {
        expect(isValidIban("DE89370400440532013001")).toBe(false);
    });
    it("should handle IBAN with blank space characters", () => {
        expect(isValidIban("DE89 3704 0044 0532 0130 00")).toBe(true);
    });
    it("should return false for non alphanumeric characters", () => {
        expect(isValidIban("$*€!")).toBe(false);
    });
    it("should return true for empty string", () => {
        expect(isValidIban("")).toBe(true);
    });
});
