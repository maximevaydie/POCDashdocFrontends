import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {NetworkMapPopUp} from "../NetworkMapPopup";

const Template: Story = (args) => (
    <>
        <Box>
            <NetworkMapPopUp directoryCompany={args.company} open={args.popUpOpen} />
        </Box>
    </>
);
export const NetworkMapPopUpTemplate = Template.bind({});

export default {
    title: "moderation/components/network/NetworkMap",
    component: NetworkMapPopUp,
    args: {
        popUpOpen: true,
        company: {
            id: 81324,
            created: "2022-12-15T15:37:37Z",
            updated: "2023-01-10T14:16:23.849333Z",
            deleted: null,
            company_identification_number: "820000891",
            trade_number: "82000089100011",
            vat_number: "FR41820000891",
            is_headquarters: true,
            crm_id: "7136110516",
            crm_owner_id: "118017602",
            crm_owner_name: "Valentin QUERE (valentin.quere@dashdoc.eu)",
            denomination: "TRANSPORT TRICOIRE",
            country: "FR",
            department: "85",
            department_code: "85",
            city: "Saint-Hilaire-de-Loulay",
            postcode: "85600",
            address: "Rue des Artisans 1",
            latitude: 47.00179,
            longitude: -1.33982,
            phone: "+33 2 51 94 23 52",
            email: "victor.billaud@dashdoc.eu",
            website: "dashdoc.com",
            employee_count: null,
            heavy_vehicle_count: 15,
            light_vehicle_count: null,
            company_type: ["carrier"],
            business_sector: ["industry"],
            tms: ["no_tms"],
            invoicing_tool: ["acs_trans_cofisoft"],
            telematics_provider: ["webfleet", "axxes_fleet_manager"],
            truck_types: ["tautliner"],
            lead_status: "opportunity",
            nace_code: "49.41A",
            is_active: true,
            parent_company: null,
            dashdoc_id: "1157749",
            dashdoc_account_type: "demo",
            dashdoc_deleted: true,
        },
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;
