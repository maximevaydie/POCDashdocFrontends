import {Text} from "@dashdoc/web-ui";
import {formatNumberWithCustomUnit} from "dashdoc-utils";
import React from "react";

export function NumberStat({value, unit}: {value: number | null; unit: string}) {
    return (
        <>
            {formatNumberWithCustomUnit(
                value,
                {unit},
                {maximumFractionDigits: 0},
                (formattedNumber) => (
                    <Text variant="title" display="inline">
                        {formattedNumber}
                    </Text>
                )
            )}
        </>
    );
}
