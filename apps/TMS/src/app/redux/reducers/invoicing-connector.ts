import {Connector} from "dashdoc-utils";

export default function invoicingConnector(state: Connector | null = null, action: any) {
    switch (action.type) {
        case "IS-AUTHENTICATED_INVOICINGCONNECTOR_SUCCESS":
            if (action.response.authenticationData?.code === "no_invoicing_connector") {
                return null;
            }

            if (!state) {
                return action.response.connector;
            }

            return {
                ...state,
                ...action.response.connector,
            };
        default:
            return state;
    }
}
