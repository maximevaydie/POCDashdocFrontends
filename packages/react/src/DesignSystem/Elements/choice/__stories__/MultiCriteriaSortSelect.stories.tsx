import {Meta, Story} from "@storybook/react/types-6-0";
import {Flex} from "layout";
import React, {useState} from "react";

import {
    MultiCriteriaSortSelector as MultiCriteriaSortSelectorComponent,
    SortValue,
} from "../MultiCriteriaSortSelector";

type Criterion = "criterion_1" | "criterion_2" | "criterion_3" | "criterion_4";

export default {
    title: "Web UI/choice/MultiCriteriaSortSelector",
    component: MultiCriteriaSortSelectorComponent,
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story = () => {
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState<SortValue<Criterion>>({
        order: "asc",
        criterion: "criterion_1",
    });

    const sortingCriteria: Array<{
        value: Criterion;
        label: string;
    }> = [
        {
            value: "criterion_1",
            label: "Criterion 1",
        },
        {
            value: "criterion_2",
            label: "Criterion 2",
        },
        {
            value: "criterion_3",
            label: "Criterion 3",
        },
        {
            value: "criterion_4",
            label: "Criterion 4",
        },
    ];

    return (
        <>
            <Flex onClick={() => setSelectorOpen(!selectorOpen)} flexDirection="column">
                <MultiCriteriaSortSelectorComponent<
                    "criterion_1" | "criterion_2" | "criterion_3" | "criterion_4"
                >
                    value={currentValue}
                    criteriaOptions={sortingCriteria}
                    onChange={(newValue) => setCurrentValue({...currentValue, ...newValue})}
                    label={`${currentValue.criterion} - ${currentValue.order}`}
                />
            </Flex>
        </>
    );
};

export const MultiCriteriaSortSelector = Template.bind({});
