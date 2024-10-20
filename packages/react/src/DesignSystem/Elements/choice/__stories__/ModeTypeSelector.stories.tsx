import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {Text} from "../../base/Text";
import {Box} from "../../layout/Box";
import {ModeDescription, ModeTypeSelector} from "../ModeTypeSelector";

export default {
    title: "Web UI/choice/ModeTypeSelector",
    component: ModeTypeSelector,
    args: {},
    argTypes: {
        disabled: {control: "boolean"},
    },
    decorators: [
        (Story) => (
            <>
                <Box width={500}>
                    <Story />
                </Box>
                <Text mt={4}>
                    <i>
                        See all available props on{" "}
                        <a href="https://react-select.com/props" target="_blank" rel="noreferrer">
                            https://react-select.com/props
                        </a>
                    </i>
                </Text>
            </>
        ),
    ],
} as Meta;

type ModeType = "manual" | "offers" | "rfq";

export const DefaultComponent: Story<any> = (args) => {
    const [currentMode, setCurrentMode] = React.useState<ModeType>("manual");
    const modeList: ModeDescription<ModeType>[] = [
        {
            value: "manual",
            label: "Mode #1",
            icon: "select",
        },
        {
            value: "offers",
            label: "Mode #2",
            icon: "star",
        },
        {
            value: "rfq",
            label: "Mode #3",
            icon: "requestForQuotations",
        },
    ];
    return (
        <ModeTypeSelector<ModeType>
            {...args}
            modeList={modeList}
            currentMode={currentMode}
            setCurrentMode={setCurrentMode}
        />
    );
};
DefaultComponent.storyName = "Default";
