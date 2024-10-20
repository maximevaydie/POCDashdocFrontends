import {t} from "@dashdoc/web-core";
import {Box, Card, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import React, {forwardRef} from "react";

export const EmptyPreparedTrips = forwardRef<any, {isDraggingOver: boolean}>(
    ({isDraggingOver}, ref) => {
        const indications = [
            t("preparedTrips.emptyList.indication1"),
            t("preparedTrips.emptyList.indication2"),
            t("preparedTrips.emptyList.indication3"),
        ];
        return (
            <Card
                p={5}
                ref={ref}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                backgroundColor={isDraggingOver ? theme.colors.blue.ultralight : "grey.white"}
                data-testid="empty-prepared-trips"
            >
                <Icon name="trip" color="grey.light" fontSize={"60px"} />
                <Box mt={2}>
                    <Text variant="h2" m={2}>
                        {t("preparedTrips.emptyList.mainIndication")}
                    </Text>
                    {indications.map((indication, index) => (
                        <Flex key={index} m={2}>
                            <Flex
                                mr={4}
                                borderRadius="50%"
                                backgroundColor="grey.light"
                                color="grey.dark"
                                fontSize={2}
                                alignItems="center"
                                justifyContent="center"
                                minWidth="30px"
                                minHeight="30px"
                                width="30px"
                                height="30px"
                            >
                                {index + 1}
                            </Flex>
                            <Text color="grey.dark">{indication}</Text>
                        </Flex>
                    ))}
                </Box>
            </Card>
        );
    }
);
EmptyPreparedTrips.displayName = "EmptyPreparedTrips";
