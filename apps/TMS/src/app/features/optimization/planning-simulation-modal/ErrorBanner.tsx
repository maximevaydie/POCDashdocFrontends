import {t} from "@dashdoc/web-core";
import {Flex, Text, Icon, Box} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

interface ErrorBannerProps {
    color: string;
    errors: string[];
}

export const ErrorBanner: FunctionComponent<ErrorBannerProps> = ({color, errors}) => {
    return (
        <Flex
            mb={2}
            border="1px solid"
            borderColor={`${color}.dark`}
            backgroundColor={`${color}.ultralight`}
            color={`${color}.dark`}
        >
            <Icon name="alert" m={2} />
            <Box>
                <Text color="inherit" fontWeight="bold">
                    {t("optimization.incompleteEstimate")}
                </Text>
                <Text color="inherit">
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </Text>
            </Box>
        </Flex>
    );
};
