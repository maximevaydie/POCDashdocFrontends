import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import React from "react";

export function EmptyAssignationHistory() {
    return (
        <Flex flexDirection="column" alignItems="center" mt={10}>
            <Icon
                name="emptyAssignationHistory"
                width={150}
                height={180}
                color="grey.light"
                svgWidth={"100%"}
                svgHeight={"100%"}
            />
            <Text my={4} textAlign={"center"} variant="h1">
                {t("assignationHistory.noHistory")}
            </Text>
            <Text textAlign={"center"}>{t("assignationHistory.subcontractSameTransports")}</Text>
        </Flex>
    );
}
