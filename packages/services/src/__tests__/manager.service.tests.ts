import {readOnlyManager} from "__mocks__/managerMocks";
import {ManagerRole} from "dashdoc-utils";

import {managerService} from "../manager.service";

describe("isReadOnly", () => {
    test("with null", () => {
        expect(managerService.isReadOnly(null)).toBe(true);
    });

    test("with a readOnly manager", () => {
        expect(managerService.isReadOnly(readOnlyManager)).toBe(true);
    });

    test("with an user manager", () => {
        const manager = {...readOnlyManager, role: ManagerRole.User};
        expect(managerService.isReadOnly(manager)).toBe(false);
    });

    test("with an admin manager", () => {
        const manager = {...readOnlyManager, role: ManagerRole.Admin};
        expect(managerService.isReadOnly(manager)).toBe(false);
    });

    test("with a GroupViewAdmin manager", () => {
        const manager = {...readOnlyManager, role: ManagerRole.GroupViewAdmin};
        expect(managerService.isReadOnly(manager)).toBe(false);
    });
});
