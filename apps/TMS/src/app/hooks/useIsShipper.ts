import {getConnectedCompany} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export default function useIsShipper() {
    const connectedCompany = useSelector(getConnectedCompany);
    const role = connectedCompany?.settings?.default_role;
    return !!role && ["shipper", "carrier_and_shipper"].includes(role);
}
