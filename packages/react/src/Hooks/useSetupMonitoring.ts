import {useEffect} from "react";

import {monitoringService} from "../services/monitoring.service";

export function useSetupMonitoring() {
    useEffect(() => {
        monitoringService.setup();
    }, []);
}

export function useSetupMonitoringUser(userPk: number) {
    useEffect(() => {
        monitoringService.setupUser(userPk);
    }, [userPk]);
}
