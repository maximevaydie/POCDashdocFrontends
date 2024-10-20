import {css} from "@emotion/react";
import React from "react";

import {Box} from "../../Elements/layout/Box";
import {ClickableBox} from "../../Elements/layout/ClickableBox";

import {TabProps} from "./types";

export function DefaultTab({children, active, testId, onClick}: TabProps) {
    return onClick ? (
        <ClickableBox
            onClick={onClick}
            px={3}
            pt={2}
            pb={1}
            borderBottom="2px solid"
            mb="-1px"
            color={active ? "blue.default" : "grey.dark"}
            borderColor={active ? "blue.default" : "transparent"}
            fontWeight="bold"
            hoverStyle={{
                backgroundColor: active ? "transparent" : "grey.ultralight",
                borderColor: active ? "blue.default" : "grey.dark",
            }}
            data-testid={testId}
            aria-selected={active}
        >
            {children}
        </ClickableBox>
    ) : (
        <Box
            px={3}
            pt={2}
            pb={1}
            borderBottom="2px solid"
            mb="-1px"
            color={active ? "blue.default" : "grey.dark"}
            borderColor={active ? "blue.default" : "transparent"}
            fontWeight={active ? "bold" : "normal"}
            data-testid={testId}
            css={css`
                cursor: ${active ? "default" : "not-allowed"};
            `}
            aria-selected={active}
        >
            {children}
        </Box>
    );
}
