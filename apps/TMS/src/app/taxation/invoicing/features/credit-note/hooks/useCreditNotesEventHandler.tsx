import {useInterval} from "@dashdoc/web-common";
import {useEffectExceptOnMount} from "dashdoc-utils";
import {createContext, useCallback, useRef} from "react";

import {useSelector} from "app/redux/hooks";
import {getLastReloadCreditNoteEvent} from "app/redux/selectors/realtime";

export const CancelCreditNotesReloadContext = createContext({cancelCreditNoteReload: () => {}});

/**
 * A hook to handle credit notes list realtime updates
 * When some credit notes are added or deleted, some realtime events are received
 * Then it reloads the credit note list
 */
export const useCreditNoteEventHandler = (reloadCreditNotes: () => void, canReload: boolean) => {
    // Invoice live updates
    const lastReloadCreditNoteEvent = useSelector(getLastReloadCreditNoteEvent);
    const needReload = useRef<boolean>(false);

    useEffectExceptOnMount(() => {
        if (lastReloadCreditNoteEvent) {
            needReload.current = true;
        }
    }, [lastReloadCreditNoteEvent]);

    useInterval(() => {
        if (needReload.current && canReload) {
            cancelCreditNoteReload();
            reloadCreditNotes();
        }
    }, 5000);

    const cancelCreditNoteReload = useCallback(() => {
        needReload.current = false;
    }, []);

    return {cancelCreditNoteReload};
};
