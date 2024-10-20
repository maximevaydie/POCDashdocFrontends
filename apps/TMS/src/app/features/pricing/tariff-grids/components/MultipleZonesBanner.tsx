import {t} from "@dashdoc/web-core";
import {Button, Callout, Flex, Text} from "@dashdoc/web-ui";
import React from "react";

type MultipleZonesBannerProps = {
    dataTestId?: string;
    onClick: () => void;
};

export const MultipleZonesBanner = ({dataTestId, onClick}: MultipleZonesBannerProps) => {
    return (
        <Callout mb={1} p={1} pl={3} variant="secondary" data-testid={dataTestId}>
            <Flex alignItems={"center"}>
                <Text color="blue.dark" flex={1}>
                    {t("tariffGrids.multipleZonesDetected")}
                </Text>
                <Button
                    ml={1}
                    variant="plain"
                    onClick={onClick}
                    data-testid={`${dataTestId ?? ""}-display-button`}
                >
                    {t("common.display")}
                </Button>
            </Flex>
        </Callout>
    );
};
