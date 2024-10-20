import type {CreditNote} from "app/taxation/invoicing/types/creditNote.types";

export type CreditNoteAction = "delete" | "finalize" | "markPaid" | "markNotPaid" | "openInNewTab";

function getMainActions(status: CreditNote["status"], fromSharing: boolean) {
    let actions: CreditNoteAction[] = [];
    if (!fromSharing) {
        switch (status) {
            case "paid":
                actions.push("markNotPaid");
                break;
            case "final":
                actions.push("markPaid");
                break;
            case "draft":
                actions.push("finalize");
                break;
        }
    }
    return actions;
}

function getExtraActions(status: CreditNote["status"], fromSharing: boolean) {
    if (fromSharing) {
        return [];
    }
    let actions: CreditNoteAction[] = [];

    if (status === "draft") {
        actions.push("delete");
    }
    return actions;
}

export const creditNoteActionsService = {
    getMainActions,
    getExtraActions,
};
