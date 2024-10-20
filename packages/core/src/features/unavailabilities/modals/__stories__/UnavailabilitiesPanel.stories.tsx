import {DeviceContext, Flex} from "@dashdoc/web-ui";
import {Story} from "@storybook/react/types-6-0";
import {baseState} from "features/settings/__stories__/storyFixtures";
import React from "react";
import {tz} from "services/date";

import {withFlowReduxStore} from "../../../../__stories__/decorators";
import {
    UnavailabilitiesPanel as Component,
    UnavailabilitiesFloatingPanelProps,
} from "../UnavailabilitiesPanel";

import {allDay, status, zone} from "./storyFixtures";

export default {
    title: "flow/features",
    component: Component,
    args: {
        mode: "desktop",
        title: "Title",
        onClose: () => alert("close"),
        onSubmit: () => alert("submit"),
        zone,
        date: tz.convert("2023-12-05T23:00:00Z", "Europe/Paris"),
        status,
    },
    argTypes: {
        mode: {
            options: ["desktop", "mobile"],
            defaultValue: "desktop",
            control: {
                type: "select",
            },
        },
    },

    decorators: [
        withFlowReduxStore({
            ...baseState,
        }),
    ],
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
};

const Template: Story<UnavailabilitiesFloatingPanelProps & {mode: "desktop" | "mobile"}> = ({
    mode,
    ...props
}) => (
    <DeviceContext.Provider value={mode}>
        <Flex>
            <Component {...props} />
        </Flex>
    </DeviceContext.Provider>
);

export const UpdateUnavailabilities = Template.bind({});

const TemplateUpdateUnavailabilitiesAllDay: Story<
    UnavailabilitiesFloatingPanelProps & {mode: "desktop" | "mobile"}
> = ({mode, ...props}) => (
    <DeviceContext.Provider value={mode}>
        <Flex>
            <Component {...props} status={{...status, unavailabilities: [allDay]}} />
        </Flex>
    </DeviceContext.Provider>
);
export const UpdateUnavailabilitiesAllDay = TemplateUpdateUnavailabilitiesAllDay.bind({});

const Template2: Story<UnavailabilitiesFloatingPanelProps & {mode: "desktop" | "mobile"}> = ({
    mode,
    ...props
}) => (
    <DeviceContext.Provider value={mode}>
        <Component {...props} status={{...status, unavailabilities: []}} />
    </DeviceContext.Provider>
);

export const CreateUnavailabilities = Template2.bind({});
