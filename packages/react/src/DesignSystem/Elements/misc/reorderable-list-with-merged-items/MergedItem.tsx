import {Flex, IconButton} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

type Props = {
    isCollapsed: boolean;
    setCollapsed: () => void;
    showCollapsedIcon?: boolean;
    children: ReactNode;
};
export function MergedItemSection({
    isCollapsed,
    setCollapsed,
    showCollapsedIcon,
    children,
}: Props) {
    const collapseActivities = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setCollapsed();
    };
    return (
        <Flex flex={1} m={-2} ml={-3} position="relative">
            <Flex width="100%" p={2} pl={3} alignItems="center" height="100%">
                {children}
            </Flex>
            {showCollapsedIcon && (
                <Flex alignItems="center" position="absolute" right="-37px" top={0} bottom={0}>
                    <IconButton
                        name={isCollapsed ? "arrowRight" : "arrowDown"}
                        onClick={collapseActivities}
                        scale={[1.4, 1.4]}
                        color="grey.default"
                    />
                </Flex>
            )}
        </Flex>
    );
}
