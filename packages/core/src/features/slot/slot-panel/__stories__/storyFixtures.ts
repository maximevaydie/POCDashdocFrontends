import {Site, Slot, SlotEvent} from "types";

export const slot: Slot = {
    id: 1,
    start_time: "2022-01-01T10:00:00Z",
    end_time: "2022-01-01T11:00:00Z",
    company: {pk: 12345, name: "Acme Inc."},
    author: {
        email: "claire.inc@dubois.fr",
        first_name: "Claire",
        last_name: "Dubois",
    },
    owner: {pk: 12345, name: "Acme Inc."},
    references: ["ref1", "ref2"],
    custom_fields: [],
    note: "",
    state: "completed",
    zone: 1,
    cancelled_by: null,
    cancel_company: null,
    cancel_reason: "",
    cancelled_at: null,
    arrived_at: null,
    completed_at: null,
    handled_at: null,
    within_booking_window: true,
};

export const site: Site = {
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

export const slotEvents: SlotEvent[] = [
    {
        id: 1,
        slot: 1,
        author: {
            email: "jean.mich@t44.fr",
            first_name: "Jean",
            last_name: "Michel",
        },
        created_at: "2022-01-01T10:00:00Z",
        category: "created",
        data: {
            start_time: "2022-01-02T11:00:00Z",
        },
    },
    {
        id: 2,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:20:00Z",
        category: "arrived",
    },
    {
        id: 3,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:21:00Z",
        category: "arrival_cancelled",
    },
    {
        id: 4,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:22:00Z",
        category: "arrived",
    },
    {
        id: 5,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:22:00Z",
        category: "completed",
    },
    {
        id: 6,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:23:00Z",
        category: "completion_cancelled",
    },
    {
        id: 7,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:24:00Z",
        category: "completed",
    },
    {
        id: 1,
        slot: 1,
        author: {
            email: "jean.mich@t44.fr",
            first_name: "Jean",
            last_name: "Michel",
        },
        created_at: "2022-01-01T11:00:00Z",
        category: "rescheduled",
        data: {
            new: "2022-01-05T10:00:00Z",
            previous: "2022-01-02T11:00:00Z",
        },
    },
    {
        id: 1,
        slot: 1,
        author: {
            email: "claire.inc@dubois.fr",
            first_name: "Claire",
            last_name: "Dubois",
        },
        created_at: "2022-01-01T10:00:00Z",
        category: "cancelled",
        data: {
            reason: "No reason!",
        },
    },
];
