import {Text} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FocusEvent, ReactNode, RefAttributes, useCallback} from "react";

import {IconProps} from "../../icon";
import {TooltipPlacement, TooltipWrapper} from "../../TooltipWrapper";
import {BoxProps} from "../../../Elements/layout/Box";
import {Flex, FlexProps} from "../../../Elements/layout/Flex";

import {
    LeftIcon,
    LeftIconWithTooltip,
    RightIcon,
    RightIconWithTooltip,
    RightUnits,
} from "./Adornments";
import {ErrorMessage} from "./ErrorMessage";
import {Label} from "./Label";
import {StyledInput, StyledInputProps} from "./StyledInput";

export {getInputStylesFromProps} from "./StyledInput";

type InputPropsWithoutRef = BoxProps &
    Omit<
        StyledInputProps,
        | "onChange"
        | "label"
        | "withLabel"
        | "withLeftIcon"
        | "withRightIcon"
        | "value"
        | "error"
        | "ref"
    > & {
        value: string;
        onChange: (value: string | number, event: React.ChangeEvent<HTMLInputElement>) => void;
        label?: ReactNode;
        error?: string | boolean;
        warning?: boolean;
        success?: boolean;
        leftIcon?: IconProps["name"];
        leftIconColor?: string;
        leftTooltipContent?: string;
        leftTooltipPlacement?: TooltipPlacement;
        rightIcon?: IconProps["name"];
        rightIconColor?: string;
        rightTooltipContent?: string;
        rightTooltipPlacement?: TooltipPlacement;
        units?: string;
        containerProps?: FlexProps;
    };
export type InputProps = InputPropsWithoutRef & RefAttributes<HTMLInputElement>;

const _Input: React.ForwardRefRenderFunction<HTMLInputElement, InputPropsWithoutRef> = (
    props,
    ref
) => {
    // props to be intercepted and not passed to <input />
    const {
        label,
        leftIcon,
        leftIconColor,
        leftTooltipContent,
        leftTooltipPlacement = "left",
        rightIcon,
        rightIconColor,
        rightTooltipContent,
        rightTooltipPlacement = "right",
        units,
        onChange,
        containerProps = {},
        ...inputProps
    } = props;

    // props needed to be read
    const {
        id,
        error,
        warning,
        success,
        disabled,
        required,
        value,
        onFocus: onFocusCallback,
        onBlur: onBlurCallback,
    } = props;

    const filled = value !== "" && value !== null && value !== undefined;
    const withLabel = Boolean(label);
    const withLeftIcon = Boolean(leftIcon);
    const withRightIcon = Boolean(rightIcon);
    const withUnits = Boolean(units);

    const [focused, setIsFocused, setIsBlurred] = useToggle();
    const onFocus = useCallback(
        (e: FocusEvent<HTMLInputElement, Element>) => {
            setIsFocused();
            onFocusCallback && onFocusCallback(e);
        },
        [onFocusCallback]
    );

    const onBlur = useCallback(
        (e: FocusEvent<HTMLInputElement, Element>) => {
            setIsBlurred();
            onBlurCallback && onBlurCallback(e);
        },
        [onBlurCallback]
    );

    // props to forward to each element
    const statusProps = {
        error,
        warning,
        success,
        disabled,
        required,
        filled,
        focused,
    };

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value, event);
        },
        [onChange]
    );

    return (
        <>
            <Flex alignItems={"stretch"} {...containerProps} position="relative">
                <StyledInput
                    ref={ref}
                    withLabel={withLabel}
                    withLeftIcon={withLeftIcon}
                    withRightIcon={withRightIcon}
                    withUnits={withUnits}
                    onChange={handleChange}
                    {...inputProps}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />
                {units && (
                    <Flex
                        id="unitsContainer"
                        border="1px solid"
                        borderLeft="none"
                        pr={3}
                        borderTopRightRadius={1}
                        borderBottomRightRadius={1}
                        borderColor="grey.light"
                        backgroundColor="grey.white"
                        minWidth="unset"
                        {...(error && {
                            backgroundColor: "red.ultralight",
                            borderColor: "red.default",
                        })}
                        {...(warning && {
                            backgroundColor: "yellow.ultralight",
                            borderColor: "yellow.default",
                        })}
                        {...(success && {
                            borderColor: "green.default",
                        })}
                    >
                        <RightUnits
                            withLabel={withLabel}
                            // @ts-ignore
                            error={error}
                            // @ts-ignore
                            warning={warning}
                            filled={filled}
                            focused={focused}
                            // @ts-ignore
                            disabled={disabled}
                        >
                            {units}
                        </RightUnits>
                    </Flex>
                )}
                {leftIcon &&
                    (leftTooltipContent ? (
                        <TooltipWrapper
                            content={
                                <Text
                                    dangerouslySetInnerHTML={{
                                        // nosemgrep react-dangerouslysetinnerhtml
                                        __html: leftTooltipContent,
                                    }}
                                ></Text>
                            }
                            placement={leftTooltipPlacement}
                        >
                            <LeftIconWithTooltip name={leftIcon} color={leftIconColor} />
                        </TooltipWrapper>
                    ) : (
                        <LeftIcon name={leftIcon} color={leftIconColor} />
                    ))}
                {rightIcon &&
                    (rightTooltipContent ? (
                        <TooltipWrapper
                            content={
                                <Text
                                    dangerouslySetInnerHTML={{
                                        // nosemgrep react-dangerouslysetinnerhtml
                                        __html: rightTooltipContent,
                                    }}
                                ></Text>
                            }
                            placement={rightTooltipPlacement}
                        >
                            <RightIconWithTooltip name={rightIcon} color={rightIconColor} />
                        </TooltipWrapper>
                    ) : (
                        <RightIcon name={rightIcon} color={rightIconColor} />
                    ))}
                {label && (
                    // @ts-ignore
                    <Label
                        label={label}
                        htmlFor={id}
                        withLeftIcon={withLeftIcon}
                        {...statusProps}
                    />
                )}
            </Flex>
            {error && typeof error === "string" && <ErrorMessage error={error} />}
        </>
    );
};

_Input.displayName = "Input";
export const Input = React.forwardRef(_Input);
