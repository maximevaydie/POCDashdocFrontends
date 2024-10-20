import {Badge, CompanyAvatar, Text} from "@dashdoc/web-ui";
import React, {ComponentProps, FunctionComponent} from "react";

import {Box} from "../Box";
import {ClickableFlex} from "../ClickableFlex";
import {Flex} from "../Flex";

export type DecoratedSectionProps = {
    title: string;
    subTitle: React.ReactNode;
    logo?: string;
    richTitle?: React.ReactNode;
    children?: React.ReactNode;
    subTitleVariant?: "small" | "normal";
    fontColor?: string;
    clickable?: boolean;
    badgeLabel?: string;
    containerProps?: ComponentProps<typeof ClickableFlex>;
    avatar?: React.ReactNode;
    "data-testid"?: string;
};
export const DecoratedSection: FunctionComponent<DecoratedSectionProps> = ({
    title,
    richTitle,
    subTitle,
    logo,
    children,
    subTitleVariant = "normal",
    fontColor,
    clickable,
    badgeLabel,
    containerProps,
    avatar,
    "data-testid": dataTestId,
}) => {
    const fontSizeSubtitle = subTitleVariant === "normal" ? 1 : 0;
    const Container = clickable ? ClickableFlex : Flex;

    return (
        <Container
            pt={1}
            pb={1}
            alignItems="center"
            justifyContent="space-between"
            style={{gap: "8px"}}
            data-testid={dataTestId}
            {...containerProps}
        >
            <Flex alignItems="center" justifyContent="space-between" style={{gap: "8px"}}>
                {avatar || <CompanyAvatar name={title} logo={logo} />}
                <Box py={2}>
                    <Flex>
                        {richTitle && <Box color={fontColor}>{richTitle}</Box>}
                        {!richTitle && <Text color={fontColor}>{title}</Text>}
                        {badgeLabel && (
                            <Box>
                                <Badge
                                    width="fit-content"
                                    fontSize={1}
                                    ml={2}
                                    data-testid="decorated-section-badge"
                                >
                                    {badgeLabel}
                                </Badge>
                            </Box>
                        )}
                    </Flex>
                    <Text fontSize={fontSizeSubtitle} color={fontColor}>
                        {subTitle}
                    </Text>
                </Box>
            </Flex>
            {children}
        </Container>
    );
};
