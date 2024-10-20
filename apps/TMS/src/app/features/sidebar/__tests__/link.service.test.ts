import {linkService} from "../link.service";

describe("extractBaseLink", () => {
    test("should work with default baseUrl", () => {
        expect(linkService.extractBaseLink("/app/what-ever/some/path", "/app")).toBe(
            "/app/what-ever/"
        );
    });

    test("should work with groupview baseUrl", () => {
        expect(
            linkService.extractBaseLink("/app/groupview/what-ever/some/path", "/app/groupview")
        ).toBe("/app/groupview/what-ever/");
    });

    test("should work with simple link", () => {
        expect(linkService.extractBaseLink("/app/what-ever/", "/app")).toBe("/app/what-ever/");
    });

    test("should work without slash at the end of a simple link", () => {
        expect(linkService.extractBaseLink("/app/what-ever", "/app")).toBe("/app/what-ever/");
    });

    test("should return null if regex doesn't match", () => {
        expect(linkService.extractBaseLink("/app", "/app")).toBeNull;
    });
});
