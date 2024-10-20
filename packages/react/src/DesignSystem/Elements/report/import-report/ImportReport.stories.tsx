import {Meta, Story} from "@storybook/react/types-6-0";
import React from "react";

import {ImportReport as Component} from "./ImportReport";

export default {
    title: "Web UI/report/ImportReport",
    component: Component,
    args: {
        importedEntities: [
            {
                name: "common.addresses",
                details: [
                    "TRANSPORTS LAPERRIERE - OYONNAX",
                    "TRANSPORTS LAPERRIERE - ST MARTIN DU FRESNE",
                    "MAZET  - DIJON",
                    "MAZET - REIMS",
                ],
            },
            {
                name: "common.contacts",
                details: ["TRANSPORTS LAPERRIERE - ST MARTIN DU FRESNE : Albert"],
            },
        ],
        notImportedEntities: [
            {
                name: "common.addresses",
                details: [
                    {
                        lineNumber: 2,
                        identifier: "TRANSPORTS LAPERRIERE - ANGOULEME",
                        errorDetails: {
                            non_field_errors:
                                "Cette adresse existe déjà dans votre carnet d'adresses",
                            postcode: "postcode is required",
                        },
                    },
                ],
            },
            {
                name: "common.contacts",
                details: [
                    {
                        lineNumber: 3,
                        identifier: "TRANSPORTS LAPERRIERE - LADAUX : Georges",
                        errorDetails: "Georges is not valid",
                    },
                    {
                        lineNumber: 5,
                        identifier: "TRANSPORTS LAPERRIERE - Bordeaux : Yenapadeux",
                        errorDetails: "Bad joke",
                    },
                ],
            },
        ],
    },
    parameters: {
        backgrounds: {default: "white"},
    },
} as Meta;

const Template: Story<any> = (args) => <Component {...args} />;

export const ImportReport = Template.bind({});
