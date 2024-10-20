import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {toast} from "@dashdoc/web-ui";
import {roundNumber} from "dashdoc-utils";
import {cloneDeep} from "lodash";

import {
    TariffGridVersion,
    TariffGridDistancesLineHeaders,
    TariffGridZonesLineHeaders,
    TariffGridZone,
} from "../types";

/**Take a float table string as contained in the clipboard after copying it from excel
 * And return a 2D float table
 */
function deserializeFloatTable(serializedData: string) {
    return serializedData
        .split("\n")
        .map((line) => line.split("\t").map((word) => parseFloat(word.replace(",", "."))));
}

function editCell(
    tariffGridVersion: TariffGridVersion,
    value: number,
    lineIndex: number,
    colIndex: number
): TariffGridVersion {
    const result: TariffGridVersion = cloneDeep(tariffGridVersion);
    result.table[lineIndex][colIndex] = value;
    return result;
}

function isValidPasteData(pasteData: string): boolean {
    const table = deserializeFloatTable(pasteData);
    return table?.length > 1 && table[0]?.length > 0;
}

function pasteCells(
    tariffGridVersion: TariffGridVersion,
    pasteData: string,
    lineIndex: number,
    colIndex: number
): TariffGridVersion {
    const result: TariffGridVersion = cloneDeep(tariffGridVersion);
    if (isValidPasteData(pasteData)) {
        const table = deserializeFloatTable(pasteData);
        const lineNumber = table.length;
        const colNumber = Math.max(...table.map((line) => line.length));
        for (let i = 0; i < lineNumber; i++) {
            const line = lineIndex + i;
            if (line >= tariffGridVersion.table.length) {
                break;
            }
            for (let j = 0; j < colNumber; j++) {
                if (j < table[i].length) {
                    const col = colIndex + j;
                    if (col >= tariffGridVersion.table[0].length) {
                        break;
                    }
                    result.table[line][col] = table[i][j];
                }
            }
        }
        if (
            lineIndex + lineNumber > tariffGridVersion.table.length ||
            colIndex + colNumber > tariffGridVersion.table[0].length
        ) {
            // warn
            toast.warning(t("tariffGrids.paste.outOfBounds"));
        }
    }
    return result;
}

function addZoneLine(
    tariffGridVersion: TariffGridVersion<TariffGridZonesLineHeaders>,
    zone: TariffGridZone
) {
    const result = cloneDeep(tariffGridVersion);
    result.line_headers.zones.push(zone);
    let newLine = tariffGridVersion.metric_steps.map(() => NaN);
    newLine.pop();
    result.table.push(newLine);
    return result;
}

function addDistanceLine(
    tariffGridVersion: TariffGridVersion<TariffGridDistancesLineHeaders>,
    distance: string
) {
    //First make sure the distance is not already in the table
    const distanceNumber = parseFloat(distance);
    if (tariffGridVersion.line_headers.distances.map(parseFloat).includes(distanceNumber)) {
        return tariffGridVersion;
    }
    const result = cloneDeep(tariffGridVersion);
    //find the index where to insert the new distance
    let index = 0;
    while (
        index < result.line_headers.distances.length &&
        parseFloat(result.line_headers.distances[index]) < distanceNumber
    ) {
        index++;
    }

    //insert the new distance
    result.line_headers.distances.splice(index, 0, distance);

    let newLine = tariffGridVersion.metric_steps.map(() => NaN);
    newLine.pop();

    // insert the new line
    result.table.splice(index, 0, newLine);
    return result;
}

function editZoneLine(
    tariffGridVersion: TariffGridVersion<TariffGridZonesLineHeaders>,
    zone: TariffGridZone,
    index: number
) {
    const result = cloneDeep(tariffGridVersion);
    const newZones = [...result.line_headers.zones];
    newZones[index] = zone;
    result.line_headers.zones = newZones;

    return result;
}

function editDistanceLine(
    tariffGridVersion: TariffGridVersion<TariffGridDistancesLineHeaders>,
    distance: string,
    index: number
): TariffGridVersion {
    const result = cloneDeep(tariffGridVersion);
    const newDistances = [...result.line_headers.distances];
    newDistances[index] = distance;
    result.line_headers.distances = newDistances;

    return result;
}

