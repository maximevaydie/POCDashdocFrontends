import {apiService} from "@dashdoc/web-common";
import {BuildConstants} from "@dashdoc/web-core";

import {
    Extension,
    ExtensionKey,
    ExtensionsConnectorPost,
} from "../../features/settings/api/types";

export type AbsenceManagerDataSource = "absence_planner";

export const AVAILABLE_ABSENCE_MANAGER: {
    [dataSource in AbsenceManagerDataSource]: Omit<Extension, "connectorCategory" | "dataSource">;
} = {
    absence_planner: {
        name: "Absence Planner",
        iconUrl: `${BuildConstants.staticUrl}img/absence_planner.jpeg`,
        description: "settings.absenceManager.absencePlannerDescription",
        isEnvironmentPickingAvailable: true,
        requiredCredentials: [
            {id: "user", label: "User", type: "text"},
            {id: "password", label: "Password", type: "password"},
        ],
    },
};
export const KEYS_ABSENCE_MANAGER: ExtensionKey = {
    backToList: "settings.absenceManager.backTolist",
    logOutBody: "settings.absenceManager.logOutBody",
    logOutTitle: "settings.absenceManager.logOutTitle",
    creationError: "settings.absence_manager.error",
    deleted: "settings.absence_manager.deleted",
    deletionError: "settings.absence_manager.removeError",
    added: "settings.absence_manager.added",
};

export interface AbsenceType {
    label: string;
    value: number;
}
export type Absence = {absence_remote_id: string; absence_dashdoc: number; absence_type: string};
export type AbsenceList = {absenceList: Absence[]};
export interface AbsencesMapped {
    type_dashdoc: string;
    remote_id: number;
    absence_manager_type: string;
}
export interface AbsencesMappedProps {
    absencesMapped: AbsencesMapped[];
    deleteAbsence: (absencesMapped: AbsencesMapped) => void;
    name: string;
}
export interface AbsenceManagerAbsenceDelete {
    mapping_absence_type: [{type_dashdoc: string; absence_manager_type: string}];
}

export async function fetchCreateAbsenceManagerConnector(payload: ExtensionsConnectorPost) {
    return await apiService.post("/absence-managers/connectors/", payload);
}

export async function fetchGetAbsenceManagerConnector(dataSource: string) {
    return await apiService.get(`/absence-managers/connectors/${dataSource}`);
}

export async function fetchGetAbsenceManagerConnectors() {
    return await apiService.get("/absence-managers/connectors/");
}

export async function fetchDeleteAbsenceManagerConnector(connectorUid: string) {
    return await apiService.delete(`/absence-managers/connectors/${connectorUid}/`);
}

export async function fetchPatchAbsenceManagerConnector(
    connectorUid: string,
    parameters: {environment: string; mapping_absence_type: string}
) {
    return await apiService.patch(`/absence-managers/connectors/${connectorUid}`, parameters);
}

export async function fetchListAbsenceType(connectorUid: string) {
    return await apiService.get(`/absence-managers/${connectorUid}/absence-types/`);
}

export async function fetchSynchronizeAbsenceTypeAndTrucker(connectorUid: string) {
    return await apiService.post(`/absence-managers/${connectorUid}/synchronize/`);
}
