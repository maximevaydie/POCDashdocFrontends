import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {carrierCards} from "../../../__mocks__/carrierCards";
import {pricingDetailsArray} from "../../../__mocks__/pricingDetails";
import {
    CarrierOfferRequestedProps,
    CarrierOfferRequested as Component,
} from "../CarrierOfferRequested";

export default {
    title: "app/features/shipper/carrier-offer",
    component: Component,
    args: {
        date: "12/05/2022",
        hours: "12h01",
        carrierCard: carrierCards[0],
        pricingDetails: pricingDetailsArray[0],
        onAbortRequest: () => alert(`Aborted`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<CarrierOfferRequestedProps> = (args) => (
    <>
        <Box width="900px">
            <Component {...args} />
        </Box>
        <Box width="700px">
            <Component {...args} />
        </Box>
    </>
);
export const CarrierOfferRequested = Template.bind({});

const TemplateWithoutOffer: Story<CarrierOfferRequestedProps> = (args) => {
    const props = {...args, pricingDetails: null};
    return (
        <>
            <Box width="900px">
                <Component {...props} />
            </Box>
            <Box width="700px">
                <Component {...props} />
            </Box>
        </>
    );
};
export const CarrierRequestedWithoutOffer = TemplateWithoutOffer.bind({});
