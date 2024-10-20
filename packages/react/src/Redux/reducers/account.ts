import {RootState} from "redux/reducers";

import {FlowManagerCompany} from "../../types/company";

export const getCompaniesWithFlow = ({account: {companies}}: RootState) =>
    companies.filter(
        (company: FlowManagerCompany) => company.flow_site !== null
    ) as FlowManagerCompany[];

export const getCompaniesWithFlowDelegation = ({account: {companies}}: RootState) =>
    companies.filter(
        (company: FlowManagerCompany) => company.flow_delegations.length > 0
    ) as FlowManagerCompany[];
