import {SearchableItemsSelector} from "@dashdoc/web-ui";
import React, {useMemo} from "react";

type Props = {
    labels: {
        on: string;
        off: string;
    };
    value: boolean | undefined;
    onChange: (value: boolean | undefined) => void;
};
export function FilteringBooleanSelector({labels, value, onChange}: Props) {
    const items = [
        {id: "true", label: labels.on},
        {id: "false", label: labels.off},
    ];

    // derive the values array from the value
    const values = useMemo(() => {
        if (value === true) {
            return ["true"];
        } else if (value === false) {
            return ["false"];
        }
        return [];
    }, [value]);

    return (
        <SearchableItemsSelector<{id: string; label: string}>
            items={items}
            getItemId={(item) => item.id}
            getItemLabel={(item) => item.label}
            values={values}
            onChange={onSwitch}
            enableSelectAll={false}
        />
    );

    function onSwitch(newValue: Array<"true" | "false">) {
        if (newValue.length === 0) {
            onChange(undefined);
        } else if (newValue.length === 1) {
            onChange(newValue[0] === "true");
        } else if (newValue.length === 2) {
            if (value === undefined) {
                // invalid case, we can't have both values selected once
                onChange(undefined);
            } else {
                onChange(!value); // reverse the current value
            }
        } else {
            onChange(undefined);
        }
    }
}
