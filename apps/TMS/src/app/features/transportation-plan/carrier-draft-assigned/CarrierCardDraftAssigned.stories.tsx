import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {carrierCards} from "../__mocks__/carrierCards";
import {pricingDetailsArray} from "../__mocks__/pricingDetails";

import {
    CarrierCardDraftAssigned as Component,
    CarrierDraftAssignedProps,
} from "./CarrierCardDraftAssigned";

export default {
    title: "app/features/shipper/carrier-draft-assigned",
    component: Component,
    args: {
        date: "12/05/2022 à 12h01",
        carrierCard: carrierCards[0],
        pricingDetails: pricingDetailsArray[0],
        rule: {id: 1, name: "rule name"},
        onConfirmAssigned: () => alert(`Confirmed`),
        onSelectAutomation: () => alert(`Automation behavior`),
        onSelectAnotherCarrier: () => alert(`Display another UX`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<CarrierDraftAssignedProps> = (args) => (
    <>
        <Box width="900px">
            <Component {...args} />
        </Box>
        <Box width="700px">
            <Component {...args} />
        </Box>
    </>
);
export const CarrierCardDraftAssigned = Template.bind({});

const TemplateWithoutOffer: Story<CarrierDraftAssignedProps> = (args) => {
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
export const CarrierCardDraftAssignedWithoutOffer = TemplateWithoutOffer.bind({});
