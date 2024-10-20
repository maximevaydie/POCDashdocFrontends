import {creditNoteActionsService} from "../creditNoteActions.service";

describe("Available Credit Note Actions", () => {
    test("on draft credit note", () => {
        expect(creditNoteActionsService.getMainActions("draft", false)).toStrictEqual([
            "finalize",
        ]);
        expect(creditNoteActionsService.getExtraActions("draft", false)).toStrictEqual(["delete"]);
    });

    test("on final credit note", () => {
        expect(creditNoteActionsService.getMainActions("final", false)).toStrictEqual([
            "markPaid",
        ]);
        expect(creditNoteActionsService.getExtraActions("final", false)).toStrictEqual([]);
    });
    test("on paid credit note", () => {
        expect(creditNoteActionsService.getMainActions("paid", false)).toStrictEqual([
            "markNotPaid",
        ]);
        expect(creditNoteActionsService.getExtraActions("paid", false)).toStrictEqual([]);
    });
    test("on shared credit note", () => {
        expect(creditNoteActionsService.getMainActions("draft", true)).toStrictEqual([]);
        expect(creditNoteActionsService.getMainActions("final", true)).toStrictEqual([]);
        expect(creditNoteActionsService.getMainActions("paid", true)).toStrictEqual([]);
    });
});
