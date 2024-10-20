export default function invoicingConnectorLoading(state = false, action: any) {
    switch (action.type) {
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR":
            return true;
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_ERROR":
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_INVOICINGCONNECTOR_ERROR":
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_SUCCESS":
            return false;
        default:
            return state;
    }
}
