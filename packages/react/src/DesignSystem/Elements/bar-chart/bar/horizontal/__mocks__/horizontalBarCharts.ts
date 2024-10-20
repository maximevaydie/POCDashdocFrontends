import {theme} from "@dashdoc/web-ui";

import {HorizontalChart} from "../types";

export const horizontalBarChart: HorizontalChart = {
    titleValue: "1 602 €",
    titleLabel: "Total coûts",
    type: "TRANSPORT_SUM_PRICING",
    results: [
        {
            id: 0,
            color: theme.colors.pool[1],
            label: "Chuck transport",
            valueLabel: "240 €",
            value: 240,
        },
        {
            id: 1,
            color: theme.colors.pool[2],
            label: "Truck Carrier",
            valueLabel: "220 €",
            value: 220,
        },
        {
            id: 2,
            color: theme.colors.pool[3],
            label: "Transports miscellaneous",
            valueLabel: "200 €",
            value: 200,
        },
        {id: 3, color: theme.colors.pool[4], label: "TTP", valueLabel: "200 €", value: 200},
        {id: 4, color: theme.colors.pool[5], label: "DSD fret", valueLabel: "150 €", value: 150},
        {
            id: 5,
            color: theme.colors.pool[6],
            label: "Truck carrier",
            valueLabel: "100 €",
            value: 100,
        },
        {
            id: 6,
            color: theme.colors.pool[7],
            label: "Trucky-Truck",
            valueLabel: "80 €",
            value: 80,
        },
        {id: 7, color: theme.colors.pool[8], label: "Ernest TP", valueLabel: "70 €", value: 70},
        {id: 8, color: theme.colors.pool[9], label: "OPTPR", valueLabel: "50 €", value: 50},
        {
            id: 9,
            color: theme.colors.pool[1],
            label: "Bernard route",
            valueLabel: "50 €",
            value: 50,
        },
        {
            id: 10,
            color: theme.colors.pool[2],
            label: "Transport Deluxe",
            valueLabel: "25 €",
            value: 25,
        },
        {
            id: 11,
            color: theme.colors.pool[3],
            label: "AZ - Palettes",
            valueLabel: "25 €",
            value: 25,
        },
        {id: 12, color: theme.colors.pool[4], label: "B.V. trans", valueLabel: "12 €", value: 12},
        {
            id: 13,
            color: theme.colors.pool[5],
            label: "MAUFFREY CHAMPAGNE ARDENNE",
            valueLabel: "1000 €",
            value: 1000,
        },
    ],
};
