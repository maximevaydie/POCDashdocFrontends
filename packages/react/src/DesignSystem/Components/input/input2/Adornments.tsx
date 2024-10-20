import styled from "@emotion/styled";

import {Icon} from "../../icon";
import {Text} from "../../Text";
import {theme} from "../../../Elements/theme";
import {themeAwareCss} from "../../../Elements/utils";

const InputIcon = styled(Icon)({
    position: "absolute",
    pointerEvents: "none",
    top: "50%",
    transform: "translateY(-50%)",
});

export const LeftIcon = styled(InputIcon)(
    themeAwareCss({
        left: 4,
    })
);

export const RightIcon = styled(InputIcon)(
    themeAwareCss({
        right: 4,
    })
);

export const LeftIconWithTooltip = styled(LeftIcon)(
    themeAwareCss({
        pointerEvents: "auto",
    })
);

export const RightIconWithTooltip = styled(RightIcon)(
    themeAwareCss({
        pointerEvents: "auto",
    })
);

type RightUnits = {
    filled: boolean;
    focused: boolean;
    error: string | boolean;
    warning: boolean;
    disabled: boolean;
    withLabel?: boolean;
};

export const RightUnits = styled(Text)<RightUnits>(
    ({filled, focused, error, warning, disabled, withLabel}) =>
        themeAwareCss({
            fontFamily: "primary",
            color: "grey.ultradark",
            fontSize: 2,
            pointerEvents: "none",
            boxShadow: `${theme.colors.grey.white} -4px 0px 0px`,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            ...(error && {
                boxShadow: `${theme.colors.red.ultralight} -4px 0px 0px`,
            }),
            ...(warning && {
                boxShadow: `${theme.colors.yellow.ultralight} -4px 0px 0px`,
            }),
            ...(disabled && {
                boxShadow: `${theme.colors.grey.ultralight} -4px 0px 0px`,
                color: "grey.dark",
            }),
            transition: "padding-top 0.2s ease-out",
            ...((filled || focused) &&
                withLabel && {
                    pt: 4,
                }),
        })
);
