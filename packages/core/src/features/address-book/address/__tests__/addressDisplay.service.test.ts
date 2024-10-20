import {addressDisplayService} from "../addressDisplay.service";

describe("getAddressDisplay", () => {
    test("with undefined values", () => {
        expect(
            addressDisplayService.addressDisplay(undefined, undefined, undefined, "fr")
        ).toStrictEqual("");
    });

    test("with defined houseNumber only", () => {
        expect(
            addressDisplayService.addressDisplay("11", undefined, undefined, "fr")
        ).toStrictEqual("");
    });

    test("with defined street only", () => {
        expect(
            addressDisplayService.addressDisplay(undefined, "Hyacinthe", undefined, "fr")
        ).toStrictEqual("Hyacinthe");
    });

    test("with defined district only", () => {
        expect(
            addressDisplayService.addressDisplay(undefined, undefined, "L'Auzaire", "fr")
        ).toStrictEqual("L'Auzaire");
    });

    test("with defined houseNumber and street", () => {
        expect(
            addressDisplayService.addressDisplay("11", "Hyacinthe", undefined, "fr")
        ).toStrictEqual("11 Hyacinthe");
    });

    test("with defined houseNumber and district", () => {
        expect(
            addressDisplayService.addressDisplay("11", undefined, "L'Auzaire", "fr")
        ).toStrictEqual("L'Auzaire");
    });
    test("with defined street and district", () => {
        expect(
            addressDisplayService.addressDisplay(undefined, "Hyacinthe", "L'Auzaire", "fr")
        ).toStrictEqual("Hyacinthe");
    });

    test("with defined houseNumber, street, and district", () => {
        expect(
            addressDisplayService.addressDisplay("11", "Hyacinthe", "L'Auzaire", "fr")
        ).toStrictEqual("11 Hyacinthe");
    });
});
