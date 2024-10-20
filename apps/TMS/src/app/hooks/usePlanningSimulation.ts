import {useFeatureFlag, getConnectedManager, managerService} from "@dashdoc/web-common";
import {useSelector} from "react-redux";

export function usePlanningSimulation() {
    const hasPlanningSimulationEnabled = useFeatureFlag("planningSimulation");
    const connectedManager = useSelector(getConnectedManager);

    return hasPlanningSimulationEnabled && managerService.hasAtLeastUserRole(connectedManager);
}
