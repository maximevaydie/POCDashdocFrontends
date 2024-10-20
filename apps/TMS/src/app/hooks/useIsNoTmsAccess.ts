import {getConnectedManager} from "@dashdoc/web-common";
import {managerService} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export function useHasTmsAccess() {
    const connectedManager = useSelector(getConnectedManager);
    return managerService.hasTmsAccess(connectedManager);
}
