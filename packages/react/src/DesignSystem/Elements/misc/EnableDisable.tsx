import React, {FunctionComponent, ReactNode} from "react";

import {TooltipWrapper} from "../base/TooltipWrapper";
import {Flex} from "../layout/Flex";

export const EnableDisable: FunctionComponent<{
    children: ReactNode;
    disabled: boolean;
    tooltip?: string;
}> = ({disabled, tooltip, children}) => {
    const content = (
        <Flex
            style={
                disabled
                    ? {
                          pointerEvents: "none",
                          opacity: "0.5",
                          filter: "saturate(40%) brightness(130%)",
                      }
                    : {}
            }
        >
            {children}
        </Flex>
    );

    return tooltip && disabled ? (
        <TooltipWrapper content={tooltip}>{content}</TooltipWrapper>
    ) : (
        content
    );
};
