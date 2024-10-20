import {t} from "@dashdoc/web-core";
import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {VehicleTypePicker as Component, VehicleTypePickerProps} from "./VehicleTypePicker";

const Template: Story<VehicleTypePickerProps> = (args) => (
    <Box width="900px">
        <Component {...args} />
    </Box>
);
export const VehicleTypePicker = Template.bind({});
export default {
    title: "Web UI/picker/VehicleTypePicker",
    component: Component,
    args: {
        label: t("shipper.selectVehicleType"),
        vehicleTypes: [
            {value: "tank", label: "Citerne"},
            {value: "tautliner", label: "Tautliner"},
            {value: "tank", label: "Citerne"},
            {value: "tautliner", label: "Tautliner"},
            {value: "tank", label: "Citerne"},
            {value: "tank", label: "Citerne"},
        ],
        onSelectVehicleType: (vehicleType: string) =>
            alert(`Vehicle type '${vehicleType}' selected`),
        onSelectAnotherCarrier: () => alert(`Display another UX`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
