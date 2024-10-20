import {useSelector} from "react-redux";

import {getConnectedManager} from "../redux/accountSelector";
import {managerService} from "../services/manager.service";

export function useIsGroupView() {
    const manager = useSelector(getConnectedManager);
    return managerService.isGroupView(manager);
}
