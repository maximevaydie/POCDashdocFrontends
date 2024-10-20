import React, {forwardRef, useMemo} from "react";

import {BoxProps} from "../../../Elements/layout/Box";
import {Input, InputProps} from "../input2/Input";

import {getDerivedPropsFromType, TextInputType} from "./getDerivedPropsFromType";

export type TextInputProps = BoxProps &
    Omit<InputProps, "type" | "as" | "onChange"> & {
        type?: TextInputType;
        onChange: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
    };

function _TextInput(props: TextInputProps, ref: React.Ref<HTMLInputElement>) {
    // props to be intercepted and not passed to <input />
    const {type, ...inputProps} = props;

    // props derived from passed props
    const derivedProps = useMemo(() => getDerivedPropsFromType(type), [type]);

    return <Input {...derivedProps} {...inputProps} ref={ref} />;
}
_TextInput.displayName = "TextInput";

export const TextInput = forwardRef(_TextInput);
