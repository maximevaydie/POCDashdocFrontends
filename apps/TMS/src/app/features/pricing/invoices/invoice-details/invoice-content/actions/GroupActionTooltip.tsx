import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

export function GroupActionTooltip() {
    return (
        <Flex pl={2}>
            <TooltipWrapper
                placement="top"
                content={
                    <Flex flexDirection="column" ml={-5} mb={-3} maxWidth={"400px"}>
                        <ul>
                            <li>
                                <Text>{t("groupActionTooltip.default")}</Text>
                            </li>
                            <li>
                                <Text>{t("groupActionTooltip.group")}</Text>
                            </li>
                            <li>
                                <Text>{t("groupActionTooltip.merge")}</Text>
                            </li>
                        </ul>
                    </Flex>
                }
                boxProps={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                }}
            >
                <Icon name={"info"} color="grey.dark" />
            </TooltipWrapper>
        </Flex>
    );
}
