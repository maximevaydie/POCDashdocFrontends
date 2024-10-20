import {Logger} from "@dashdoc/web-core";

type EntityWithIdOrPk = {pk?: number; [key: string]: any} | {id?: number; [key: string]: any};

function getIdentifier(item: EntityWithIdOrPk): number | null {
    if ("pk" in item && item.pk) {
        return item.pk;
    } else if ("id" in item && item.id) {
        return item.id;
    } else {
        Logger.error("'pk' or 'id' field expected");
        return null;
    }
}

export const entityService = {
    getIdentifier,
};
