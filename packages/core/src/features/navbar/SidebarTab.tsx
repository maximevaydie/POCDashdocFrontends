import {t} from "@dashdoc/web-core";
import {
    Box,
    ClickableFlex,
    Flex,
    Icon,
    IconNames,
    BoxProps,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import isNil from "lodash.isnil";
import React from "react";

import {CountBadge} from "./CountBadge";

type Props = BoxProps & {
    activeCategory?: boolean;
    active?: boolean;
    icon?: IconNames;
    isNew?: boolean;
    label?: string;
    displaySmall?: boolean; // or collapsedSidebar
    openedSidebar: boolean;
    closeSidebar: () => void;
    onClick?: (event: React.MouseEvent) => void;
    count?: number;
    countImportant?: boolean;
    countAlert?: boolean;
    showChildren?: boolean;
    children: React.ReactNode;
};

export function SidebarTab({
    activeCategory,
    active,
    icon,
    label,
    displaySmall,
    openedSidebar,
    closeSidebar,
    onClick,
    count,
    countImportant,
    countAlert,
    children,
    isNew,
    showChildren,
    ...boxProps
}: Props) {
    const displayActiveBar = active || (displaySmall && activeCategory);

    return (
        <TooltipWrapper content={label} hidden={!displaySmall || showChildren} placement="right">
            <Flex
                my={1}
                onClick={(event) => {
                    onClick?.(event);
                    if (openedSidebar) {
                        closeSidebar();
                    }
                }}
            >
                {displayActiveBar && (
                    <Box
                        width={3}
                        backgroundColor="blue.dark"
                        borderTopRightRadius={1}
                        borderBottomRightRadius={1}
                    />
                )}

                <ClickableFlex
                    width="100%"
                    backgroundColor={displayActiveBar ? "blue.ultralight" : "transparent"}
                    hoverStyle={{bg: "grey.light"}}
                    py={2}
                    px={displaySmall ? 1 : 3}
                    mr={2}
                    ml={displayActiveBar ? "5px" : 2}
                    borderRadius={1}
                    justifyContent={displaySmall ? "center" : "normal"}
                    {...boxProps}
                >
                    <Flex justifyContent="space-between" width="100%">
                        <Flex alignItems="center">
                            {icon && (
                                <Icon
                                    display="block"
                                    color={active || activeCategory ? "blue.dark" : "grey.dark"}
                                    name={icon}
                                    mr={displaySmall ? 0 : 2}
                                />
                            )}
                            {label && (
                                <Text
                                    color={active ? "blue.dark" : "grey.dark"}
                                    display={["block", displaySmall ? "none" : "block"]}
                                >
                                    {label}
                                </Text>
                            )}
                        </Flex>
                        {isNew && label && !displaySmall && <NewBadge />}
                        {!active && !displaySmall && !isNil(count) && (
                            <CountBadge
                                // @ts-ignore
                                important={countImportant && count !== 0}
                                alert={countAlert && count !== 0}
                                mr={0}
                            >
                                {count}
                            </CountBadge>
                        )}
                    </Flex>
                    {isNew && !label && !displaySmall ? (
                        <Flex justifyContent="space-between" width="100%" alignItems="center">
                            {children}
                            <NewBadge />
                        </Flex>
                    ) : (
                        children
                    )}
                </ClickableFlex>
            </Flex>
        </TooltipWrapper>
    );
}

const NewBadge = () => {
    return (
        <Box
            bg="blue.ultralight"
            borderRadius="4px"
            border="1px solid"
            borderColor="blue.dark"
            px="3"
            py="1"
            color="blue.dark"
            fontSize="12px"
        >
            {t("common.new")}
        </Box>
    );
};
