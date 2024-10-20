import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {CarrierAssignationRule} from "dashdoc-utils";
import React from "react";

import {
    CarrierAssignationRuleModalProps,
    CarrierAssignationRuleModal as Component,
} from "./CarrierAssignationRuleModal";

export default {
    title: "app/features/shipper/carrier-assignation-rule",
    component: Component,
    args: {
        isSubmitting: false,
        onSubmit: () => alert(`onSubmit`),
        onClose: () => alert(`onClose`),
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<CarrierAssignationRuleModalProps> = (args) => (
    <Box width="900px">
        <Component {...args} />
    </Box>
);
export const Create = Template.bind({});

const TemplateLoading: Story<CarrierAssignationRuleModalProps> = (args) => {
    return (
        <Box width="900px">
            <Component {...args} isSubmitting={true} />
        </Box>
    );
};
export const Loading = TemplateLoading.bind({});

const TemplateEdit: Story<CarrierAssignationRuleModalProps> = (args) => {
    const entity: CarrierAssignationRule = {
        id: 0,
        name: "MyRule",
        type: "simple",
        active: true,
        origin_area: {
            name: "Nantes, Rennes",
            places: [
                {city: "Nantes", country: "FR"},

                {city: "Rennes", country: "FR"},
            ],
        },
        destination_area: {
            name: "56",
            places: [{postcode_prefix: "56", country: "FR"}],
        },
        requested_vehicle: {
            uid: "",
            label: "tank",
            complementary_information: "",
            emission_rate: 0.08,
            generic_emission_rate_uid: null,
            group_view_id: 0,
            default_for_carbon_footprint: false,
        },
        carrier: {
            pk: 2,
            name: "Chuck",
            siren: "",
            country: "FR",
            account_type: "subscribed",
            notes: "",
        },
        carrier_contacts: [],
    };
    return (
        <Box width="900px">
            <Component {...args} entity={entity} />
        </Box>
    );
};
export const Edit = TemplateEdit.bind({});
