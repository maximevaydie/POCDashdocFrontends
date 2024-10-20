import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {FilteringHeader as FilteringHeaderComponent} from "features/filters/badges-and-selectors/generic/FilteringSelectorHeader";

export default {
    title: "app/features/filters",
    component: FilteringHeaderComponent,
    args: {
        dataTypeLabel: "Data label",
        conditionLabel: "Condition label",
    },
} as Meta;

const Template: Story<{dataTypeLabel: string; conditionLabel: string}> = ({
    dataTypeLabel,
    conditionLabel,
}) => {
    return (
        <Box width="300px">
            <FilteringHeaderComponent
                dataTypeLabel={dataTypeLabel}
                conditionLabel={conditionLabel}
            />
        </Box>
    );
};

export const FilteringHeader = Template.bind({});
