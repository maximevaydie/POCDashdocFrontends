import {Company} from "dashdoc-utils";
import React from "react";
import {default as withRouter} from "storybook-react-router";

import {withReduxStore} from "../../../../../.storybook/decorators";
import {Sidebar} from "../Sidebar";

export default {
    title: "app/features/Sidebar",
    decorators: [withRouter()],
};

export const WithNoCompany = () => <Sidebar isOpen={true} onClose={() => {}} />;
WithNoCompany.decorators = [withReduxStore({company: {}})];

// with self managed company
const selfManagedCompany: Partial<Company> = {
    pk: 1,
    // @ts-ignore
    managed_by_name: null,
    name: "On the road SARL",
};
export const WithSelfManagedCompany = () => <Sidebar isOpen={true} onClose={() => {}} />;
WithSelfManagedCompany.decorators = [
    withReduxStore({
        company: selfManagedCompany,
        connectedManager: 1,
        entities: {
            managers: {
                1: {role: "admin", display_name: "Johnny Manager", company: selfManagedCompany},
            },
        },
    }),
];

// invited company
const invitedCompany: Partial<Company> = {
    pk: 1,
    managed_by_name: "Henri Dès",
    name: "On the road SARL",
};
export const WithInvitedCompany = () => <Sidebar isOpen={true} onClose={() => {}} />;
WithInvitedCompany.decorators = [
    withReduxStore({
        company: invitedCompany,
        connectedManager: 1,
        entities: {
            managers: {
                1: {role: "readonly", display_name: "Johnny Manager", company: invitedCompany},
            },
        },
    }),
];

// with switch
export const WithSwitch = () => <Sidebar isOpen={true} onClose={() => {}} />;
WithSwitch.decorators = [
    withReduxStore({
        company: selfManagedCompany,
        connectedManager: 1,
        entities: {
            managers: {
                1: {
                    role: "admin",
                    display_name: "Johnny Manager",
                    company: selfManagedCompany,
                    companies: [
                        selfManagedCompany,
                        {pk: 2, name: "Test", managed_by_name: "Thing"},
                        {pk: 3, name: "Other"},
                    ],
                },
            },
        },
    }),
];
