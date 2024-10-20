import React, {ClipboardEventHandler, FC, useState} from "react";

import {getMetricDisplayUnit} from "app/services/invoicing";

import {TariffGrid, TariffGridVersion} from "../types";

import {TableBody} from "./body/TableBody";
import {TableHeader} from "./header/TableHeader";
import {tableService} from "./table.service";

export type TariffGridTableProps = {
    dataTestId?: string;
    tariffGrid: TariffGrid;
    tariffGridVersion: TariffGridVersion;
    onChange: (newTariffGridVersion: TariffGridVersion) => unknown;
};

export const TariffGridTable: FC<TariffGridTableProps> = ({
    dataTestId,
    tariffGrid,
    tariffGridVersion,
    onChange,
}) => {
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

    const metricUnit = getMetricDisplayUnit(tariffGrid.pricing_metric);
    const canPaste = tariffGridVersion.metric_steps.length > 1;
    const onPaste: ClipboardEventHandler<HTMLTableElement> = (e) => {
        if (canPaste) {
            if (selectedCell !== null) {
                const data = e.clipboardData.getData("Text");
                const updatedTariffGridVersion = tableService.pasteCells(
                    tariffGridVersion,
                    data,
                    selectedCell[0],
                    selectedCell[1]
                );
                onChange(updatedTariffGridVersion);
            }
        }
    };

    return (
        <table onPaste={onPaste} style={{borderCollapse: "collapse"}}>
            <TableHeader
                tariffGridVersion={tariffGridVersion}
                onChange={onChange}
                metricUnit={metricUnit}
            />
            <TableBody
                dataTestId={dataTestId}
                tariffGrid={tariffGrid}
                tariffGridVersion={tariffGridVersion}
                selectedCell={selectedCell}
                onSelect={setSelectedCell}
                onChange={onChange}
                metricUnit={metricUnit}
            />
        </table>
    );
};
