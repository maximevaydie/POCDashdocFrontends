import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";
import cloneDeep from "rfdc/default";

import {withReduxStore} from "../../../../../../.storybook/decorators";
import {carrierAndShipperProps, carrierProps, shipperProps} from "../__mocks__/props";
import {PricesModal as Component, PricesModalProps} from "../PricesModal";

export default {
    title: "app/features/pricing/PricesModal",
    component: Component,
    parameters: {
        backgrounds: {default: "white"},
    },
    args: {
        shipperFinalPrice: true,
        invoicedPrice: true,
        requiresAcceptance: true,
    },
    argTypes: {
        shipperFinalPrice: {
            defaultValue: true,
            control: {
                type: "boolean",
            },
        },
        invoicedPrice: {
            defaultValue: true,
            control: {
                type: "boolean",
            },
        },
        requiresAcceptance: {
            defaultValue: true,
            control: {
                type: "boolean",
            },
        },
    },
    decorators: [
        withReduxStore({
            account: {
                featureFlags: {
                    carrierAndShipperPrice: true,
                    shipperFinalPrice: true,
                    "invoice-entity": true,
                    dashdocInvoicing: true,
                    customerToInvoice: true,
                },
            },
        }),
    ],
} as Meta;

function purgeProps(props: PricesModalProps, templateProps: TemplateProps) {
    const result = cloneDeep(props);
    if (!templateProps.invoicedPrice) {
        result.invoicedPrice = null;
    }
    if (!templateProps.shipperFinalPrice) {
        result.shipperFinalPrice = null;
    }
    if (templateProps.requiresAcceptance) {
        result.transport.requires_acceptance = true;
    }
    return result;
}

type TemplateProps = {
    invoicedPrice: boolean;
    shipperFinalPrice: boolean;
    requiresAcceptance: boolean;
};

const AsCarrierTemplate: Story<TemplateProps> = (props: TemplateProps) => (
    <Component
        key={`${props.shipperFinalPrice}_${props.invoicedPrice}_${props.requiresAcceptance}`}
        {...purgeProps(carrierProps, props)}
    />
);
export const AsCarrier = AsCarrierTemplate.bind({});

const AsShipperTemplate: Story<TemplateProps> = (props: TemplateProps) => (
    <Component
        key={`${props.shipperFinalPrice}_${props.invoicedPrice}_${props.requiresAcceptance}`}
        {...purgeProps(shipperProps, props)}
    />
);
export const AsShipper = AsShipperTemplate.bind({});

const AsCarrierAndShipperTemplate: Story<TemplateProps> = (props: TemplateProps) => (
    <Component
        key={`${props.shipperFinalPrice}_${props.invoicedPrice}_${props.requiresAcceptance}`}
        {...purgeProps(carrierAndShipperProps, props)}
    />
);
export const AsCarrierAndShipper = AsCarrierAndShipperTemplate.bind({});
