import {Logger, t} from "@dashdoc/web-core";
import {Box, ErrorMessage, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {
    ComponentProps as ReactComponentProps,
    ComponentType,
    FocusEvent,
    Ref,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {ActionMeta, OptionTypeBase, ValueType, components, mergeStyles} from "react-select";

import {Label} from "../../input/input2/Label";

import {defaultStyles, getTheme} from "./BaseThemeAndStyles";
import {ReactSelectStyles, ReactSelectComponents} from "./reactSelectComponents";
import {
    AsyncCreatableSelectProps,
    AsyncPaginatedSelectProps,
    AsyncSelectProps,
    CreatableSelectProps,
    SelectProps,
} from "./types";

const CustomOption = <OptionType extends OptionTypeBase, IsMulti extends boolean>(
    props: Parameters<typeof components.Option<OptionType, IsMulti>>[0]
): ReturnType<typeof components.Option<OptionType, IsMulti>> => {
    const dataTestId =
        props.data?.testId ??
        props.data?.["data-testid"] ??
        `select-option-${
            props.data?.name ??
            (["string", "number"].includes(typeof props.data?.value)
                ? props.data?.value
                : props.data?.description ?? props.data?.label)
        }`;
    return (
        <div data-testid={dataTestId}>
            <components.Option {...props} />
        </div>
    );
};

const IndicatorsContainer = (props: any) => {
    const {
        tooltipContent,
        tooltipPosition = "right",
        iconName,
        iconColor = "blue.default",
        value,
        isClearable,
    } = props.selectProps;
    const iconRight = <Icon name={iconName} color={iconColor} mr={value && isClearable ? 0 : 3} />;
    return (
        <components.IndicatorsContainer {...props}>
            {iconName && tooltipContent ? (
                <TooltipWrapper
                    content={
                        <Text
                            dangerouslySetInnerHTML={{
                                // nosemgrep react-dangerouslysetinnerhtml
                                __html: tooltipContent,
                            }}
                        ></Text>
                    }
                    placement={tooltipPosition}
                >
                    {iconRight}
                </TooltipWrapper>
            ) : iconName ? (
                iconRight
            ) : null}
            {props.children}
        </components.IndicatorsContainer>
    );
};

type BaseComponentProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> =
    | SelectProps<OptionType, IsMulti>
    | AsyncSelectProps<OptionType, IsMulti>
    | CreatableSelectProps<OptionType, IsMulti>
    | AsyncCreatableSelectProps<OptionType, IsMulti>
    | AsyncPaginatedSelectProps<OptionType, IsMulti>;

function _BaseSelectComponent<
    OptionType extends OptionTypeBase,
    IsMulti extends boolean,
    ComponentProps extends BaseComponentProps<OptionType, IsMulti> = BaseComponentProps<
        OptionType,
        IsMulti
    >,
>(
    {
        Component,
        styles,
        onFocus: onFocusCallback,
        onBlur: onBlurCallback,
        onChange: onChangeCallback,
        "data-testid": dataTestId,
        ...props
    }: {
        Component: ReactSelectComponents<OptionType, IsMulti>;
    } & ComponentProps,
    ref?: Ref<any>
) {
    let placeholder: SelectProps["placeholder"];
    try {
        placeholder = t("common.selectPlaceholder");
    } catch (error) {
        Logger.warn("Polyglot not initialized in Select");
    }

    const [focused, setIsFocused, setIsBlurred] = useToggle();
    const onFocus = useCallback(
        (e: FocusEvent<HTMLElement, Element>) => {
            setIsFocused();
            onFocusCallback && onFocusCallback(e);
        },
        [onFocusCallback]
    );

    const onBlur = useCallback(
        (e: FocusEvent<HTMLElement, Element>) => {
            setIsBlurred();
            onBlurCallback && onBlurCallback(e);
        },
        [onBlurCallback]
    );

    const [filled, setIsFilled] = useState(Boolean(props.value));
    const onChange = useCallback(
        (value: ValueType<OptionType, IsMulti>, meta: ActionMeta<OptionType>) => {
            const filled = meta.action !== "clear" && Boolean(value);
            setIsFilled(filled);
            onChangeCallback && onChangeCallback(value, meta);
        },
        [onChangeCallback]
    );
    useEffect(() => {
        setIsFilled(Boolean(props.value));
    }, [props.value]);

    const themeToApply = useMemo(() => getTheme(props), [props.label]);
    const stylesToApply: ReactSelectStyles = useMemo(() => {
        if (!styles) {
            return defaultStyles;
        }
        return mergeStyles(defaultStyles, styles);
    }, [styles]);
    // For some reasons, although the type of Component is a union of component type
    // typescript doesn't let us use Component as a react component
    // So we assert that it is indeed a react component whose props are its props
    const CheatedTypeComponent = Component as ComponentType<ReactComponentProps<typeof Component>>;
    return (
        <>
            <Box
                position="relative"
                data-testid={dataTestId}
                minHeight={themeToApply.spacing.controlHeight}
            >
                <CheatedTypeComponent
                    // placeholder has to be set here and not in commonDefaultProps
                    // for Polyglot to be initialized before using t()
                    placeholder={placeholder}
                    {...props}
                    label={props.label}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={onChange}
                    // adjust theme regarding passed props
                    theme={themeToApply}
                    // apply passed styles over our default styles
                    styles={stylesToApply}
                    components={{IndicatorsContainer, Option: CustomOption, ...props.components}}
                    ref={ref}
                />
                {props.label && (
                    <Label
                        label={props.label}
                        htmlFor={props.id}
                        error={props.error ?? false}
                        success={props.success ?? false}
                        required={props.required ?? false}
                        disabled={props.isDisabled ?? false}
                        focused={focused}
                        filled={filled}
                    />
                )}
            </Box>
            {props.error && typeof props.error === "string" && (
                <ErrorMessage error={props.error} />
            )}
        </>
    );
}

// We need this typing hack because forwardRef doesn't support generic types
export const BaseSelectComponent = forwardRef(_BaseSelectComponent) as <
    OptionType extends OptionTypeBase,
    IsMulti extends boolean,
    ComponentProps extends BaseComponentProps<OptionType, IsMulti> = BaseComponentProps<
        OptionType,
        IsMulti
    >,
>(
    props: Parameters<typeof _BaseSelectComponent<OptionType, IsMulti, ComponentProps>>[0] & {
        ref?: Ref<any>;
    }
) => ReturnType<typeof _BaseSelectComponent<OptionType, IsMulti, ComponentProps>>;
