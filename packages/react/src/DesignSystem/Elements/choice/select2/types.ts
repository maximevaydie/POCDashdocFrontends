import {IconProps} from "@dashdoc/web-ui";
import {Stringifiable} from "dashdoc-utils";
import {
    ActionMeta,
    InputActionMeta,
    OptionProps,
    OptionTypeBase,
    NamedProps as ReactSelectProps,
    SingleValueProps,
} from "react-select";
import {AsyncProps} from "react-select/async";
import {CreatableProps} from "react-select/creatable";
import {
    ComponentProps as ReactSelectAsyncPaginatedComponentProps,
    UseAsyncPaginateParams,
} from "react-select-async-paginate";

import {InputProps} from "../../input/input2/Input";

// Export option types for convenience
/**Base values for select options.*/
type SelectOptionBaseValue = string | number | boolean;

/**The option for our select components.
 * It's  basically any dict with potentially a  string label and a value of some type
 * By default the value is standard string | number | bool. */
export interface SelectOption<TValue = SelectOptionBaseValue> extends OptionTypeBase {
    label?: string;
    value?: TValue;
}

/** A basic select option, used as a default by react-select. */
export type SimpleOption<TValue = string> = {label: string; value: TValue};

export type SelectOptions<TValue = SelectOptionBaseValue> = SelectOption<TValue>[];

export type SelectActionMeta<TValue = SelectOptionBaseValue> = ActionMeta<SelectOption<TValue>>;
export type SelectInputActionMeta = InputActionMeta;

// Export selectComponents props types
export type SelectOptionProps<
    OptionType extends OptionTypeBase = SelectOption,
    IsMulti extends boolean = false,
> = OptionProps<OptionType, IsMulti> & OptionType;

export type SelectSingleValueProps<OptionType extends OptionTypeBase = SelectOption> =
    SingleValueProps<OptionType>;

/**
 * Common props for all our select components.
 */
export type CommonProps = Pick<InputProps, "label" | "required" | "error" | "success"> & {
    "data-testid"?: string;
};

export type SelectProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> = CommonProps &
    ReactSelectProps<OptionType, IsMulti> & {
        iconName?: IconProps["name"] | null;
        iconColor?: IconProps["color"];
        tooltipContent?: string;
        tooltipPosition?: "auto" | "top" | "bottom" | "left" | "right";
    };

export type CreatableSelectProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> = SelectProps<OptionType, IsMulti> & CreatableProps<OptionType, IsMulti>;

export type AsyncSelectProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> = SelectProps<OptionType, IsMulti> & AsyncProps<OptionType>;

export type AsyncCreatableSelectProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> = SelectProps<OptionType, IsMulti> &
    CreatableProps<OptionType, IsMulti> &
    AsyncProps<OptionType>;

export type AsyncPaginatedSelectProps<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> = CommonProps &
    Omit<
        AsyncSelectProps<OptionType, IsMulti>,
        "options" | "loadOptions" | "defaultOptions" | "loadOptionsOnMenuOpen"
    > &
    ReactSelectAsyncPaginatedComponentProps &
    UseAsyncPaginateParams<
        OptionType,
        {page: number} & Record<string, Stringifiable | readonly Stringifiable[]>
    >;
