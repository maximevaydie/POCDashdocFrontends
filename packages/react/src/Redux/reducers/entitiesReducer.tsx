import {Address, Company, Contact} from "dashdoc-utils";
import mergeWith from "lodash.mergewith";
import omit from "lodash.omit";
import uniq from "lodash.uniq";
import {denormalize} from "normalizr";
import cloneDeep from "rfdc/default";

import {fetchAccount} from "../../redux/reducers/accountReducer";
import {addressSchema} from "../schemas";

import type {LogisticPoint} from "../../types/logisticPoint";
import type {PartnerDetailOutput} from "../../types/partnerTypes";

function mergeCustomizer<T = any>(objValue: T, otherValue: T, key: string): any {
    if (key === "loads" || key === "status_updates" || key === "messages") {
        return otherValue;
    }
    if (key === "signatures" && objValue instanceof Array && otherValue instanceof Array) {
        const allSignatures = otherValue.concat(objValue);
        return uniq(allSignatures);
    }
    if (key === "split_turnover") {
        return otherValue;
    }
    if (key === "__partial") {
        return objValue && otherValue;
    }
    if (key === "is_list_element") {
        return objValue && otherValue;
    }
    if (Array.isArray(objValue)) {
        return otherValue;
    }
    if (objValue === undefined) {
        return otherValue;
    }
}

function mergeEntities<T = any>(oldEntities: T, newEntities: T) {
    return mergeWith({}, cloneDeep(oldEntities), newEntities, mergeCustomizer);
}

/**
 * Function to extend the entities reducer.
 * A null value as return will fallback to the default entities reducer.
 */
export type EntitiesReducerType = (state: any, action: any) => object | null;

export type CommonEntities = {
    logisticPoints: Record<string, LogisticPoint>;
    partnerDetails: Record<string, PartnerDetailOutput>;
    addresses: Record<string, Address>;
    contacts: Record<string, Contact>;
    companies: Record<string, Company>;
};

export function entitiesReducer(
    extendReducer?: EntitiesReducerType
): (state: any, action: any) => any {
    return (state: any = {}, action: any) => {
        let newState: any = extendReducer?.(state, action);
        if (newState) {
            return newState;
        }
        switch (action.type) {
            case "SEARCH_ENTITIES_SUCCESS":
            case "SEARCH_PARTIAL_ENTITIES_SUCCESS":
            case "SEARCH_BY_UIDS_ENTITIES_SUCCESS":
            case "RETRIEVE_ENTITIES_SUCCESS":
            case "UPDATE_ENTITIES_SUCCESS":
            case "ADD_MANAGER_SUCCESS":
            case "ADD_COMPANY_SUCCESS":
            case "ADD_SETTINGSVIEW_SUCCESS":
                return mergeEntities(state, action.response.entities);

            case "UPDATE_MANAGER_SUCCESS":
                // MEMO: think to keep in sync the manager in the account reducer when you edit this part
                newState = mergeEntities(state, action.response.entities);
                newState.managers = cloneDeep(newState.managers);
                return newState;
            case "DELETE_MANAGER_SUCCESS":
                return {
                    ...state,
                    managers: omit(state.managers, action.pk),
                };

            case fetchAccount.fulfilled.type: {
                // MEMO: think to keep in sync the manager in the account reducer when you edit this part
                const {manager} = action.payload;
                return mergeEntities(state, manager.entities);
            }
            default:
                return state;
        }
    };
}

export function getFullAddress(state: any, pk: number): Address {
    if (state?.entities?.addresses?.[pk]) {
        return denormalize(state.entities.addresses?.[pk], addressSchema, state);
    }
    throw new Error(`Address with pk ${pk} not found`);
}
