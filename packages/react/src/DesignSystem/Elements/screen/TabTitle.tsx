import {Device, Flex, Text, TooltipWrapper, useDevice} from "@dashdoc/web-ui";
import React from "react";
import {Helmet} from "react-helmet";

type Props = {
    title: string;
    customTitle?: string;
    detailText?: React.ReactNode;
    ellipsis?: boolean;
    ["data-testid"]?: string;
};

const Title = ({
    title,
    ellipsis,
    ["data-testid"]: testId,
}: {
    title: string;
    ellipsis?: boolean;
    device: Device;
    ["data-testid"]?: string;
}) => {
    const textComponent = (
        <Text
            as="h3"
            variant="title"
            display="inline-block"
            data-testid={testId ?? "screen-title"}
            ellipsis={ellipsis}
        >
            {title}
        </Text>
    );

    if (!ellipsis) {
        return textComponent;
    }

    return <TooltipWrapper content={title}>{textComponent}</TooltipWrapper>;
};

export function TabTitle({
    title,
    customTitle,
    detailText,
    ellipsis,
    ["data-testid"]: testId,
}: Props) {
    const pageTitle = customTitle ? customTitle : title ? title : "Dashdoc";
    const screenTitle = title ? `${title} · Dashdoc` : "Dashdoc";
    const device = useDevice();

    return (
        <>
            <Helmet>
                <title>{screenTitle}</title>
            </Helmet>
            <Flex alignItems="center">
                <Title
                    title={pageTitle}
                    ellipsis={ellipsis}
                    device={device}
                    data-testid={testId}
                />
                {!!detailText && (
                    <Text
                        variant="captionBold"
                        color="grey.dark"
                        ml={2}
                        display="inline-block"
                        data-testid={"screen-subtitle"}
                    >
                        {detailText}
                    </Text>
                )}
            </Flex>
        </>
    );
}
