// @ts-ignore
export function transportsCount(state: number = null, action: any) {
    switch (action.type) {
        case "LIST-COUNT_TRANSPORTS":
            return null;
        case "LIST-COUNT_TRANSPORTS_SUCCESS":
            return action.response.count;
        default:
            return state;
    }
}
