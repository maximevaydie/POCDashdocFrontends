import {aCompany, aSetting} from "__mocks__/companyMocks";

import {companyService} from "../company.service";

describe("canCreateCompany", () => {
    test("with undefined", () => {
        expect(companyService.canCreateCompany(undefined)).toBe(false);
    });

    test("with a company without settings", () => {
        expect(companyService.canCreateCompany(aCompany)).toBe(true);
    });

    test("with a block_shipper_creation=true", () => {
        const company = {...aCompany, settings: aSetting};
        expect(companyService.canCreateCompany(company)).toBe(false);
    });

    test("with a block_shipper_creation=false", () => {
        const settings = {...aSetting, block_shipper_creation: false};
        const company = {...aCompany, settings};
        expect(companyService.canCreateCompany(company)).toBe(true);
    });
});
