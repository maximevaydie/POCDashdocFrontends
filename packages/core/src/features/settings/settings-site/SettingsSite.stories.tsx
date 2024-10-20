import {Company} from "dashdoc-utils";
import React from "react";

import {SettingsSite as Component} from "./SettingsSite";

export default {
    title: "flow/features/settings",
    component: Component,
};

const company = {
    pk: 12,
    name: "Test Company",
} as Company;

const site = {
    id: 1,
    name: "Test Site",
    company: 12345,
    slug: "test-site",
    address: {
        pk: 123,
        country: "FR",
        address: "Test Address",
        postcode: "12345",
        city: "Test City",
        latitude: 42,
        longitude: 3,
    },
    timezone: "Europe/Paris",
    contact_email: null,
    contact_phone: null,
    security_protocol: null,
    use_slot_handled_state: false,
};

export const SettingsSite = () => (
    <div style={{height: "90vh", width: "90vw"}}>
        <Component company={company} site={site} />
    </div>
);
