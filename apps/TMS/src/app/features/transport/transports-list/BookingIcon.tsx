import {t} from "@dashdoc/web-core";
import {Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

type Props = {withTooltip?: boolean};

export function BookingIcon({withTooltip = true}: Props) {
    return (
        <TooltipWrapper content={withTooltip ? t("transportForm.bookingNeeded") : null}>
            <Icon
                name="calendar"
                color="red.default"
                mx={1}
                scale={[0.7, 0.7]}
                backgroundColor="red.ultralight"
                p="2px"
                lineHeight={"0px"}
                borderRadius="50%"
            />
        </TooltipWrapper>
    );
}
