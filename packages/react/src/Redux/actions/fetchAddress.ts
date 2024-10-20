import {fetchRetrieve} from "../actions/baseActionsEntities";
import {addressSchema} from "../schemas";

export function fetchRetrieveAddress(addressPk: string) {
    return fetchRetrieve("addresses", "address", addressSchema, addressPk);
}
