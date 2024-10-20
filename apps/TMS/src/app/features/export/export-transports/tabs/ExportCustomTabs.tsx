import {ExportTab} from "@dashdoc/web-common/src/features/export/tabs/ExportTab";
import {TabOption} from "@dashdoc/web-common/src/features/export/tabs/types";
import {ExportFormat} from "@dashdoc/web-common/src/features/export/types";
import React from "react";

import {SavedExport} from "../types";

type Props = {
    savedExports: SavedExport[];
    onClick: (value: ExportFormat) => void;
    onDelete?: (value: ExportFormat) => void;
    currentFormat: ExportFormat;
};
export function ExportCustomTabs({currentFormat, savedExports, onClick, onDelete}: Props) {
    const options: TabOption[] = savedExports.map((savedExport, i) => {
        return {
            icon: "workflowDataTable2",
            value: i,
            label: savedExport.name,
        };
    });

    return (
        <>
            {options.map((option) => {
                return (
                    <ExportTab
                        key={option.value}
                        option={option}
                        currentValue={currentFormat}
                        onClick={() => onClick(option.value)}
                        onDelete={onDelete ? () => onDelete(option.value) : undefined}
                    />
                );
            })}
        </>
    );
}
