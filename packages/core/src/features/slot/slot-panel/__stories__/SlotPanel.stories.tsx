import {Box, Flex, Text} from "@dashdoc/web-ui";
import {Story} from "@storybook/react/types-6-0";
import {baseState} from "features/settings/__stories__/storyFixtures";
import React from "react";
import {SlotState} from "types";

import {withFlowReduxStore} from "../../../../__stories__/decorators";
import {SlotPanel as SlotPanelComponent, SlotPanelProps} from "../SlotPanel";

import {site, slot, slotEvents} from "./storyFixtures";

export default {
    title: "flow/features",
    component: SlotPanelComponent,
    args: {
        slot,
        site,
        slotEvents,
        profile: "siteManager",
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

const Template: Story<SlotPanelProps> = (props) => (
    <Flex overflow="auto" height="100vh" backgroundColor="grey.light" p={4} style={{gap: "10px"}}>
        {["planned", "arrived", "completed", "cancelled", "late"].map((state: SlotState) => (
            <Box key={state} flexShrink={0} flexBasis="400px">
                <Flex flexDirection="column" height="750px">
                    <Text textAlign="center" mx={4}>
                        {`state: ${state}`}
                    </Text>
                    <Flex flexDirection="column" flexGrow={1} backgroundColor="grey.white">
                        <SlotPanelComponent
                            site={{...props.site}}
                            slot={{...props.slot, state: state}}
                            zone={{...props.zone}}
                            slotEvents={state === "planned" ? null : props.slotEvents}
                            profile={props.profile}
                            timezone="Europe/Paris"
                        />
                    </Flex>
                </Flex>
            </Box>
        ))}
        <Box key={"deleted"} flexShrink={0} flexBasis="400px">
            <Flex flexDirection="column" height="750px">
                <Text textAlign="center" mx={4}>
                    {`state: deleted`}
                </Text>
            </Flex>
        </Box>
    </Flex>
);

export const SlotPanel = Template.bind({});
