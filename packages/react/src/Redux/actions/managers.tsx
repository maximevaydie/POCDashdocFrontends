import {managerSchema} from "../schemas";

import {fetchAdd, fetchDelete, fetchSearch, fetchUpdate} from "./baseActionsEntities";

export function fetchInviteManager(values: any) {
    return fetchAdd("managers/invite", "manager", values, managerSchema, undefined);
}

export function fetchUpdateManager(managerPk: number, values: any, successMessage?: string) {
    return fetchUpdate({
        urlBase: "managers",
        objName: "manager",
        uid: managerPk,
        obj: values,
        objSchema: managerSchema,
        successMessage: successMessage,
    });
}

export function fetchDeleteManager(managerPk: number) {
    return fetchDelete("managers", "manager", managerPk);
}

export function fetchSearchManagers(queryName: string, query: any, page: number) {
    return fetchSearch("managers", "manager", managerSchema, queryName, query, page);
}
