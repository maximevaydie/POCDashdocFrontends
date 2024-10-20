import {getLocale, t} from "@dashdoc/web-core";
import {NumberParser} from "@internationalized/number";
import {useNumberField} from "@react-aria/numberfield";
import {useNumberFieldState} from "@react-stately/numberfield";
import isNil from "lodash.isnil";
import React, {FunctionComponent, useMemo, useRef, useState} from "react";

import {Input, InputProps} from "./input2/Input";

export type NumberInputProps = Omit<
    InputProps,
    "value" | "onChange" | "type" | "min" | "max" | "as"
> & {
    value: number | null;
    onChange: (value: number | null) => void; // Fired when the user leave focus
    onTransientChange?: (value: number | null) => void; // Fired as the user type, DO NOT transform the value you get from this event before assigning it to `value`; see `NumberInput` for more infos.
    min?: number;
    max?: number;
    maxDecimals?: number;
    error?: string;
};

/**
 * The number input parser is not flexible enough, and could reject a dot in french locale for example.
 * For user this was a pain as the dot is the decimal separator on keyboards.
 * We decided we could transform the dot into a comma to still have locale aware formatting.
 */
const onInputTransformationPerLocale: Partial<{[locale: string]: (value: string) => string}> = {
    fr: (value: string) => {
        // the dot is not used for thousands separator in French, thus can be safely used as decimal separator, which is the comma
        return value.replace(".", ",");
    },
    pl: (value: string) => {
        // the dot is not used for thousands separator in Polish, thus can be safely used as decimal separator, which is the comma
        return value.replace(".", ",");
    },
};

const transformInputPerLocale = (value: string, locale: string) => {
    const transformation = onInputTransformationPerLocale[locale];
    if (isNil(transformation)) {
        return value;
    }

    return transformation(value);
};

// InputHTMLAttributes.value is not only a string, although given `type="text"  it always will be. Sp you migh argue this function is
// useless other than proving TS we deal with all cases.
const mapValueToString = (value: string | readonly string[] | number): string => {
    if (typeof value === "string") {
        return value;
    } else if (Array.isArray(value)) {
        return value.join(", ");
    } else {
        return value.toString();
    }
};

// We don't use directly a <input />, but our own Input which has different props, this function map between those two.
const mapHtmlPropsToInputProps = (
    htmlProps: React.InputHTMLAttributes<HTMLInputElement>
): InputProps => {
    const {value, onChange, ...inputProps} = htmlProps;
    return {
        // @ts-ignore
        value: mapValueToString(value),
        // @ts-ignore
        onChange: (_: string, event: React.ChangeEvent<HTMLInputElement>) => onChange(event),
        ...inputProps,
    };
};

const getNumberInputTitle = (min?: number, max?: number) => {
    if (!isNil(min) && !isNil(max)) {
        return t("components.enterValueBetween", {min, max});
    } else if (!isNil(min)) {
        return t("components.enterValueGreaterEqual", {min});
    } else if (!isNil(max)) {
        return t("components.enterValueLessEqual", {max});
    } else {
        return t("components.enterANumber");
    }
};

type UseNumberInputProps = {
    ariaLabel: string;
    onChange: (value: number | null) => void;
    onTransientChange?: (value: number | null) => void;
    value: number | null;
    maxDecimals?: number;
    min?: number;
    max?: number;
};

type UseNumberInputResult = InputProps & {ref: React.RefObject<HTMLInputElement>};

