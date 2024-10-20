import {Select} from "@dashdoc/web-ui";
import React from "react";

type LoadUnit = "weight" | "volume" | "linear_meters" | "quantity";
type Props = {
    unitOptions: Array<{
        label: string;
        value: LoadUnit;
        unit: string;
    }>;
    selectedUnit: LoadUnit;
    setSelectedUnit: (value: LoadUnit) => void;
};
export function LoadUnitSelect({unitOptions, selectedUnit, setSelectedUnit}: Props) {
    return (
        <Select
            options={unitOptions}
            value={unitOptions.find((o) => o.value === selectedUnit)}
            onChange={(v: {value: string}) =>
                setSelectedUnit(unitOptions.find((o) => o.value === v.value)?.value ?? "quantity")
            }
            isClearable={false}
            data-testid="select-trip-load-graph-unit"
            styles={{
                singleValue: (provided) => ({
                    ...provided,
                    fontSize: "12px",
                }),
                menu: (provided) => ({
                    ...provided,
                    fontSize: "12px",
                    width: "200px",
                    top: "-10px",
                    left: "100px",
                }),
                dropdownIndicator: (provided) => ({
                    ...provided,
                    padding: 0,
                }),
            }}
        />
    );
}
