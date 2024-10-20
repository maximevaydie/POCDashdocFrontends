import {add} from "date-fns";
import React from "react";

import {withReduxStore} from "../../../../../../../.storybook/decorators";
import EtaTracking from "../eta-tracking";

import type {Site} from "app/types/transport";

export default {
    title: "app/features/eta/ETA tracking",
    decorators: [withReduxStore()],
};

const site: Site = {
    uid: "5fc1abfa-4a63-11e8-ba91-9801a7a7de4f",
    address: {
        pk: 112871,
        address: "Avenue Bernard de Jussieu",
        city: "Serris",
        postcode: "77700",
        country: "FR",
        company: {
            pk: 92247,
            name: "Auchan",
            settings_logo: null,
            country: "FR",
        },
        latitude: 48.8369793,
        longitude: 2.7822804,
        radius: null,
        created_by: -1,
        coords_validated: false,
    },
    category: "loading",
    signature_process: "skippable_electronic_signature",
    loading_instructions: "",
    unloading_instructions: "",
    instructions: "",
    reference: "origin reference",
    eta: null,
    eta_tracking: false,
    punctuality_status: "untracked",
    slots: [],
    locked_requested_times: false,
    is_booking_needed: false,
    supports_exchanges: [],
    real_start: null,
    real_end: null,
    manual_emission_value: null,
    is_cancelled: false,
};

const twoHoursInTheFuture = add(new Date(), {minutes: 100}).toISOString();
const yesterday = add(new Date(), {days: -1}).toISOString();

export const WhenThereIsEATTrackingAndETA = () => (
    <EtaTracking
        site={{
            ...site,
            eta_tracking: true,
            eta: twoHoursInTheFuture,
            punctuality_status: "probably_late",
        }}
    />
);

export const WhenThereIsEATTrackingButNoETA = () => (
    <EtaTracking site={{...site, eta_tracking: true}} />
);

export const WhenThereIsNoETATracking = () => (
    <EtaTracking site={{...site, eta_tracking: false}} />
);

export const WhenThereIsEATTrackingAndETAInThePast = () => (
    <EtaTracking site={{...site, eta_tracking: true, eta: yesterday}} />
);
