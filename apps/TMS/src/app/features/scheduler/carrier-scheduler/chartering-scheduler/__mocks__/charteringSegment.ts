import {t} from "@dashdoc/web-core";

import {RawCarrierCharteringSchedulerSegment} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/chartering-scheduler-grid/chartering-scheduler.types";

export function getFakeCharteringSegment(): RawCarrierCharteringSchedulerSegment {
    return {
        uid: "fake-card-uid",
        created: "2022-06-03T12:00:00Z",
        transport: {
            uid: "12345",
            shipper: {
                name: t("scheduler.cardSettings.shipper_name"),
            },
            is_order: false,
            status: "on_unloading_site",
            sequential_id: 1234,
            requested_vehicle: {
                group_view_id: 1,
                uid: "12345",
                label: "fake label",
                complementary_information: "fake complementary_information",
                emission_rate: 0.086,
                generic_emission_rate_uid: null,
                default_for_carbon_footprint: false,
            },
            tags: [
                {
                    pk: 1,
                    name: t("common.tag") + " 1",
                    color: "#4B71FA",
                },
                {
                    pk: 2,
                    name: t("common.tag") + " 2",
                    color: "#8FD458",
                },
                {
                    pk: 3,
                    name: t("common.tag") + " 3",
                    color: "#F0619D",
                },
                {
                    pk: 4,
                    name: t("common.tag") + " 4",
                    color: "#E54D45",
                },
            ],
            instructions: t("transportForm.globalInstructionsTitle"),
        },
        scheduler_datetime_range: {start: "2022-06-03T08:00:00Z", end: "2022-06-03T14:00:00Z"},
        origin: {
            uid: "origin-id",
            address: {
                pk: 1,
                original: 2,
                name: "origin name",
                address: "origin address",
                city: "Nantes",
                postcode: "44000",
                country: "FR",
            },
            real_start: "2022-06-03T08:00:00Z",
            real_end: "2022-06-03T08:00:00Z",
            slots: [{start: "2022-06-03T08:00:00Z", end: "2022-06-03T08:00:00Z"}],
            eta: "",
            eta_tracking: false,
            punctuality_status: "untracked",
            category: "loading",
            deliveries_from: [],
            deliveries_to: [],
        },
        destination: {
            uid: "destination-id",
            address: {
                pk: 1,
                original: 2,
                name: "destination 1 name",
                address: "destination 1 address",
                city: "Brest",
                postcode: "29200",
                country: "FR",
            },
            real_start: "2022-06-03T09:00:00Z",
            real_end: null,
            slots: [{start: "2022-06-03T09:00:00Z", end: "2022-06-03T09:00:00Z"}],
            eta: "",
            eta_tracking: false,
            punctuality_status: "untracked",
            deliveries_from: [],
            deliveries_to: [],
            category: "unloading",
        },
        status: "on_unloading_site",
    };
}
