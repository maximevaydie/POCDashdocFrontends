import {css} from "@emotion/react";
import React from "react";

import {Box} from "../../Elements/layout/Box";
import {ClickableBox} from "../../Elements/layout/ClickableBox";

import {TabProps} from "./types";

export function CustomTab({children, active, index, testId, onClick}: TabProps) {
    return onClick ? (
        <ClickableBox
            onClick={onClick}
            hoverStyle={{bg: "none"}}
            data-testid={testId}
            aria-selected={active}
            borderBottom="1px solid"
            borderColor={active ? "grey.white" : "transparent"}
            mb="-1px"
            ml={index > 0 ? 3 : 0}
            mr={3}
        >
            {children}
        </ClickableBox>
    ) : (
        <Box
            data-testid={testId}
            css={css`
                cursor: ${active ? "default" : "not-allowed"};
            `}
            aria-selected={active}
            mb="-1px"
            mx={3}
        >
            {children}
        </Box>
    );
}
