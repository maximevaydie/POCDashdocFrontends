import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {quotationRequest} from "../../../__mocks__/quotationRequest";
import {QuotationSelector as Component, QuotationSelectorProps} from "../QuotationSelector";

export default {
    title: "app/features/pricing/rfq",
    component: Component,
    args: {
        quotationRequest: quotationRequest,
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<QuotationSelectorProps> = (args) => (
    <>
        <Box width="900px">
            <Component {...args} />
        </Box>
        <Box width="700px" mt={6}>
            <Component {...args} />
        </Box>
    </>
);
export const QuotationSelector = Template.bind({});
