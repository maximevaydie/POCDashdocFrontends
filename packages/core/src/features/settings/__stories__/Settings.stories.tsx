import React from "react";

import {withFlowReduxStore} from "../../../__stories__/decorators";
import {Settings} from "../Settings";

import {baseState, zones} from "./storyFixtures";

export default {
    title: "flow/features/Settings",
    component: Settings,
};

export const Default = () => (
    <div style={{height: "90vh", width: "90vw"}}>
        <Settings slug="test" />
    </div>
);
Default.decorators = [
    withFlowReduxStore({
        ...baseState,
        flow: {
            ...baseState.flow,
            zone: {
                ...baseState.flow.zone,
                entities: {
                    [zones[0].id]: zones[0],
                    [zones[1].id]: zones[1],
                    [zones[2].id]: zones[2],
                },
            },
        },
    }),
];
