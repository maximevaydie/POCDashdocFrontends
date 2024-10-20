import {getConnectedCompany} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export default function useIsCarrier() {
    const connectedCompany = useSelector(getConnectedCompany);
    const role = connectedCompany?.settings?.default_role;
    return !!role && ["carrier", "carrier_and_shipper"].includes(role);
}
