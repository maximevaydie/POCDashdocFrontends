import {getConnectedCompany} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export default function useIsInvited() {
    const connectedCompany = useSelector(getConnectedCompany);
    return connectedCompany?.account_type === "invited";
}
