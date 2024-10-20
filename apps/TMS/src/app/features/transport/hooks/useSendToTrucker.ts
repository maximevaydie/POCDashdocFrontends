import createPersistedState from "use-persisted-state";

const persistedState = createPersistedState("assign-means-modal-send-to-trucker");

export function useSendToTrucker() {
    const [sendToTrucker, persistSendToTrucker] = persistedState(true);
    return {sendToTrucker, persistSendToTrucker};
}
