import React from "react";

import {withFlowReduxStore} from "../../../__stories__/decorators";
import {baseState, site, zones} from "../__stories__/storyFixtures";

import {SettingsZone} from "./SettingsZone";

export default {
    title: "flow/features/settings/SettingsZoneSetupTab",
    component: SettingsZone,
};

export const NoZone = () => (
    <div style={{height: "90vh", width: "90vw"}}>
        <SettingsZone site={site} zones={[]} />
    </div>
);
NoZone.decorators = [withFlowReduxStore({...baseState})];

export const OneZone = () => (
    <div style={{height: "90vh", width: "90vw"}}>
        <SettingsZone site={site} zones={[zones[1]]} />
    </div>
);

export const SeveralZones = () => (
    <div style={{height: "90vh", width: "90vw"}}>
        <SettingsZone site={site} zones={zones} />
    </div>
);
