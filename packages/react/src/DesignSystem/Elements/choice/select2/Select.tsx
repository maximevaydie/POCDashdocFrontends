import {t} from "@dashdoc/web-core";
import React, {forwardRef, ForwardRefExoticComponent, Ref} from "react";
import ReactSelect, {OptionTypeBase} from "react-select";
import ReactSelectAsync from "react-select/async";
import ReactSelectAsyncCreatable from "react-select/async-creatable";
import ReactSelectCreatable from "react-select/creatable";
import {AsyncPaginate as ReactSelectAsyncPaginated} from "react-select-async-paginate";

import {BaseSelectComponent} from "./BaseComponent";
import {ReactSelectAsyncPaginatedCreatable} from "./reactSelectComponents";
import {
    AsyncCreatableSelectProps,
    AsyncPaginatedSelectProps,
    AsyncSelectProps,
    CreatableSelectProps,
    SelectProps,
    SimpleOption,
} from "./types";

export {mergeStyles as mergeSelectStyles, components as selectComponents} from "react-select";
export * from "./types";
export {
    AsyncCreatableSelect,
    AsyncPaginatedCreatableSelect,
    AsyncPaginatedSelect,
    AsyncSelect,
    CreatableSelect,
};

// Export main components
const commonDefaultProps = {
    openMenuOnFocus: true,
    loadingMessage: () => t("common.loading"),
    noOptionsMessage: () => t("common.noResultFound"),
    classNamePrefix: "Select",
    isClearable: true,
} as const;
const selectDefaultProps = {
    ...commonDefaultProps,
} as const;
const createSelectDefaultProps = {
    ...commonDefaultProps,
    createOptionPosition: "first",
} as const;
const asyncSelectDefaultProps = {
    ...commonDefaultProps,
};
const asyncCreatableSelectDefaultProps = {
    ...commonDefaultProps,
    ...createSelectDefaultProps,
} as const;
const asyncPaginatedSelectDefaultProps = {
    ...commonDefaultProps,
    additional: {page: 1},
    defaultAdditional: {page: 1},
    loadOptionsOnMenuOpen: true,
} as const;

const _Select = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: SelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelect<OptionType, IsMulti>}
        ref={ref}
        // placeholder has to be set here and not in commonDefaultProps
        // for Polyglot to be initialized before using t()
        styles={{
            menu: (base) => ({
                ...base,
                minWidth: 200,
            }),
            ...props.styles,
        }}
        {...selectDefaultProps}
        {...props}
    />
);

// We need this typing hack because forwardRef doesn't support generic types
export const Select = forwardRef(_Select) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _Select<OptionType, IsMulti>>[0] & {ref?: Ref<any>}
) => ReturnType<typeof _Select<OptionType, IsMulti>>;
(Select as ForwardRefExoticComponent<unknown>).displayName = "Select";

const _CreatableSelect = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: CreatableSelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelectCreatable<OptionType, IsMulti>}
        ref={ref}
        styles={{
            menu: (base) => ({
                ...base,
                minWidth: 200,
            }),
            ...props.styles,
        }}
        {...createSelectDefaultProps}
        {...props}
    />
);

// We need this typing hack because forwardRef doesn't support generic types
const CreatableSelect = forwardRef(_CreatableSelect) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _CreatableSelect<OptionType, IsMulti>>[0] & {ref?: Ref<any>}
) => ReturnType<typeof _CreatableSelect<OptionType, IsMulti>>;
(CreatableSelect as ForwardRefExoticComponent<unknown>).displayName = "CreatableSelect";

const _AsyncSelect = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: AsyncSelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelectAsync<OptionType, IsMulti>}
        ref={ref}
        styles={{
            menu: (base) => ({
                ...base,
                minWidth: 200,
            }),
            ...props.styles,
        }}
        {...asyncSelectDefaultProps}
        {...props}
    />
);

// We need this typing hack because forwardRef doesn't support generic types
const AsyncSelect = forwardRef(_AsyncSelect) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _AsyncSelect<OptionType, IsMulti>>[0] & {ref?: Ref<any>}
) => ReturnType<typeof _AsyncSelect<OptionType, IsMulti>>;

(AsyncSelect as ForwardRefExoticComponent<unknown>).displayName = "AsyncSelect";

const _AsyncCreatableSelect = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: AsyncCreatableSelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelectAsyncCreatable<OptionType, IsMulti>}
        ref={ref}
        styles={{
            menu: (base) => ({
                ...base,
                minWidth: 200,
            }),
            ...props.styles,
        }}
        {...asyncCreatableSelectDefaultProps}
        {...props}
    />
);
// We need this typing hack because forwardRef doesn't support generic types
const AsyncCreatableSelect = forwardRef(_AsyncCreatableSelect) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _AsyncCreatableSelect<OptionType, IsMulti>>[0] & {ref?: Ref<any>}
) => ReturnType<typeof _AsyncCreatableSelect<OptionType, IsMulti>>;
(AsyncCreatableSelect as ForwardRefExoticComponent<unknown>).displayName = "AsyncCreatableSelect";

const _AsyncPaginatedSelect = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: AsyncPaginatedSelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelectAsyncPaginated}
        selectRef={ref}
        styles={{
            menu: (base) => ({
                ...base,
                minWidth: 200,
            }),
            ...props.styles,
        }}
        {...asyncPaginatedSelectDefaultProps}
        {...props}
    />
);
// We need this typing hack because forwardRef doesn't support generic types
const AsyncPaginatedSelect = forwardRef(_AsyncPaginatedSelect) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _AsyncPaginatedSelect<OptionType, IsMulti>>[0] & {ref?: Ref<any>}
) => ReturnType<typeof _AsyncPaginatedSelect<OptionType, IsMulti>>;

(AsyncPaginatedSelect as ForwardRefExoticComponent<unknown>).displayName = "AsyncPaginatedSelect";

const _AsyncPaginatedCreatableSelect = <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: CreatableSelectProps<OptionType, IsMulti> &
        AsyncPaginatedSelectProps<OptionType, IsMulti>,
    ref: Ref<any>
) => (
    <BaseSelectComponent<OptionType, IsMulti>
        Component={ReactSelectAsyncPaginatedCreatable}
        selectRef={ref}
        {...createSelectDefaultProps}
        {...asyncPaginatedSelectDefaultProps}
        {...props}
    />
);
// We need this typing hack because forwardRef doesn't support generic types
const AsyncPaginatedCreatableSelect = forwardRef(_AsyncPaginatedCreatableSelect) as <
    OptionType extends OptionTypeBase = SimpleOption,
    IsMulti extends boolean = boolean,
>(
    props: Parameters<typeof _AsyncPaginatedCreatableSelect<OptionType, IsMulti>>[0] & {
        ref?: Ref<any>;
    }
) => ReturnType<typeof _AsyncPaginatedCreatableSelect<OptionType, IsMulti>>;

(AsyncPaginatedCreatableSelect as ForwardRefExoticComponent<unknown>).displayName =
    "AsyncPaginatedCreatableSelect";
