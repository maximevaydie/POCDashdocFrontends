import {translateVolumeUnit} from "@dashdoc/web-core";
import {Select} from "@dashdoc/web-ui";
import React, {FunctionComponent, useCallback, useMemo} from "react";

import type {Transport} from "app/types/transport";

type VolumeUnit = Transport["volume_display_unit"];

type VolumeDisplayUnitPickerProps = {
    unit: VolumeUnit;
    onChange: (selectedUnit: VolumeUnit) => void;
    labels?: {[key in VolumeUnit]?: string};
};

const VolumeDisplayUnitPicker: FunctionComponent<VolumeDisplayUnitPickerProps> = ({
    unit,
    onChange,
    labels = {},
}) => {
    const getLabel = useCallback(
        (unit: VolumeUnit) => {
            if (labels[unit]) {
                return labels[unit];
            }
            return `${translateVolumeUnit(unit)} (${translateVolumeUnit(unit, {
                short: true,
            })})`;
        },
        [labels]
    );

    const getOption = useCallback(
        (unit: VolumeUnit) => ({
            label: getLabel(unit),
            value: unit,
        }),
        [getLabel]
    );

    // declare inside component to be able to get translation
    // @ts-ignore
    const availableUnits: {label: string; value: VolumeUnit}[] = useMemo(
        () => ["m3", "L"].map(getOption),
        [getOption]
    );

    const onSelectUnit = useCallback(
        ({value}: {value: VolumeUnit}) => onChange(value),
        [onChange]
    );

    return (
        <Select
            options={availableUnits}
            value={getOption(unit)}
            onChange={onSelectUnit}
            isClearable={false}
            data-testid="volume-display-unit-select"
        />
    );
};

export default VolumeDisplayUnitPicker;
