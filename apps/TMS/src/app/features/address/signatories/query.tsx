import {apiService} from "@dashdoc/web-common";
import {NewSignatory} from "dashdoc-utils";
import sortBy from "lodash.sortby";

export const getAddressSignatories = async (
    originalAddressId: number,
    siteUID?: string,
    sortedBySignatureCount = true
): Promise<NewSignatory[]> => {
    const response = await apiService.TransportSignatories.getAll(
        {
            query: {address: originalAddressId, site: siteUID},
        },
        {apiVersion: "web"}
    );
    if (sortedBySignatureCount) {
        return sortBy(response.results, (signatory) => {
            if (signatory.address_data === null) {
                return 0;
            }
            if (signatory.address_data[originalAddressId]?.signature_count === null) {
                return 0;
            }
            return -signatory.address_data[originalAddressId].signature_count;
        });
    } else {
        return response.results;
    }
};
