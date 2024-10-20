import {Box, Flex, Icon, Text} from "@dashdoc/web-ui";
import {FullHeightMinWidthScreen, Screen} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";
import {Link, LinkProps} from "react-router-dom";

import {TabTitle} from "./TabTitle";

type SimpleScreenProps = {
    title: string;
    customTitle?: string;
    ellipsisTitle?: boolean;
    getCustomTitleWrapper?: (title: React.ReactNode) => React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
    ["data-testid"]?: string;
    shrinkScreen?: boolean;
};
type ScreenWithBackLinkProps = SimpleScreenProps & {
    backToLabel: React.ReactText;
    backTo: LinkProps["to"];
};
type ScreenProps = SimpleScreenProps | ScreenWithBackLinkProps;
export const CommonScreen: FunctionComponent<ScreenProps> = ({
    children,
    actions,
    getCustomTitleWrapper = (title) => title,
    shrinkScreen,
    ...props
}) => {
    const title = (
        <TabTitle
            title={props.title}
            customTitle={props.customTitle}
            ellipsis={props.ellipsisTitle}
        />
    );
    let wrappedTitle = getCustomTitleWrapper(title);
    let backToElem = null;
    if ("backTo" in props) {
        backToElem = (
            <Box>
                <Link to={props.backTo}>
                    <Flex alignItems="center">
                        <Icon name={"arrowLeftFull"} pr={2} />
                        <Text mb="2px" fontWeight={600} color="blue.default">
                            {props.backToLabel}
                        </Text>
                    </Flex>
                </Link>
            </Box>
        );
    }
    const ScreenComponent = shrinkScreen ? Screen : FullHeightMinWidthScreen;

    return (
        <ScreenComponent
            p={4}
            data-testid={props["data-testid"] ?? "common-screen"}
            minWidth={shrinkScreen ? 0 : undefined}
            flex={1}
        >
            {backToElem}
            <Flex justifyContent="flex-end" alignItems="center" mb={4} flexWrap="wrap">
                {wrappedTitle}
                <Flex flex={1}></Flex>
                <Box height="100%">{actions}</Box>
            </Flex>
            {children}
        </ScreenComponent>
    );
};
