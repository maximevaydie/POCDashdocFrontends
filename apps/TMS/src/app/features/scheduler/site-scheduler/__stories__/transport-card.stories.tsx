import React from "react";

import SiteSchedulerCard from "../site-scheduler-card";
import {SiteSchedulerSharedActivity} from "../types";

export default {
    title: "app/features/scheduler/Site Scheduler/Transport card",
};

const sharedActivity: SiteSchedulerSharedActivity = {
    id: 1531,
    activities: [
        {
            id: 1531,
            uid: "16444195132k3KRbXI",
            status: "activity_done",
            category: "loading",
            address: {
                pk: 3435,
                original: 666,
                name: "Laine",
                city: "Gaillard",
                postcode: "13250",
                country: "FR",
            },
            real_start: "2022-02-09T21:56:00Z",
            real_end: "2022-02-09T21:56:00.000001Z",
            slots: [],
            // @ts-ignore
            eta: null,
            transport: {
                id: 742,
                uid: "35252926-584e-4560-aa04-43daf1ee29fc",
                status: "done",
                carrier: 1,
                carrier_address: {
                    name: "guimauve Carrier",
                    country: "FR",
                },
                shipper: 5,
            },
            eta_tracking: false,
            punctuality_status: "on_time",
            deliveries_from: [
                {
                    uid: "04104a90-e89b-40b7-8596-cdb815b31987",
                    sequential_id: 750,
                    origin: {
                        address: {
                            pk: 3435,
                            original: 666,
                            name: "Laine",
                            city: "Gaillard",
                            postcode: "13250",
                            country: "FR",
                        },
                    },
                    destination: {
                        address: {
                            pk: 3438,
                            original: 807,
                            name: "Legrand Diallo S.A.",
                            city: "Gomez-les-Bains",
                            postcode: "44377",
                            country: "FR",
                        },
                    },
                    planned_loads: [
                        {
                            uid: "7ede11e8-031f-47e9-8da3-dffca3117846",
                            description: "Trucs",
                            category: "pallets",
                        },
                    ],
                },
            ],
            deliveries_to: [],
        },
    ],
    status: "activity_done",
};

export const Default = () => (
    <SiteSchedulerCard
        onCardSelected={() => {
            alert("Click!");
        }}
        siteActivity={sharedActivity}
        isFiltered={false}
    />
);
