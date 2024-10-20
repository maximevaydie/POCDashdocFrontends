import {t} from "@dashdoc/web-core";
import {Callout, Flex, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

type LoadRecapProps = {
    title: string;
    info: string;
    load: string;
};
export const LoadRecap: FunctionComponent<LoadRecapProps> = ({title, info, load}) => {
    return (
        <Callout iconDisabled>
            <Flex style={{gap: "8px"}}>
                <Flex flexDirection="column" flexGrow={1}>
                    <Text mb={1}>{title}</Text>
                    <Text variant="caption" color="grey.dark">
                        {info}
                    </Text>
                </Flex>
                <Flex
                    flexDirection="column"
                    flex={1}
                    overflow="hidden"
                    minWidth="100px"
                    justifyContent="center"
                >
                    <Text variant="caption">{t("activityLoads.planned")}</Text>
                    <Text fontWeight="bold">{load ? load : t("common.unspecified")}</Text>
                </Flex>
            </Flex>
        </Callout>
    );
};
