import {getConnectedGroupViews} from "@dashdoc/web-common";
import sortedUniq from "lodash.uniq";

import {useSelector} from "app/redux/hooks";

export function useCompaniesInGroupViews() {
    const groupViews = useSelector(getConnectedGroupViews);
    const companyGroupPks = sortedUniq(groupViews.flatMap((groupView) => groupView.companies));
    return companyGroupPks;
}
