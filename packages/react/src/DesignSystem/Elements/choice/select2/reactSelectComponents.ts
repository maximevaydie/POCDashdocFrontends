import {ComponentProps} from "react";
import ReactSelect, {OptionTypeBase} from "react-select";
import ReactSelectAsync from "react-select/async";
import ReactSelectAsyncCreatable from "react-select/async-creatable";
import ReactSelectCreatable from "react-select/creatable";
import {
    AsyncPaginate as ReactSelectAsyncPaginated,
    withAsyncPaginate,
} from "react-select-async-paginate";

export const ReactSelectAsyncPaginatedCreatable = withAsyncPaginate(ReactSelectCreatable);

/**The type of all react select component we may use */
export type ReactSelectComponents<
    OptionType extends OptionTypeBase = OptionTypeBase,
    IsMulti extends boolean = boolean,
> =
    | typeof ReactSelect<OptionType, IsMulti>
    | typeof ReactSelectCreatable<OptionType, IsMulti>
    | typeof ReactSelectAsync<OptionType, IsMulti>
    | typeof ReactSelectAsyncCreatable<OptionType, IsMulti>
    | typeof ReactSelectAsyncPaginated
    | typeof ReactSelectAsyncPaginatedCreatable;

export type ReactSelectStyles = ComponentProps<ReactSelectComponents>["styles"];
