import {getConnectedManager} from "@dashdoc/web-common";
import {managerService} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export function useIsReadOnly() {
    const connectedManager = useSelector(getConnectedManager);
    return managerService.isReadOnly(connectedManager);
}
