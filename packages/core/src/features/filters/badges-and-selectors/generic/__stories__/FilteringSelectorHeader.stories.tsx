import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";

import {FilteringSelectorHeader as FilteringSelectorHeaderComponent} from "features/filters/badges-and-selectors/generic/FilteringSelectorHeader";

export default {
    title: "app/features/filters",
    component: FilteringSelectorHeaderComponent,
} as Meta;

const Template: Story = () => {
    const [dataType, setDataType] = useState<string>("loading");
    const [condition, setCondition] = useState<string>("__in");

    return (
        <Box width="300px">
            <FilteringSelectorHeaderComponent
                dataType={{
                    label: "Type de site",
                    options: [
                        {label: "Enlèvement", headerLabel: "Site d'enlèvement", id: "loading"},
                        {label: "Livraison", id: "unloading"},
                    ],
                    value: dataType,
                    onChange: setDataType,
                }}
                condition={{
                    options: [
                        {label: t("filter.in"), id: "__in"},
                        {label: t("filter.notIn"), id: "___not_in"},
                    ],
                    value: condition,
                    onChange: setCondition,
                }}
            />
        </Box>
    );
};

export const FilteringSelectorHeader = Template.bind({});
