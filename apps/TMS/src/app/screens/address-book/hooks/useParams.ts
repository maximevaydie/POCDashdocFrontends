import {useLocation} from "react-router";

import {AddressBookTab} from "app/types/addressBook";

const ALL_ADDRESS_BOOK_TABS: AddressBookTab[] = [
    "other",
    "carrier",
    "shipper",
    "shipper-template",
];

export function useParams(match: {params: {companyPk: string}}) {
    // We assume that the companyPk is always a number and always present
    const companyPk = parseInt(match.params.companyPk as string);

    const location = useLocation();
    const tab = location.search.replace("?tab=", "");
    let addressBookTab: AddressBookTab = "other";
    if ((ALL_ADDRESS_BOOK_TABS as string[]).includes(tab)) {
        addressBookTab = tab as AddressBookTab;
    }

    return {companyPk, addressBookTab};
}
