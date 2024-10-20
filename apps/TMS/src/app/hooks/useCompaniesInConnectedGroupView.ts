import {getConnectedCompany, getConnectedGroupViews} from "@dashdoc/web-common";
import {GroupView} from "dashdoc-utils";

import {useSelector} from "app/redux/hooks";

/**Output the list of all companies pks in the group of the connected company*/
export function useCompaniesInConnectedGroupView() {
    const connectedCompany = useSelector(getConnectedCompany);
    const groupViews = useSelector(getConnectedGroupViews);
    if (!connectedCompany) {
        return [];
    }

    const connectedGroupView = groupViews.find((gv: GroupView) =>
        gv.companies.includes(connectedCompany.pk)
    );
    const result: number[] = connectedGroupView?.companies ?? [];
    return result;
}
