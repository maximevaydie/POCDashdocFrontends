import {fetchAdd, fetchRetrieve, successAction} from "@dashdoc/web-common";
import {APIVersion} from "dashdoc-utils";
import {denormalize, normalize, schema} from "normalizr";
import {useCallback} from "react";
import {
    TypedUseSelectorHook,
    useDispatch as untypedUseDispatch,
    useSelector as untypedUseSelector,
} from "react-redux";

import {loadEntity} from "./actions/entities";
import {Entities, RootState} from "./reducers";

export const useDispatch: () => (action: any) => Promise<any> = untypedUseDispatch;
export type DispatchType = ReturnType<typeof useDispatch>;
export const useSelector: TypedUseSelectorHook<RootState> = untypedUseSelector;

/**
 * Generic hook to get an entity and it loading status from the store state.
 */
export const useEntity = <T, TPost>({
    id,
    urlBase,
    objName,
    objSchema,
    apiVersion,
}: {
    id: string | number | null;
    urlBase: string;
    objName: string;
    objSchema: schema.Entity;
    apiVersion?: APIVersion;
}) => {
    const entitiesKey = objSchema.key;
    const dispatch = useDispatch();
    if (id !== null && id !== undefined) {
        // load the entity thanks to loadEntity.
        dispatch(
            loadEntity({
                urlBase,
                objName,
                objSchema,
                id,
                apiVersion,
            })
        );
    } else {
        // nothing to do, carrier_quotation_request_uid null, undefined or empty.
    }
    const reloadEntity = useCallback(async () => {
        if (id) {
            await dispatch(fetchRetrieve(urlBase, objName, objSchema, id));
        }
    }, [dispatch, urlBase, objName, objSchema, id]);

    const createEntity = useCallback(
        async (values: TPost) => {
            const response = await dispatch(fetchAdd(urlBase, objName, values, objSchema));
            // we dispatch the success action to update the store state directly. (does not need to fetch the entity!)
            await dispatch(successAction("RETRIEVE", normalize(response, objSchema)));
        },
        [dispatch, urlBase, objName, objSchema]
    );

    const state = useSelector(({entities: entitiesState, loading: loadingState}) => {
        const result: {entity: T | null; loading: boolean} = {
            entity: null,
            loading: false,
        };
        if (id) {
            if (
                entitiesKey in entitiesState &&
                entitiesState[entitiesKey as keyof Entities][id]
            ) {
                const normalizedEntity = entitiesState[entitiesKey as keyof Entities][id];
                result.entity = denormalize(normalizedEntity, objSchema, entitiesState);
            }
            if (
                entitiesKey in loadingState.entities &&
                loadingState.entities[entitiesKey as keyof Entities][id] === true
            ) {
                result.loading = true;
            }
        }
        return result;
    });

    return {...state, reloadEntity, createEntity};
};
