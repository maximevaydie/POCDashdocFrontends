import {Flex, Icon, NoWrap, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export const ErrorMessage: FunctionComponent<{
    message: string;
    withIcon?: boolean;
    ["data-testid"]?: string;
}> = ({message, withIcon = true, ...props}) => {
    return (
        <Flex
            alignItems="center"
            justifyContent="center"
            color="red.default"
            backgroundColor="red.ultralight"
            px={1}
            mb={1}
            borderRadius="4px"
            data-testid={props["data-testid"]}
        >
            {withIcon && <Icon name="alert" mr={1} fontSize={0} />}
            <Text variant="caption" color="red.default">
                <NoWrap>{message}</NoWrap>
            </Text>
        </Flex>
    );
};
