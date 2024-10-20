import {getConnectedCompany, getConnectedCompaniesWithAccess} from "@dashdoc/web-common";

import {useExtendedView} from "app/hooks/useExtendedView";
import {useSelector} from "app/redux/hooks";

export function useHasEditionRightsOnTrip(carrier: number | {pk?: number} | undefined) {
    const company = useSelector(getConnectedCompany);
    const companies = useSelector(getConnectedCompaniesWithAccess);
    const {extendedView} = useExtendedView();
    const tripCarrierId = (carrier as {pk: number})?.pk || carrier;
    const ownedByCompany = tripCarrierId === company?.pk;
    const ownedByOneOfCompanies = companies.some((company) => tripCarrierId === company?.pk);
    return ownedByCompany || (ownedByOneOfCompanies && extendedView);
}
