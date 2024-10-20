import {Flex, Text, FlexProps} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export type CircledProps = FlexProps & {
    hasBorder?: boolean;
    hasBackground?: boolean;
};

export const Circled: FunctionComponent<CircledProps> = ({
    hasBorder = true,
    hasBackground = false,
    children,
    ...props
}) => {
    let flexStyle: FlexProps = {borderColor: "grey.light"};
    let childrenContent = children;
    if (typeof children === "string") {
        childrenContent = (
            <Text variant="h1" color="grey.dark">
                {children}
            </Text>
        );
    }

    return (
        <Flex
            width="2.3em"
            height="2.3em"
            borderRadius="100%"
            alignItems="center"
            justifyContent="center"
            border={hasBorder ? (hasBackground ? "2px solid" : "1px solid") : "none"}
            boxShadow={hasBorder ? "small" : "none"}
            {...flexStyle}
            {...props}
        >
            {childrenContent}
        </Flex>
    );
};
