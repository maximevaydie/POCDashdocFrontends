import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {carrierCards} from "../../../__mocks__/carrierCards";
import {pricingDetailsArray} from "../../../__mocks__/pricingDetails";

import {CarrierOfferPickerProps, CarrierOfferPicker as Component} from "./CarrierOfferPicker";

const Template: Story<CarrierOfferPickerProps> = (args) => (
    <>
        <Box width="900px">
            <Component {...args} />
        </Box>

        <Box width="700px">
            <Component {...args} />
        </Box>
    </>
);
export const CarrierOfferPicker = Template.bind({});

export default {
    title: "app/features/shipper/carrier-offer",
    component: Component,
    args: {
        count: 4,
        offers: carrierCards.map((carrierCard, i) => ({
            ...carrierCard,
            ...pricingDetailsArray[i],
        })),
        onSelectOffer: (id: number) => alert(`Offer '${id}' selected`),
        onSelectAnotherCarrier: () => alert(`Display another UX`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
