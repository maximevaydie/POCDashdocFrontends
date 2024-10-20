// @guidedtour[epic=redux, seq=4] Action example
// This is an example of an action that is used to update the selected segment in the scheduler
// We define an object with a type and a payload. The object is then passed to the reducer.
export function updateSelectedSegment(selectedSegmentUid?: string) {
    return {
        type: "UPDATE_SELECTED_SEGMENT",
        selectedSegmentUid,
    };
}
