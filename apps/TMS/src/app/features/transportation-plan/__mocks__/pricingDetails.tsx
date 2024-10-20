import type {PricingDetails} from "app/features/transportation-plan/types";

export const pricingDetailsArray: PricingDetails[] = [
    {
        rows: [
            {
                label: "Prix fixe",
                subValue: "1 x 2 000,00€",
            },

            {
                label: "Poids chargé en tonne",
                subValue: "3 x 115,00€",
            },
        ],
        value: "2 345,00 €",
    },
    {
        rows: [
            {
                label: "Prix fixe",
                subValue: "3 x 1 000,00€",
            },
        ],
        value: "3 000,00 €",
    },
    {
        rows: [
            {
                label: "Prix fixe",
                subValue: "1 x 1 000,00€",
            },
            {
                label: "Poids chargé en tonne",
                subValue: "3 x 700,00 €",
            },
            {
                label: "Poids chargé en tonne",
                subValue: "? x 200,00 €",
            },
        ],
        value: "3 100,00 €",
    },
    {
        rows: [
            {
                label: "Prix fixe",
                subValue: "1 x 3 234,45€",
            },
        ],
        value: "3 234,45 €",
    },
];
