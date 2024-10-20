import {theme} from "@dashdoc/web-ui";

import {VerticalChart} from "../types";

export const delay: VerticalChart = {
    title: "Répartition des retards",
    legends: [
        {label: "Chargement", color: theme.colors.blue.light},
        {label: "Déchargement", color: theme.colors.blue.default},
    ],
    bars: [{color: theme.colors.blue.light}, {color: theme.colors.blue.default}],
    rows: [
        {
            label: "< 15 min",
            values: [35, 55],
        },
        {
            label: "15 < 45 min",
            values: [78, 40],
        },
        {
            label: "> 45 min",
            values: [50, 30],
        },
    ],
};

export const cost: VerticalChart = {
    title: "Coût",
    bars: [{color: theme.colors.blue.default}],
    legends: [{label: "Coût", color: theme.colors.blue.default}],
    rows: [
        {
            label: "Janvier",
            values: [1250],
        },
        {
            label: "Février",
            values: [1700],
        },
        {
            label: "Mars",
            values: [900],
        },
    ],
};

export const punctuality: VerticalChart = {
    title: "Ponctualité",
    legends: [
        {label: "À l'heure", color: theme.colors.green.default},
        {label: "En retard", color: theme.colors.red.default},
        {label: "Ponctualité inconnue", color: theme.colors.grey.default},
    ],
    bars: [
        {color: theme.colors.green.default, barSize: 40, stackId: "group1"},
        {color: theme.colors.red.default, barSize: 40, stackId: "group1"},
        {color: theme.colors.grey.default, barSize: 40, stackId: "group1"},
    ],
    rows: [
        {
            label: "Chargement",
            values: [520, 87, 1151],
        },
        {
            label: "Déchargement",
            values: [408, 29, 1321],
        },
    ],
};

export const noData: VerticalChart = {
    title: "Ponctualité",
    legends: [
        {label: "À l'heure", color: theme.colors.green.default},
        {label: "En retard", color: theme.colors.red.default},
        {label: "Ponctualité inconnue", color: theme.colors.grey.default},
    ],
    bars: [],
    rows: [],
};