const useNumberInput = ({
    onChange,
    onTransientChange,
    value,
    maxDecimals,
    min,
    max,
    ariaLabel,
}: UseNumberInputProps): UseNumberInputResult => {
    const locale = getLocale();
    const formatOptions = useMemo(
        () => ({
            maximumFractionDigits: maxDecimals,
        }),
        [maxDecimals]
    );

    const parser = useMemo(() => new NumberParser(locale, formatOptions), [locale, formatOptions]);

    const [focused, setFocused] = useState(false);

    // This is used to know if the props `value` changed
    const previousValue = useRef(value);

    // If `currentValue` changed, it will update the input value whether it's focused or not.
    // `transientValue` is the parsed value of the input, it's updated as the user type.
    const [currentValue, setCurrentValue] = useState(value);
    const [transientValue, setTransientValue] = useState(value);

    const differentNumbers = (a: number | null, b: number | null) => {
        // @ts-ignore
        return a !== b && (!isNaN(a) || !isNaN(b));
    };

    // If the props `value` changed and it's different than the current transient value (the one the user is typing),
    // we update the input value. If the user is focused on the input, this may create a bad UX, so we warn the developer.
    if (differentNumbers(value, previousValue.current)) {
        previousValue.current = value;
        if (differentNumbers(value, transientValue)) {
            setCurrentValue(value);
            setTransientValue(value);

            if (focused && onTransientChange) {
                // If you see this warning, this is likely that the props `value` was modified after the event onTransientChange was triggered.
                // The event `onTransientChange` is triggered when the user type something in the input, so the input is still focused;
                // for this reason, `value` should not be modified with anything bu the value passed by the onTransientChange event.
                // If you want to transform the value, do it on the event onChange, because it's only triggered when the user leave the focus.
                // eslint-disable-next-line no-console
                console.warn(
                    "Number input changed while focused, prefer to use onChange if the value may be transformed; only use onTransientChange if the value pass in props is the same as the one from the event.",
                    `Before: ${previousValue.current} => After: ${value}`
                );
            }
        }
    }

    // @ts-ignore
    const ref: React.RefObject<HTMLInputElement> = useRef<HTMLInputElement>();
    const state = useNumberFieldState({
        locale,
        formatOptions,
        onChange: (new_value_or_nan) => {
            const new_value = isNaN(new_value_or_nan) ? null : new_value_or_nan;

            // The user left the input, we update all values and trigger the event onChange.
            previousValue.current = new_value;
            setCurrentValue(previousValue.current);
            setTransientValue(previousValue.current);

            onChange(new_value);
        },
        minValue: min,
        maxValue: max,
        // @ts-ignore
        value: currentValue,
    });

    const {inputProps: htmlProps} = useNumberField(
        {
            onBlur: () => state.commit(),
            "aria-label": ariaLabel,
            onInput: () => {
                // @ts-ignore
                const new_value_or_nan = parser.parse(ref.current.value);
                const new_value = isNaN(new_value_or_nan) ? null : new_value_or_nan;

                setTransientValue(new_value);
                onTransientChange?.(new_value);
            },
            onFocusChange: (focused) => {
                setFocused(focused);
            },
        },
        {
            ...state,
            validate(value) {
                // validate is called after the user entered a value, and before it is displayed in the HTML
                // This function is in charge of accepting what the user pressed or not.
                return state.validate(transformInputPerLocale(value, locale));
            },
            setInputValue(value) {
                // setInputValue is called after the events have been validated and processed.
                // This actually apply the value to the input in the HTML.
                return state.setInputValue(transformInputPerLocale(value, locale));
            },
        },
        ref
    );

    const inputProps = mapHtmlPropsToInputProps(htmlProps);
    return {ref, ...inputProps} as UseNumberInputResult;
};

/**
 * NumberInput is a controlled input that format and parse the input based on the locale of the user.
 * If the value set in the props or received by one of the change events is null, this means the input is empty.
 *
 * - onChange is called when the user leave the focus. If the min or max value are set, the value is clamped to the range.
 * - onTransientChange is called when the user type something in the input. The input is not clamped.
 *
 * By default, choose onChange to set your internal state.
 * But if you want a nicer UX and want to update the UI as the user type, you can use onTransientChange. Be careful to not change
 * the value in the props other than the one received by the event, otherwise that means the input will changed as the user type it.
 * If you use onTransientChange, also use onChange, as the later will validate the input and clamp it to the range (if set).
 */
export const NumberInput: FunctionComponent<NumberInputProps> = (props) => {
    const {
        onBlur: userOnBlur,
        onFocus: userOnFocus,
        value,
        title,
        onChange,
        onTransientChange,
        min,
        max,
        maxDecimals,
        ...otherInputProps
    } = props;
    const inputProps = useNumberInput({
        ariaLabel: "", // FIXME: Add ariaLabel to the props and defined it on all use of Numberinput
        value: value === null ? NaN : value,
        onChange,
        onTransientChange,
        min,
        max,
        maxDecimals,
    });

    return (
        <Input
            title={title || getNumberInputTitle(min, max)}
            textAlign={"end"}
            {...inputProps}
            {...otherInputProps}
            onBlur={(e) => {
                inputProps.onBlur && inputProps.onBlur(e);
                userOnBlur && userOnBlur(e);
            }}
            onFocus={(e) => {
                inputProps.onFocus && inputProps.onFocus(e);
                userOnFocus && userOnFocus(e);
            }}
        />
    );
};
