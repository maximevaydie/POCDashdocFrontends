// @guidedtour[epic=redux, seq=6] Reducer example
// Here we define a simple reducer that handles the UPDATE_SELECTED_SEGMENT action.
// The reducer is a pure function that takes the current state and an action and returns the new state.
// The state is immutable, so we never modify it, we always return a new state.
// The reducer is called by the store when an action is dispatched.
// If the action is not handled by the reducer, the state is returned unchanged.
// If the action is matched in the switch statement, the new state is returned.

type CarrierCharteringSchedulerState = {
    selectedSegmentUid: string | null;
};

const initialState: CarrierCharteringSchedulerState = {selectedSegmentUid: null};

export default function carrierCharteringScheduler(
    state: CarrierCharteringSchedulerState = initialState,
    action: any
) {
    switch (action.type) {
        case "UPDATE_SELECTED_SEGMENT":
            return {
                ...state,
                selectedSegmentUid: action.selectedSegmentUid,
            };
        default:
            return state;
    }
}
