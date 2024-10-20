import {Box, BoxProps} from "@dashdoc/web-ui";
import {theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import React, {FC} from "react";

type CompanySwitcherContainer = BoxProps & {
    isOpenable: boolean;
    displaySmall: boolean;
    children: React.ReactNode;
    onClick?: () => void;
};

export const CompanySwitcherContainer: FC<CompanySwitcherContainer> = ({
    children,
    isOpenable,
    displaySmall,
    onClick,
    ...boxProps
}) => {
    return (
        <Box
            fontSize={2}
            px={displaySmall ? 3 : 4}
            py={[3, displaySmall ? 3 : 5]}
            position="relative"
            verticalAlign="middle"
            css={css`
                cursor: ${isOpenable ? "pointer" : "default"};
                &:hover {
                    background: ${isOpenable ? theme.colors.grey.light : "inherit"};
                }
            `}
            onClick={onClick}
            borderBottom="1px solid"
            borderColor="grey.light"
            {...boxProps}
        >
            {children}
        </Box>
    );
};
