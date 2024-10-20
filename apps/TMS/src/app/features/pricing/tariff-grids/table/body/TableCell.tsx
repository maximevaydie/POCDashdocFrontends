import {getLocale} from "@dashdoc/web-core";
import {Box, NumberInput, Text, theme, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {NumberParser} from "@internationalized/number";
import React, {FC, useMemo, useState} from "react";

import {tableService} from "../table.service";

const MAX_DIGITS = 3;

export const Td = styled(Box.withComponent("td"))<{
    isClickable?: boolean;
    isSelected?: boolean;
}>(({isClickable, isSelected}) =>
    themeAwareCss({
        cursor: isClickable ? "pointer" : "default",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "grey.light",
        minWidth: "150px",
        textAlign: "right",
        padding: isSelected ? 0 : "10px",
        "&:hover": {
            backgroundColor: isSelected ? "inherit" : "blue.light",
        },
    })
);

export const TableCell: FC<{
    dataTestId?: string;
    value: number;
    units: string;
    onChange: (value: number) => unknown;
    onClick: () => unknown;
    onClose: () => unknown;
    onEnter: () => unknown;
    isSelected: boolean;
    line: number;
    column: number;
}> = ({
    dataTestId,
    value: initialValue,
    units,
    onChange,
    onClick,
    onClose,
    onEnter,
    isSelected,
    line,
    column,
}) => {
    const [inputValue, setInputValue] = useState(initialValue);

    const locale = getLocale();
    const formatOptions = useMemo(
        () => ({
            maximumFractionDigits: MAX_DIGITS,
        }),
        []
    );
    const parser = useMemo(() => new NumberParser(locale, formatOptions), [locale, formatOptions]);

    const display = useMemo(() => {
        if (isSelected) {
            return (
                <NumberInput
                    value={initialValue}
                    maxDecimals={MAX_DIGITS}
                    units={units}
                    data-testid={
                        dataTestId
                            ? `${dataTestId}-table-cell-input-${line}-${column}`
                            : `table-cell-input-${line}-${column}`
                    }
                    autoFocus={true}
                    onFocus={(e) => e.target.select()}
                    onPaste={(event) => {
                        const data = event.clipboardData.getData("Text");
                        if (tableService.isValidPasteData(data)) {
                            event.preventDefault();
                        } else {
                            event.stopPropagation();
                        }
                    }}
                    onKeyPress={(event: any) => {
                        if (event.key === "Enter") {
                            onChange(inputValue);
                            onEnter();
                        }
                    }}
                    onChange={(value: number | null) => {
                        if (value !== null) {
                            setInputValue(value);
                            onChange(value);
                        }
                    }}
                    onTransientChange={(value: number | null) => {
                        if (value !== null) {
                            /*
                             * hack to parse the expected digit limit before the potential ENTER keyboard event.
                             * Otherwise, there is an unparsed value in the cell.
                             * A refresh will be done by the input when we re-open it (really bad UX experience).
                             */
                            const parsedValue = parser.parse(value.toFixed(MAX_DIGITS));
                            setInputValue(parsedValue);
                        }
                    }}
                />
            );
        } else {
            if (isNaN(initialValue)) {
                return <Text></Text>;
            }
            return <Text>{initialValue.toString() + "\xa0" + units}</Text>;
        }
    }, [initialValue, inputValue, units, isSelected, parser, onEnter, onChange]);
    return (
        <Td
            onClick={onClick}
            isClickable
            data-testid={
                dataTestId
                    ? `${dataTestId}-table-cell-${line}-${column}`
                    : `table-cell-${line}-${column}`
            }
            isSelected={isSelected}
            onBlur={onClose}
            style={{border: `1px solid ${theme.colors.grey.light}`}}
        >
            {display}
        </Td>
    );
};