function deleteLine(tariffGridVersion: TariffGridVersion, index: number): TariffGridVersion {
    const result: TariffGridVersion = cloneDeep(tariffGridVersion);
    if (result.line_headers.lines_type === "zones") {
        const newZones = [...result.line_headers.zones];
        newZones.splice(index, 1);
        result.line_headers.zones = newZones;
    } else {
        // result.line_headers.lines_type === "distances"
        const newDistances = [...result.line_headers.distances];
        newDistances.splice(index, 1);
        result.line_headers.distances = newDistances;
    }
    const newTable = [...result.table];
    newTable.splice(index, 1);
    result.table = newTable;
    return result;
}

function addColumn(tariffGridVersion: TariffGridVersion, value: number) {
    const result: TariffGridVersion = cloneDeep(tariffGridVersion);
    if (tariffGridVersion.metric_steps.length > 1) {
        if (isNaN(value)) {
            const biggestStep =
                tariffGridVersion.metric_steps[tariffGridVersion.metric_steps.length - 1];
            result.metric_steps.push(biggestStep + 1);
            for (const line of result.table) {
                line.push(NaN);
            }
        } else if (
            value < 0 ||
            tariffGridVersion.metric_steps.find((v) => v === value) !== undefined
        ) {
            // Nothing to do
        } else if (value < tariffGridVersion.metric_steps[0]) {
            //NOT YET IMPLEMENTED
        } else if (
            value > tariffGridVersion.metric_steps[tariffGridVersion.metric_steps.length - 1]
        ) {
            result.metric_steps.push(value);
            for (const line of result.table) {
                line.push(NaN);
            }
        } else {
            //TODO: le cas en dessous de zéro, et le cas où égal à une autre valeur
            let belowIndex = 0;
            let aboveIndex = tariffGridVersion.metric_steps.length - 1;
            while (aboveIndex - belowIndex > 1) {
                const middleIndex = Math.floor((belowIndex + aboveIndex) / 2);
                if (tariffGridVersion.metric_steps[middleIndex] < value) {
                    belowIndex = middleIndex;
                } else {
                    aboveIndex = middleIndex;
                }
            }
            result.metric_steps.splice(aboveIndex, 0, value);
            for (const line of result.table) {
                line.splice(belowIndex, 0, NaN);
            }
        }
    } else if (0 < value) {
        result.metric_steps = [0, value];
        for (let line = 0; line < result.table.length; line++) {
            result.table[line] = [NaN];
        }
    }
    return result;
}

const editColumn = (
    tariffGridVersion: TariffGridVersion,
    value: number,
    index: number
): TariffGridVersion => {
    let result = tariffGridVersion;
    // duplication not allowed
    if (!tariffGridVersion.metric_steps.includes(value)) {
        // index in bounds
        if (index < tariffGridVersion.metric_steps.length) {
            result = cloneDeep(tariffGridVersion);
            result.metric_steps = [...result.metric_steps];
            result.metric_steps[index] = value;
            result.metric_steps.sort((a, b) => {
                return a - b;
            });
        } else {
            Logger.error("editStep out of bounds");
        }
    }
    return result;
};

const deleteColumn = (tariffGridVersion: TariffGridVersion, index: number): TariffGridVersion => {
    const result: TariffGridVersion = cloneDeep(tariffGridVersion);
    const newMetricSteps = [...result.metric_steps];
    newMetricSteps.splice(index, 1);
    result.metric_steps = newMetricSteps;
    const newTable = [];
    for (const line of result.table) {
        const newLine = [...line];
        newLine.splice(index - 1, 1);
        newTable.push(newLine);
    }
    result.table = newTable;
    return result;
};

const applyPercentageOnAllCells = (
    tariffGridVersion: TariffGridVersion,
    percentage: number,
    decimals: number
): TariffGridVersion => {
    let result: TariffGridVersion = cloneDeep(tariffGridVersion);

    for (let rowIndex = 0; rowIndex < result.table.length; rowIndex++) {
        for (let columnIndex = 0; columnIndex < result.table[rowIndex].length; columnIndex++) {
            result.table[rowIndex][columnIndex] = roundNumber(
                result.table[rowIndex][columnIndex] * (1 + percentage / 100),
                decimals
            );
        }
    }

    return result;
};

export const tableService = {
    editCell,
    pasteCells,
    isValidPasteData,
    addZoneLine,
    addDistanceLine,
    editZoneLine,
    editDistanceLine,
    deleteLine,
    addColumn,
    editColumn,
    deleteColumn,
    applyPercentageOnAllCells,
};
