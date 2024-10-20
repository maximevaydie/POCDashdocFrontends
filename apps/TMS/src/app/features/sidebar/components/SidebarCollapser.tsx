import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React, {ReactNode, useContext} from "react";

import {CollapsedContext} from "../CollapsedContext";

export function SidebarCollapser({children}: {children: ReactNode}) {
    const {collapsed, setCollapsed} = useContext(CollapsedContext);
    return (
        <Flex
            flexDirection={collapsed ? "column-reverse" : "row"}
            alignItems={"center"}
            width="100%"
        >
            <Box flex={1}>{children}</Box>
            <Box
                id="collapse-toggle-button"
                display="none"
                borderBottom={collapsed ? "none" : "1px solid"}
                borderColor="grey.light"
                height={collapsed ? undefined : "100%"}
                alignItems="center"
            >
                <TooltipWrapper content={collapsed ? t("sidebar.open") : t("sidebar.close")}>
                    <Button
                        variant="plain"
                        size="xsmall"
                        onClick={() => {
                            setCollapsed(!collapsed);
                        }}
                        m={1}
                    >
                        <Icon
                            color="grey.dark"
                            name={collapsed ? "arrowDoubleRight" : "arrowDoubleLeft"}
                            scale={0.8}
                        />
                    </Button>
                </TooltipWrapper>
            </Box>
        </Flex>
    );
}
