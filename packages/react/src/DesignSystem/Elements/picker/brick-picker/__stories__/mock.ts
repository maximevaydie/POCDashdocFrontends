import {Brick, BrickLine} from "../types";

function newFull(selected: boolean = false): Brick {
    return {empty: false, selected};
}

function newEmpty(selected: boolean = false): Brick {
    return {empty: true, selected};
}

export const lines: BrickLine[] = [
    {
        label: "8h00",
        bricks: [
            newFull(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
            newEmpty(),
        ],
    },
    {
        label: "8h20",
        bricks: [newFull(), newFull(), newFull()],
    },
    {
        label: "8h40",
        bricks: [newFull()],
    },
    {
        label: "9h00",
        bricks: [newFull(), newFull()],
    },
    {
        label: "9h20",
        bricks: [
            newFull(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
            newEmpty(true),
        ],
    },
    {
        label: "9h40",
        bricks: [],
    },
    {
        label: "10h00",
        bricks: [],
    },
    {
        label: "10h20",
        bricks: [],
    },
    {
        label: "10h40",
        bricks: [],
    },
    {
        label: "11h00",
        bricks: [],
    },
];
