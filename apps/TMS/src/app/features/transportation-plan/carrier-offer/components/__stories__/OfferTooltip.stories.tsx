import {Flex} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {pricingDetailsArray} from "../../../__mocks__/pricingDetails";
import {OfferTooltip as Component, OfferTooltipProps} from "../OfferTooltip";

const TooltipTemplate: Story<{pricingDetailsArray: OfferTooltipProps[]}> = (args) => {
    return (
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "50px"}}>
            {args.pricingDetailsArray.map((pricingDetails, i) => (
                <Flex key={i} mb={5} backgroundColor="white">
                    <Component {...pricingDetails} />
                </Flex>
            ))}
        </div>
    );
};
export const OfferTooltip = TooltipTemplate.bind({});

export default {
    title: "app/features/shipper/carrier-offer",
    component: Component,
    args: {
        pricingDetailsArray,
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
