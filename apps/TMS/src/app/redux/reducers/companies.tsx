import {searchReducer, searchSuccessReducer} from "@dashdoc/web-common";
import {
    ADD_ADDRESS_SUCCESS,
    REQUEST_COMPANY_SUCCESS,
    REQUEST_DELETE_COMPANY_SUCCESS,
    UPDATE_ADDRESS_SUCCESS,
} from "@dashdoc/web-common";
import {Address, Company, Contact} from "dashdoc-utils";
import isNil from "lodash.isnil";
import deepMerge from "lodash.merge";
import reject from "lodash.reject";
import sortBy from "lodash.sortby";
import cloneDeep from "rfdc/default";

import {REQUEST_COMPANY_SEARCH, REQUEST_COMPANY_SEARCH_SUCCESS} from "app/redux/actions/companies";

export const initialCompaniesSearchQuery = {text: ""};
const initialCompaniesState = {
    results: {},
    query: {initial: initialCompaniesSearchQuery},
    items: {},
};

export default function companies(state: any = cloneDeep(initialCompaniesState), action: any) {
    switch (action.type) {
        case REQUEST_COMPANY_SUCCESS:
        case "UPDATE_COMPANY_SUCCESS":
            return {
                ...state,
                items: {
                    ...state.items,
                    ...{
                        [action.company.pk]: {...action.company, __partial: false},
                    },
                },
            };
        case "ADD_COMPANY_SUCCESS":
            return {
                ...state,
                items: deepMerge({}, state.items, action.response.entities.companies),
            };
        case ADD_ADDRESS_SUCCESS:
        case UPDATE_ADDRESS_SUCCESS: {
            const address =
                action.address ?? action.response.entities.addresses[action.response.result];
            const oldCompany = state.items[address.company?.pk] || {};
            const oldAddresses = oldCompany.addresses || [];
            const oldAddressesWithoutAddress = oldAddresses.filter(
                (a: Address) => a.pk !== address.pk
            );
            const newAddresses = [address].concat(oldAddressesWithoutAddress);
            return {
                ...state,
                items: deepMerge(
                    {},
                    state.items,
                    !isNil(address.company?.pk)
                        ? {
                              [address.company.pk]: {
                                  ...oldCompany,
                                  ...address.company,
                                  addresses: newAddresses,
                                  __partial: !oldCompany.pk,
                              },
                          }
                        : {}
                ),
            };
        }
        case REQUEST_COMPANY_SEARCH:
            return searchReducer(state, action);
        case REQUEST_COMPANY_SEARCH_SUCCESS:
            return searchSuccessReducer(state, action);
        case REQUEST_DELETE_COMPANY_SUCCESS:
            return cloneDeep(initialCompaniesState);
        case "UPDATE_ENTITIES_SUCCESS":
        case "ADD_CONTACT_SUCCESS": {
            const actionContact = action.response.entities?.contacts?.[action.response.result];
            if (!actionContact) {
                return state;
            }
            const stateCompany = state.items[actionContact.company.pk];
            if (!stateCompany) {
                return state;
            }

            const stateContacts = stateCompany.contacts;
            const newContacts = reject(stateContacts, {uid: actionContact.uid}).concat(
                actionContact
            );
            let newState = cloneDeep(state);
            newState.items[actionContact.company.pk].contacts = sortBy(newContacts, ["last_name"]);
            return newState;
        }
        case "DELETE_CONTACT_SUCCESS": {
            const newState = cloneDeep(state);
            Object.values(state.items).forEach((company: Company) => {
                newState.items[company.pk].contacts = newState.items[company.pk].contacts?.filter(
                    (contact: Contact) => contact.uid !== action.pk
                );
            });
            return newState;
        }
        default:
            return state;
    }
}
