import {DEFAULT_OPENING_HOURS} from "constants";

import {Company} from "dashdoc-utils";
import {Site, Zone} from "types";

export const company = {
    pk: 12,
    name: "Test Company",
} as Company;

export const site: Site = {
    id: 1,
    name: "Test Site",
    company: 12,
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

export const zones: Zone[] = [
    {
        id: 1,
        site: 1,
        name: "Approvisionnement",
        description: "",
        delegable: false,
        booking_in_turns: false,
        concurrent_slots: 4,
        slot_duration: 15,
        opening_hours: DEFAULT_OPENING_HOURS,
        max_visibility: 14,
        notice_period: 30,
        notice_period_mode: "relative_datetime",
        notice_period_days_before_booking: null,
        notice_period_time_of_day: null,
        custom_fields: [],
    },
    {
        id: 2,
        site: 1,
        name: "Départ bois rond",
        description: "",
        delegable: false,
        booking_in_turns: false,
        concurrent_slots: 2,
        slot_duration: 15,
        opening_hours: DEFAULT_OPENING_HOURS,
        max_visibility: 14,
        notice_period: 30,
        notice_period_mode: "relative_datetime",
        notice_period_days_before_booking: null,
        notice_period_time_of_day: null,
        custom_fields: [],
    },
    {
        id: 3,
        site: 1,
        name: "Départ palettes",
        delegable: true,
        booking_in_turns: false,
        description: "",
        concurrent_slots: 4,
        slot_duration: 30,
        opening_hours: DEFAULT_OPENING_HOURS,
        max_visibility: 14,
        notice_period: 30,
        notice_period_mode: "relative_datetime",
        notice_period_days_before_booking: null,
        notice_period_time_of_day: null,
        custom_fields: [],
    },
];

export const baseState = {
    auth: {
        token: {
            access: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjk5NDY2MzQ1LCJpYXQiOjE2OTk0NTQzMjAsImp0aSI6IjE2YmVlYzQ4NWNiNjQ1Njk4MjBkNDk3ZTg5M2Q5OTRlIiwidXNlcl9pZCI6MjEzMTM3fQ.Bfr1I_b_MThhHVdMK6rmi_cl27U2k54aWPVj7b9CXHo",
            refresh:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTcwMDA2NzU0NSwiaWF0IjoxNjk5NDYyNzQ1LCJqdGkiOiI4MjFjY2QzMDUxOGE0NDY0ODU0N2MxMDRhODIyMDIyYSIsInVzZXJfaWQiOjIxMzEzN30.B-vmpt_pBwFt3z4JG1ZnzfDET6E06jmsacKN7dvBaKU",
            exp: 1699466345,
        },
    },
    account: {
        companies: [{...company, flow_site: {id: 1}}],
    },
    router: {
        location: {
            pathname: "/flow/site/fab-carrier-pays-de-loire/",
        },
    },
    flow: {
        site: {
            loading: "idle",
            entity: site,
        },
        zone: {
            loading: "idle",
            entities: {},
        },
    },
};
