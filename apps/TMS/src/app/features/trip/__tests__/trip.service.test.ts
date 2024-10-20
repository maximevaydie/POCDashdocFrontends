import {syncSetupI18n, t} from "@dashdoc/web-core";

import {
    getActivitiesWithFakeMergedActivitiesAdded,
    getActivityLoadSummary,
    canAddBreak,
} from "../trip.service";
import {SimilarActivity, SimilarActivityWithTransportData, TripActivity} from "../trip.types";

beforeAll(() => {
    syncSetupI18n();
});

test("merge activities", () => {
    const activities = [
        {
            uid: "168128571616984vpZAj3Q",
            category: "loading",
            address: {
                id: 56677061,
                original: 51646758,
                name: "OHRA REGALANLANGEN GMBH",
                city: "Kerpen",
                postcode: "50169",
                country: "DE",
                latitude: 50.86708,
                longitude: 6.7516,
                address: "Alfred-Nobel-Straße 24",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "A",
            instructions: "",
            transport: {
                id: 9382203,
                uid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                shipper: {
                    pk: 1843996,
                    name: "OHRA REGALANLANGEN GMBH",
                },
                sequential_id: 9382203,
                status: "acknowledged",
                requested_vehicle: null,
                is_order: false,
                tags: [
                    {
                        pk: 8097,
                        name: "P-Herstal",
                    },
                ],
                instructions: "Tel.: 03 - 633.11.39",
                business_privacy: false,
                is_multiple_compartments: false,
                carrier_id: 1083715,
                deleted: null,
            },
            scheduled_range: {
                start: "2023-04-18T04:00:00Z",
                end: "2023-04-18T04:00:00Z",
            },
            estimated_distance_to_next_trip_activity: 0,
            estimated_driving_time_to_next_trip_activity: 0,
            deliveries_from: [
                {
                    uid: "56c85414-86d4-48ac-9fd1-ec9dcd0c3b27",
                    sequential_id: 9390456,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            deliveries_to: [],
            cancelled_status: null,
        },
        {
            uid: "168128623016984sKmrzoI",
            category: "loading",
            address: {
                id: 56678109,
                original: 51646758,
                name: "OHRA REGALANLANGEN GMBH",
                city: "Kerpen",
                postcode: "50169",
                country: "DE",
                latitude: 50.86708,
                longitude: 6.7516,
                address: "Alfred-Nobel-Straße 24",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "B",
            instructions: "",
            transport: {
                id: 9382401,
                uid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                shipper: {
                    pk: 1843996,
                    name: "OHRA REGALANLANGEN GMBH",
                },
                sequential_id: 9382401,
                status: "acknowledged",
                requested_vehicle: null,
                is_order: false,
                tags: [
                    {
                        pk: 8097,
                        name: "P-Herstal",
                    },
                ],
                instructions: "Tekeli, Musab\nTel.: 0032 89 - 869670\nMobil: 0499/375170",
                business_privacy: false,
                is_multiple_compartments: false,
                carrier_id: 1083715,
                deleted: null,
            },
            scheduled_range: {
                start: "2023-04-18T04:00:00Z",
                end: "2023-04-18T04:00:00Z",
            },
            estimated_distance_to_next_trip_activity: 111,
            estimated_driving_time_to_next_trip_activity: 6148,
            deliveries_from: [
                {
                    uid: "d45f33f4-3735-474d-bfa7-80190aa3c727",
                    sequential_id: 9390664,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            deliveries_to: [],
            cancelled_status: null,
        },
        {
            uid: "168128623016984SHcOKSY",
            category: "unloading",
            address: {
                id: 56678110,
                original: 56678031,
                name: "Constructiebedrijf Zutendaal NV",
                city: "Zutendaal",
                postcode: "3690",
                country: "BE",
                latitude: 50.9205,
                longitude: 5.54098,
                address: "Zevenputtenstraat 12",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-20T21:59:00.000Z",
                    start: "2023-04-19T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "",
            instructions: "",
            transport: {
                id: 9382401,
                uid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                shipper: {
                    pk: 1843996,
                    name: "OHRA REGALANLANGEN GMBH",
                },
                sequential_id: 9382401,
                status: "acknowledged",
                requested_vehicle: null,
                is_order: false,
                tags: [
                    {
                        pk: 8097,
                        name: "P-Herstal",
                    },
                ],
                instructions: "Tekeli, Musab\nTel.: 0032 89 - 869670\nMobil: 0499/375170",
                business_privacy: false,
                is_multiple_compartments: false,
                carrier_id: 1083715,
                deleted: null,
            },
            scheduled_range: {
                start: "2023-04-18T08:30:00Z",
                end: "2023-04-18T08:30:00Z",
            },
            estimated_distance_to_next_trip_activity: 40,
            estimated_driving_time_to_next_trip_activity: 2215,
            deliveries_from: [],
            deliveries_to: [
                {
                    uid: "d45f33f4-3735-474d-bfa7-80190aa3c727",
                    sequential_id: 9390664,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            cancelled_status: null,
        },
        {
            uid: "2115f329-e9c0-41af-89c6-1293409bb658",
            category: "breaking",
            address: {
                id: 56967230,
                original: 37468971,
                name: "Vincent Logistics SA (BE)",
                city: "Herstal",
                postcode: "4040",
                country: "BE",
                latitude: 50.69096618304828,
                longitude: 5.616931915283203,
                address: "Première Avenue, 32",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "",
            instructions: "",
            transport: {
                id: 9382203,
                uid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                shipper: {
                    pk: 1843996,
                    name: "OHRA REGALANLANGEN GMBH",
                },
                sequential_id: 9382203,
                status: "acknowledged",
                requested_vehicle: null,
                is_order: false,
                tags: [
                    {
                        pk: 8097,
                        name: "P-Herstal",
                    },
                ],
                instructions: "Tel.: 03 - 633.11.39",
                business_privacy: false,
                is_multiple_compartments: false,
                carrier_id: 1083715,
                deleted: null,
            },
            scheduled_range: {
                start: "2023-04-18T11:00:00Z",
                end: "2023-04-18T11:00:00Z",
            },
            estimated_distance_to_next_trip_activity: null,
            estimated_driving_time_to_next_trip_activity: null,
            deliveries_from: [],
            deliveries_to: [
                {
                    uid: "56c85414-86d4-48ac-9fd1-ec9dcd0c3b27",
                    sequential_id: 9390456,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            cancelled_status: null,
        },
    ];

    const result = getActivitiesWithFakeMergedActivitiesAdded(
        activities as unknown as TripActivity[] // the types are wrong...
    );

    expect(result).toStrictEqual([
        {
            address: {
                id: 56678109,
                original: 51646758,
                name: "OHRA REGALANLANGEN GMBH",
                city: "Kerpen",
                postcode: "50169",
                country: "DE",
                latitude: 50.86708,
                longitude: 6.7516,
                address: "Alfred-Nobel-Straße 24",
            },
            category: "loading",
            status: "created",
            fakeMerged: true,
            is_booking_needed: false,
            locked_requested_times: false,
            reference: "A ; B",
            real_start: null,
            real_end: null,
            scheduled_range: {
                start: "2023-04-18T04:00:00Z",
                end: "2023-04-18T04:00:00Z",
            },
            similarUids: ["168128571616984vpZAj3Q", "168128623016984sKmrzoI"],
            transports: [
                {
                    id: 9382203,
                    uid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382203,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tel.: 03 - 633.11.39",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
                {
                    id: 9382401,
                    uid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382401,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tekeli, Musab\nTel.: 0032 89 - 869670\nMobil: 0499/375170",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
            ],
            uid: "168128571616984vpZAj3Q/168128623016984sKmrzoI",
            estimated_distance_to_next_trip_activity: 111,
            estimated_driving_time_to_next_trip_activity: 6148,
            deliveries_from: [
                {
                    uid: "56c85414-86d4-48ac-9fd1-ec9dcd0c3b27",
                    sequential_id: 9390456,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                    transportUid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                    transportId: 9382203,
                },
                {
                    uid: "d45f33f4-3735-474d-bfa7-80190aa3c727",
                    sequential_id: 9390664,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                    transportUid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                    transportId: 9382401,
                },
            ],
            deliveries_to: [],
            slots: [
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                    transportUid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                    transportId: 9382203,
                },
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                    transportUid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                    transportId: 9382401,
                },
            ],
            cancelled_status: null,
        },
        {
            uid: "168128571616984vpZAj3Q",
            category: "loading",
            address: {
                id: 56677061,
                original: 51646758,
                name: "OHRA REGALANLANGEN GMBH",
                city: "Kerpen",
                postcode: "50169",
                country: "DE",
                latitude: 50.86708,
                longitude: 6.7516,
                address: "Alfred-Nobel-Straße 24",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "A",
            instructions: "",
            scheduled_range: {
                start: "2023-04-18T04:00:00Z",
                end: "2023-04-18T04:00:00Z",
            },
            estimated_distance_to_next_trip_activity: 0,
            estimated_driving_time_to_next_trip_activity: 0,
            deliveries_from: [
                {
                    uid: "56c85414-86d4-48ac-9fd1-ec9dcd0c3b27",
                    sequential_id: 9390456,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            deliveries_to: [],
            transports: [
                {
                    id: 9382203,
                    uid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382203,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tel.: 03 - 633.11.39",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
            ],
            similarUids: ["168128571616984vpZAj3Q", "168128623016984sKmrzoI"],
            fakeMerged: false,
            cancelled_status: null,
        },
        {
            uid: "168128623016984sKmrzoI",
            category: "loading",
            address: {
                id: 56678109,
                original: 51646758,
                name: "OHRA REGALANLANGEN GMBH",
                city: "Kerpen",
                postcode: "50169",
                country: "DE",
                latitude: 50.86708,
                longitude: 6.7516,
                address: "Alfred-Nobel-Straße 24",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-18T21:59:00.000Z",
                    start: "2023-04-17T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "B",
            instructions: "",
            scheduled_range: {
                start: "2023-04-18T04:00:00Z",
                end: "2023-04-18T04:00:00Z",
            },
            estimated_distance_to_next_trip_activity: 111,
            estimated_driving_time_to_next_trip_activity: 6148,
            deliveries_from: [
                {
                    uid: "d45f33f4-3735-474d-bfa7-80190aa3c727",
                    sequential_id: 9390664,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            deliveries_to: [],
            transports: [
                {
                    id: 9382401,
                    uid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382401,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tekeli, Musab\nTel.: 0032 89 - 869670\nMobil: 0499/375170",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
            ],
            similarUids: ["168128571616984vpZAj3Q", "168128623016984sKmrzoI"],
            fakeMerged: false,
            cancelled_status: null,
        },
        {
            uid: "168128623016984SHcOKSY",
            category: "unloading",
            address: {
                id: 56678110,
                original: 56678031,
                name: "Constructiebedrijf Zutendaal NV",
                city: "Zutendaal",
                postcode: "3690",
                country: "BE",
                latitude: 50.9205,
                longitude: 5.54098,
                address: "Zevenputtenstraat 12",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [
                {
                    end: "2023-04-20T21:59:00.000Z",
                    start: "2023-04-19T22:00:00.000Z",
                },
            ],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "",
            instructions: "",
            scheduled_range: {
                start: "2023-04-18T08:30:00Z",
                end: "2023-04-18T08:30:00Z",
            },
            estimated_distance_to_next_trip_activity: 40,
            estimated_driving_time_to_next_trip_activity: 2215,
            deliveries_from: [],
            deliveries_to: [
                {
                    uid: "d45f33f4-3735-474d-bfa7-80190aa3c727",
                    sequential_id: 9390664,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            transports: [
                {
                    id: 9382401,
                    uid: "9a8efb52-2b7b-47fc-bd49-64b3e6eca3e0",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382401,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tekeli, Musab\nTel.: 0032 89 - 869670\nMobil: 0499/375170",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
            ],
            similarUids: [],
            fakeMerged: false,
            cancelled_status: null,
        },
        {
            uid: "2115f329-e9c0-41af-89c6-1293409bb658",
            category: "breaking",
            address: {
                id: 56967230,
                original: 37468971,
                name: "Vincent Logistics SA (BE)",
                city: "Herstal",
                postcode: "4040",
                country: "BE",
                latitude: 50.69096618304828,
                longitude: 5.616931915283203,
                address: "Première Avenue, 32",
            },
            status: "created",
            real_start: null,
            real_end: null,
            slots: [],
            eta: null,
            eta_tracking: false,
            punctuality_status: "untracked",
            reference: "",
            instructions: "",
            scheduled_range: {
                start: "2023-04-18T11:00:00Z",
                end: "2023-04-18T11:00:00Z",
            },
            estimated_distance_to_next_trip_activity: null,
            estimated_driving_time_to_next_trip_activity: null,
            deliveries_from: [],
            deliveries_to: [
                {
                    uid: "56c85414-86d4-48ac-9fd1-ec9dcd0c3b27",
                    sequential_id: 9390456,
                    planned_loads: [],
                    origin_loads: [],
                    destination_loads: [],
                    multiple_rounds: false,
                },
            ],
            transports: [
                {
                    id: 9382203,
                    uid: "42a6c507-18c7-45f9-82e8-7726a61fe838",
                    shipper: {
                        pk: 1843996,
                        name: "OHRA REGALANLANGEN GMBH",
                    },
                    sequential_id: 9382203,
                    status: "acknowledged",
                    requested_vehicle: null,
                    is_order: false,
                    tags: [
                        {
                            pk: 8097,
                            name: "P-Herstal",
                        },
                    ],
                    instructions: "Tel.: 03 - 633.11.39",
                    business_privacy: false,
                    is_multiple_compartments: false,
                    carrier_id: 1083715,
                    deleted: null,
                },
            ],
            similarUids: [],
            fakeMerged: false,
            cancelled_status: null,
        },
    ]);
});

test("getActivityLoadSummary", () => {
    const load = {
        category: "pallets",
        description: "load A",
        quantity: 1,
        weight: 1,
        volume: 1,
        linear_meters: 1,
        remote_id: "",
        trucker_observations: "",
        tare_weight: null,
        steres: null,
        dangerous_goods_category: "",
        adr_un_code: "",
        legal_mentions: "",
        complementary_information: "",
        container_number: "",
        container_seal_number: "",
        temperature: "",
        idtf_number: "",
        identifiers_observations: "",
        identifiers: [],
        is_dangerous: false,
        refrigerated: false,
        use_identifiers: false,
        volume_display_unit: "m3",
    };
    const activityWithPlannedLoad = {
        category: "loading",
        deliveries_from: [
            {
                planned_loads: [load, load],
                origin_loads: [],
                destination_loads: [],
            },
        ],
        deliveries_to: [],
    } as unknown as SimilarActivity;
    expect(getActivityLoadSummary(activityWithPlannedLoad, t)).toBe("2 palettes / 2 kg 2 m³ 2 ml");

    const loadingActivityWithActualLoad = {
        category: "loading",
        deliveries_from: [
            {
                planned_loads: [],
                origin_loads: [load],
                destination_loads: [],
            },
        ],
        deliveries_to: [],
    } as unknown as SimilarActivity;
    expect(getActivityLoadSummary(loadingActivityWithActualLoad, t)).toBe(
        "1 palette, load A / 1 kg 1 m³ 1 ml"
    );

    const unloadingActivityWithActualLoad = {
        category: "unloading",
        deliveries_from: [],
        deliveries_to: [
            {
                planned_loads: [],
                origin_loads: [],
                destination_loads: [load],
            },
        ],
    } as unknown as SimilarActivity;
    expect(getActivityLoadSummary(unloadingActivityWithActualLoad, t)).toBe(
        "1 palette, load A / 1 kg 1 m³ 1 ml"
    );
    const breakingActivityWithActualLoad = {
        category: "breaking",
        deliveries_from: [],
        deliveries_to: [
            {
                planned_loads: [],
                origin_loads: [load],
                destination_loads: [],
            },
            {
                planned_loads: [],
                origin_loads: [load],
                destination_loads: [load],
            },
        ],
    } as unknown as SimilarActivity;
    expect(getActivityLoadSummary(breakingActivityWithActualLoad, t)).toBe(
        "2 palettes / 2 kg 2 m³ 2 ml"
    );

    const resumingActivityWithActualLoad = {
        category: "resuming",
        deliveries_from: [
            {
                planned_loads: [],
                origin_loads: [load],
                destination_loads: [],
            },
        ],
        deliveries_to: [],
    } as unknown as SimilarActivity;
    expect(getActivityLoadSummary(resumingActivityWithActualLoad, t)).toBe(
        "1 palette, load A / 1 kg 1 m³ 1 ml"
    );
});

describe("canAddBreak", () => {
    const createActivity = (
        category: string,
        transportId: number
    ): SimilarActivityWithTransportData =>
        ({
            uid: `${category}-${transportId}`,
            category,
            transports: [{id: transportId}],
        }) as SimilarActivityWithTransportData;

    test("break could be added between activities of the same transport", () => {
        const activities = [
            createActivity("loading", 1),
            createActivity("unloading", 1),
            createActivity("loading", 1),
            createActivity("unloading", 1),
        ];

        expect(canAddBreak(activities, 0)).toBe(true);
        expect(canAddBreak(activities, 1)).toBe(true);
        expect(canAddBreak(activities, 2)).toBe(true);
    });

    test("break cannot be added after the last activity", () => {
        const activities = [createActivity("loading", 1), createActivity("unloading", 1)];

        expect(canAddBreak(activities, 1)).toBe(false);
    });

    test("break cannot be added between activities of different transports", () => {
        const activities = [
            createActivity("loading", 1),
            createActivity("unloading", 1),
            createActivity("loading", 2),
            createActivity("unloading", 2),
        ];

        expect(canAddBreak(activities, 1)).toBe(false);
    });
});
