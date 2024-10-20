import {getConnectedCompany, managerService} from "@dashdoc/web-common";
import {getConnectedCompaniesWithAccess, getConnectedManager} from "@dashdoc/web-common";

import {useSelector} from "app/redux/hooks";

export function useHasOtherCompanyInGroupView() {
    const manager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);
    const companies = useSelector(getConnectedCompaniesWithAccess);
    return (
        managerService.hasAtLeastGroupAdminRole(manager) ||
        companies.filter((c) => c.group_view_id === connectedCompany?.group_view_id).length > 1
    );
}
