import {Box, ClickableBox, ClickOutside, Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type Option = {
    name: string;
    onClick: () => void;
    testId?: string;
};

type Props = {
    ButtonComponent: ({
        onClick,
        disabled,
    }: {
        onClick: () => void;
        disabled?: boolean;
    }) => JSX.Element;
    width?: string;
    marginLeft?: string;
    optionsPositionLeft?: string;
    optionsPositionRight?: string;
    optionsPositionTop?: string;
    options: Option[];
    onOptionSelected?: () => void;
    disabled?: boolean;
};

export function MultipleActionsButton({
    ButtonComponent,
    width,
    marginLeft,
    optionsPositionLeft,
    optionsPositionRight,
    optionsPositionTop,
    options,
    disabled,
    onOptionSelected,
}: Props) {
    const [showOptions, , closeOptions, toggleOptions] = useToggle(false);
    return (
        <ClickOutside
            position="relative"
            onClickOutside={closeOptions}
            width={width}
            marginLeft={marginLeft}
            data-testid="new-transport-toggle-options-button"
        >
            <>
                <ButtonComponent onClick={toggleOptions} disabled={disabled} />
                {showOptions && (
                    <Box
                        position="absolute"
                        left={optionsPositionLeft}
                        right={optionsPositionRight}
                        top={optionsPositionTop}
                        boxShadow="large"
                        backgroundColor="grey.white"
                        borderRadius={1}
                        zIndex="navbar" // to be over navbar icons and tooltips
                    >
                        {options.map(({name, onClick, testId}, index) => (
                            <ClickableBox
                                py={2}
                                px={4}
                                onClick={() => {
                                    onOptionSelected?.();
                                    closeOptions();
                                    onClick();
                                }}
                                data-testid={testId}
                                key={index}
                            >
                                <Text whiteSpace="nowrap">{name}</Text>
                            </ClickableBox>
                        ))}
                    </Box>
                )}
            </>
        </ClickOutside>
    );
}
