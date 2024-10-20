import createPersistedState from "use-persisted-state";

const persistedState = createPersistedState("send-to-carrier");

export function useSendToCarrier() {
    const [sendToCarrier, persistSendToCarrier] = persistedState(true);
    return {sendToCarrier, persistSendToCarrier};
}
