import {t} from "@dashdoc/web-core";
import {Badge, ClickableFlex, Flex, Icon, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

export function VariablesList({onClick}: {onClick: (id: string) => void}) {
    const variablesList = getNumberingVariablesList();
    return (
        <Flex flexDirection="column" mt={1}>
            <Flex alignItems={"flex-start"} mb={1}>
                {t("invoiceNumberingSettings.availableVariables")}
                <TooltipWrapper
                    content={t("invoiceNumberingSettings.variableTooltip")}
                    placement="right"
                >
                    <Icon ml={1} name="questionCircle" />
                </TooltipWrapper>
            </Flex>
            <Flex color="grey.ultradark" flexDirection="row" alignItems="center">
                {variablesList.map(({id, label}) => {
                    return (
                        <>
                            <ClickableFlex
                                key={id}
                                color="blue.default"
                                fontSize="12px"
                                onClick={() => {
                                    onClick(id);
                                }}
                                borderRadius={1}
                                mr={1}
                            >
                                <Badge shape="squared">
                                    <Icon name="add" mr={2} />
                                    {label}
                                </Badge>
                            </ClickableFlex>
                        </>
                    );
                })}
            </Flex>
        </Flex>
    );
}

export function getNumberingVariablesList() {
    return [
        {
            id: "year",
            label: t("invoiceNumberingSettings.year"),
        },
        {
            id: "month",
            label: t("invoiceNumberingSettings.month"),
        },
    ];
}
