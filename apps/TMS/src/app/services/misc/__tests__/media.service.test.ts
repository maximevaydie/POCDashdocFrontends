import {resolveMediaUrl} from "@dashdoc/core";

describe("resolveMediaUrl", () => {
    test("does not change an already absolute URL", () => {
        const absoluteUrl = "https://storage.googleapis.com/dashdoc-media/media/fake/Export.xlsx";
        expect(resolveMediaUrl(absoluteUrl)).toBe(absoluteUrl);
    });

    test("resolve a relative URL into an absolute URL", () => {
        const relativeUrl = "/media/fake/Export.xlsx";
        expect(resolveMediaUrl(relativeUrl)).toBe(
            `${import.meta.env.VITE_API_HOST}${relativeUrl}`
        );
    });
});
