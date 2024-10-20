import {BoxProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

import {Input, InputProps} from "./input2/Input";

export type TextAreaProps = BoxProps &
    Omit<React.HTMLProps<HTMLTextAreaElement>, "as" | "onChange"> &
    Omit<
        InputProps,
        | "type"
        | "leftIcon"
        | "leftIconColor"
        | "rightIcon"
        | "rightIconColor"
        | "rightTooltipContent"
        | "as"
    >; // icons are not supported yet

export const TextArea: FunctionComponent<TextAreaProps> = (props) => (
    <Input as="textarea" css={{resize: "vertical"}} {...props} />
);
