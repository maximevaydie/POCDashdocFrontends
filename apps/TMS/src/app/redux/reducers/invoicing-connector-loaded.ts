export default function invoicingConnectorLoaded(state = false, action: any) {
    switch (action.type) {
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_ERROR":
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_INVOICINGCONNECTOR_ERROR":
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_SUCCESS":
            return true;
        case "ADD_INVOICINGCONNECTOR_SUCCESS":
        case "REQUEST_INVOICINGCONNECTOR_SUCCESS":
            return false;
        default:
            return state;
    }
}
