import {ErrorMessage, fetchRetrieve, storeService} from "@dashdoc/web-common";
import {APIVersion} from "dashdoc-utils";
import {schema} from "normalizr";

import {Entities, RootState} from "../reducers";

/** @guidedtour[epic=redux] Data loading policy: Load function
 * We create this function to load data only if not already loaded.
 * We use the storeService to access the state and detect a loading/loaded state on the underlying entity.
 */
export function loadEntity({
    urlBase,
    objName,
    objSchema,
    id,
    errorMessage,
    apiVersion,
    omitCredentials,
}: {
    urlBase: string;
    objName: string;
    objSchema: schema.Entity;
    id: string | number;
    errorMessage?: ErrorMessage;
    apiVersion?: APIVersion;
    omitCredentials?: boolean;
}) {
    const state = storeService.getState<RootState>();
    if (
        objSchema.key in state.loading.entities &&
        state.loading.entities[objSchema.key as keyof Entities] &&
        state.loading.entities[objSchema.key as keyof Entities][id]
    ) {
        return () => {
            // nothing to do, loading already in progress
        };
    }
    if (
        objSchema.key in state.entities &&
        state.entities[objSchema.key as keyof Entities] &&
        state.entities[objSchema.key as keyof Entities][id]
    ) {
        return () => {
            // nothing to do, already loaded
        };
    }
    // otherwise, we fetch the entity
    return fetchRetrieve(
        urlBase,
        objName,
        objSchema,
        id,
        errorMessage,
        apiVersion,
        omitCredentials
    );
}
