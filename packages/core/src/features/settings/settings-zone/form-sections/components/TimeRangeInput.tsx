import {Box, Flex, Icon, Input} from "@dashdoc/web-ui";
import React from "react";

type TimeRangeInputProps = {
    isFirst: boolean;
    value?: string[];
    onChange: (value: string[]) => void;
    onDelete?: () => void;
};

export function TimeRangeInput({
    value = ["", ""],
    onChange,
    onDelete,
    isFirst,
}: TimeRangeInputProps) {
    return (
        <Flex alignItems="center" justifyContent={"center"} marginY={1}>
            <Input
                type="time"
                value={value[0]}
                onChange={(_, eEvent: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = [eEvent.target.value, value[1]];
                    onChange(newValue);
                }}
                marginLeft={isFirst ? "" : "24px"}
            />
            <Box marginX={2}>-</Box>
            <Input
                type="time"
                value={value[1]}
                onChange={(_, eEvent: React.ChangeEvent<HTMLInputElement>) => {
                    const newValue = [value[0], eEvent.target.value];
                    onChange(newValue);
                }}
            />
            {!isFirst && onDelete && (
                <Box onClick={onDelete} marginLeft={2}>
                    <Icon name="bin" color="inherit" />
                </Box>
            )}
        </Flex>
    );
}
