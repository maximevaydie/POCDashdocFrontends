import {Flex, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";

import {Box} from "../../../layout/Box";
import {BrickPicker as BrickPickerComponent, BrickPickerProps} from "../BrickPicker";
import {ABrick} from "../components/ABrick";
import {defaultBrickStyles} from "../default";
import {BrickLine} from "../types";

import {lines} from "./mock";

export default {
    title: "Web UI/picker/BrickPicker",
    component: BrickPickerComponent,
    args: {
        lines,
    },
    backgrounds: {default: "white"},
    layout: "fullscreen",
    decorators: [
        (Story) => (
            <Box width={"800px"} backgroundColor="white">
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story<BrickPickerProps> = ({lines: defaultLines, ...args}) => {
    const [lines, setLines] = useState<BrickLine[]>(defaultLines);

    return (
        <Box>
            <Flex
                style={{
                    display: "grid",
                    gridTemplateColumns: `1fr 70px 70px`,
                    gap: "10px",
                }}
                width="300px"
                alignItems="end"
                justifyContent="end"
                mb={6}
            >
                <Box />
                <Text>Normal</Text>
                <Text>Hover</Text>
                {/**/}
                <Text>Full selected</Text>
                <ABrick key={1} {...defaultBrickStyles.fullSelected} />
                <ABrick key={"1_1"} {...defaultBrickStyles.fullSelected} forceHover />
                {/**/}
                <Text>Empty selected</Text>
                <ABrick key={2} {...defaultBrickStyles.emptySelected} />
                <ABrick key={"2_2"} {...defaultBrickStyles.emptySelected} forceHover />
                {/**/}
                <Text>Empty</Text>
                <ABrick key={3} {...defaultBrickStyles.empty} />
                <ABrick key={"3_3"} {...defaultBrickStyles.empty} forceHover />
                {/**/}
                <Text>Full</Text>
                <ABrick key={4} {...defaultBrickStyles.full} />
                <ABrick key={"4_4"} {...defaultBrickStyles.full} forceHover />
            </Flex>
            <BrickPickerComponent
                {...args}
                lines={lines}
                onChange={(newLines) => {
                    setLines(newLines);
                }}
            />
        </Box>
    );
};
export const BrickPicker = Template.bind({});
