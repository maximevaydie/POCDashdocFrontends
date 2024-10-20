import {theme} from "@dashdoc/web-ui";
import {readOnlyManager} from "__mocks__/managerMocks";
import {Company} from "dashdoc-utils";
import React from "react";

import type {ManagerCompany} from "types/types";

import {CompanySwitcher} from "../CompanySwitcher";

const fixtureOnlyOneCompany = {
    connectedCompany: {
        pk: 1,
        name: "TRANSPORT PINEAU Groupe Mousset",
        managed_by_name: null as any,
    } as Company,
    connectedCompanies: [
        {
            pk: 1,
            name: "TRANSPORT PINEAU Groupe Mousset",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
    ] as ManagerCompany[],
};

const fixtureFewCompanies = {
    connectedCompany: {
        pk: 1,
        name: "TRANSPORT PINEAU Groupe Mousset",
        managed_by_name: null as any,
    } as Company,
    connectedCompanies: [
        {
            pk: 1,
            name: "TRANSPORT PINEAU Groupe Mousset",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: null as any,
        },
        {
            pk: 2,
            name: "LOGICIA Groupe Mousset",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: null as any,
        },
        {
            pk: 3,
            name: "TIMA Groupe Mousset",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
    ] as ManagerCompany[],
};

const fixtureManyCompanies = {
    connectedCompany: {
        pk: 1,
        name: "TRANSPORT PINEAU Groupe Mousset",
        managed_by_name: null as any,
    } as Company,
    connectedCompanies: [
        {
            pk: 1,
            name: "TRANSPORT PINEAU Groupe Mousset",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: null as any,
        },
        {
            pk: 2,
            name: "LOGICIA Groupe Mousset",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: null as any,
        },
        {
            pk: 3,
            name: "TIMA Groupe Mousset",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 4,
            name: "Company A",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 5,
            name: "B Company",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 6,
            name: "TIMA Groupe Mousset",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 7,
            name: "SAS Chose",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 8,
            name: "Machin chouette",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 9,
            name: "Truc bidule",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 10,
            name: "TIMA Groupe Mousset",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 11,
            name: "Groupe Debej",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
        {
            pk: 12,
            name: "John SARL",
            last_switch_date: null as any,
            managed_by_name: null as any,
        },
    ] as ManagerCompany[],
};

const fixtureSeveralCompaniesInvited: {
    connectedCompany: Company;
    connectedCompanies: ManagerCompany[];
} = {
    connectedCompany: {
        pk: 1,
        name: "Suez",
        managed_by_name: "Mauffrey",
    } as Company,
    connectedCompanies: [
        {
            pk: 1,
            name: "Suez",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: "Mauffrey",
        },
        {
            pk: 2,
            name: "Suez group",
            last_switch_date: "2020-04-10T12:06:40.238257Z",
            managed_by_name: "Transport Mousset",
        },
        {
            pk: 3,
            name: "Suez IDF",
            last_switch_date: null as any,
            managed_by_name: "Transport TG",
        },
    ] as ManagerCompany[],
};

export default {
    title: "common/features/company/Company selector",
    component: CompanySwitcher,
};

export const OnlyOneCompany = () => (
    <div style={{backgroundColor: theme.colors.grey.light, padding: "10px", width: "220px"}}>
        <CompanySwitcher
            connectedManager={readOnlyManager}
            {...fixtureOnlyOneCompany}
            connectedGroupViews={[]}
            redirectPath="/app/"
        />
    </div>
);

export const FewCompanies = () => (
    <div style={{backgroundColor: theme.colors.grey.light, padding: "10px", width: "220px"}}>
        <CompanySwitcher
            connectedManager={readOnlyManager}
            {...fixtureFewCompanies}
            connectedGroupViews={[]}
            redirectPath="/app/"
        />
    </div>
);

export const ManyCompanies = () => (
    <div style={{backgroundColor: theme.colors.grey.light, padding: "10px", width: "220px"}}>
        <CompanySwitcher
            connectedManager={readOnlyManager}
            {...fixtureManyCompanies}
            connectedGroupViews={[]}
            redirectPath="/app/"
        />
    </div>
);

export const CompanyIsInvited = () => (
    <div style={{backgroundColor: theme.colors.grey.light, padding: "10px", width: "220px"}}>
        <CompanySwitcher
            connectedManager={readOnlyManager}
            {...fixtureSeveralCompaniesInvited}
            connectedGroupViews={[]}
            redirectPath="/app/"
        />
    </div>
);
