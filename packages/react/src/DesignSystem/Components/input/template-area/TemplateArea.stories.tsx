import {Box, Button, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useRef, useState} from "react";

import {TemplateArea as TemplateAreaComponent, applyTemplate} from ".";

export default {
    title: "Web UI/Input/TemplateArea",
    component: TemplateAreaComponent,
    args: {
        variableList: [
            {id: "weight", label: "Weight"},
            {id: "date", label: "Date"},
            {id: "price", label: "Price"},
            {id: "unit-price", label: "Unit Price"},
        ],
        initialValue: "On [[date]]:\nThe price is: ([[weight]] x [[unit-price]]) = [[price]]€",
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<any> = (args) => {
    const [template, setTemplate] = useState(args.initialValue);
    const templateAreaRef = useRef<{addVariable: (variableId: string) => void}>();
    const variableAssignment: Record<string, number | string> = {
        date: "2023-12-25",
        weight: 38.6,
        "unit-price": 75.8,
        price: 2925.88,
    };
    return (
        <Box width={"700px"}>
            <TemplateAreaComponent
                id={0}
                ref={templateAreaRef}
                {...args}
                onChange={(value) => {
                    setTemplate(value);
                }}
            />
            <Box mt={3}>
                <Text variant="h1" mb={2}>
                    {"Raw template:"}
                </Text>
                <Text>{template}</Text>
                <Text variant="h1" mt={3} mb={2}>
                    {"Applied template:"}
                </Text>
                <Text>{applyTemplate(template, variableAssignment)}</Text>
                <Text variant="h1" mt={3}>
                    {"Custom variable list"}
                </Text>
                <Text mb={2}>
                    {
                        "You can trigger adding variables from outside the component, allowing you to create a custom variable list."
                    }
                </Text>
                <Button
                    onClick={() => {
                        // @ts-ignore
                        templateAreaRef.current.addVariable("weight");
                    }}
                >
                    Add Weight Tag
                </Button>
            </Box>
        </Box>
    );
};

export const TemplateArea = Template.bind({});
