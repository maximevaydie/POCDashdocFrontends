import {Logger, t} from "@dashdoc/web-core";
import {Flex, Text, FlexProps, TextProps} from "@dashdoc/web-ui";
import React, {Fragment, FunctionComponent, ReactNode} from "react";

export type NoDataPlaceholderProps = FlexProps & {
    content?: ReactNode;
};

const PlaceholderText: FunctionComponent<TextProps> = (props) => (
    <Text textAlign="center" {...props} />
);

export const NoDataPlaceholder: FunctionComponent<NoDataPlaceholderProps> = ({
    content,
    ...flexProps
}) => {
    let placeholder = content;

    if (!placeholder) {
        try {
            placeholder = t("charts.noData");
        } catch (error) {
            placeholder = "No data to display";
            Logger.warn("Polyglot not initialized in chart");
        }
    }

    const PlaceholderContainer = typeof placeholder === "string" ? PlaceholderText : Fragment;

    return (
        <Flex flexDirection="column" alignItems="center" justifyContent="center" {...flexProps}>
            <PlaceholderContainer>{placeholder}</PlaceholderContainer>
        </Flex>
    );
};
