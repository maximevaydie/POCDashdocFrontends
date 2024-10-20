import {getConnectedCompany} from "@dashdoc/web-common";
import {companyIsQualimat} from "dashdoc-utils";
import {useMemo} from "react";

import {useSelector} from "app/redux/hooks";

export default function useCompanyIsQualimat() {
    const company = useSelector(getConnectedCompany);
    return useMemo(() => companyIsQualimat(company), [company]);
}
