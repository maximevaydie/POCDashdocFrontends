import difference from "lodash.difference";
import union from "lodash.union";
const initialState: any = {transports: [], companies: []};

export function selectionsReducer(state: any = initialState, action: any) {
    let newCheckedRowIds;
    switch (action.type) {
        case "UNSELECT_ALL_ROWS":
            return {
                ...state,
                [action.model]: [],
            };
        case "SELECT_ROWS":
            if (action.checked) {
                newCheckedRowIds = union(state[action.model], action.rowIds);
            } else {
                newCheckedRowIds = difference(state[action.model], action.rowIds);
            }
            return {
                ...state,
                [action.model]: newCheckedRowIds,
            };
        default:
            return state;
    }
}
