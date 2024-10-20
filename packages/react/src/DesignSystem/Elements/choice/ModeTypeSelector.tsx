import {Box, Callout, Flex, TestableProps, Icon, IconNames, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {ReactNode} from "react";

const RadioBox = styled(Box)<{
    defaultChecked: boolean;
    disabled?: boolean;
    width?: string;
    height?: string;
}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid ${theme.colors.grey.light};
    padding: 2px 2px;
    border-radius: 4px;
    text-align: center;
    width: ${({width}) => width || "150px"};
    height: ${({height}) => height || "100px"};
    row-gap: 8px;
    ${({disabled, defaultChecked: checked}) => `
    ${disabled && !checked ? `background-color: ${theme.colors.grey.ultralight};` : ""}
    ${!disabled ? "&:hover { cursor: pointer; }" : ""}
    ${
        checked
            ? `
        background-color: ${theme.colors.blue.ultralight};
        border: 1px solid ${theme.colors.blue.default};
    `
            : ""
    }
`}
`;

type IconProvider = IconNames | ((isChecked: boolean) => ReactNode);

export type ModeDescription<ModeType> = {
    value: ModeType;
    label: string;
    icon: IconProvider;
    display?: boolean;
    calloutLabel?: ReactNode;
};
export interface ModeTypeSelectorProps<ModeType> {
    modeList: ModeDescription<ModeType>[];
    currentMode: ModeType | null;
    setCurrentMode: (mode: ModeType) => void;
    disabled?: boolean;
    width?: string;
    height?: string;
}

type SingleModeBoxProps<ModeType> = {
    value: ModeType;
    label: string;
    icon: IconProvider;
    disabled: boolean;
    isChecked: boolean;
    check: () => unknown;
    width?: string;
    height?: string;
};

const ModBox = <ModeType,>({
    value,
    label,
    icon,
    disabled,
    isChecked,
    check,
    width,
    height,
}: SingleModeBoxProps<ModeType>) => (
    <RadioBox
        data-testid={`mode-type-selector-${value}`}
        onClick={() => {
            if (!disabled) {
                check();
            }
        }}
        defaultChecked={isChecked}
        p={0}
        disabled={disabled}
        width={width}
        height={height}
    >
        <Box flexGrow={1} />
        {typeof icon === "function" ? (
            icon(isChecked)
        ) : (
            <Icon
                color={isChecked ? "blue.default" : "grey.dark"}
                name={icon as IconNames}
                fontSize={5}
            />
        )}
        <Text
            data-testid={isChecked ? `is-checked` : undefined}
            color={isChecked ? "blue.default" : "grey.dark"}
            variant="caption"
        >
            {label}
        </Text>
        <Box flexGrow={1} />
    </RadioBox>
);

export function ModeTypeSelector<ModeType>({
    modeList,
    currentMode,
    setCurrentMode,
    disabled = false,
    width,
    height,
    "data-testid": dataTestId,
}: ModeTypeSelectorProps<ModeType> & Partial<TestableProps>) {
    const currentModeIndex = modeList.findIndex(({value}) => value === currentMode);
    const calloutLabel = modeList[currentModeIndex]?.calloutLabel;
    return (
        <>
            <Flex style={{columnGap: "12px"}} data-testid={dataTestId}>
                {modeList
                    .filter(({display}) => (display === undefined ? true : display))
                    .map(({value, label, icon}) => (
                        <ModBox
                            key={`${value}`}
                            value={value}
                            label={label}
                            icon={icon}
                            disabled={disabled}
                            isChecked={currentMode === value}
                            check={() => {
                                setCurrentMode(value);
                            }}
                            width={width}
                            height={height}
                        />
                    ))}
            </Flex>
            {calloutLabel && <Callout mt={2}>{calloutLabel}</Callout>}
        </>
    );
}
