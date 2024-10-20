import {Box, BoxProps, themeAwareCss} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";
import {variant} from "styled-system";

type Props = {
    messages: React.JSX.Element[];
    variant: NoticeType;
};

export function TransportNotices({messages, variant}: Props) {
    if (messages.length === 0) {
        return null;
    }

    return (
        <Container variant={variant}>
            {messages.length > 1 ? (
                <ul style={{marginBottom: 0, paddingLeft: 18}}>
                    {messages.map((message, index) => (
                        <li key={index}>{message}</li>
                    ))}
                </ul>
            ) : (
                messages
            )}
        </Container>
    );
}

type NoticeType = "error" | "warning" | "info";
type NoticeStyles = Pick<BoxProps, "backgroundColor" | "borderLeftColor"> & {color: string};

const noticeVariants: Record<NoticeType, NoticeStyles> = {
    error: {
        backgroundColor: "red.ultralight",
        borderLeftColor: "red.dark",
        color: "red.dark",
    },
    warning: {
        backgroundColor: "yellow.ultralight",
        borderLeftColor: "yellow.default",
        color: "yellow.dark",
    },
    info: {
        backgroundColor: "blue.ultralight",
        borderLeftColor: "blue.default",
        color: "blue.dark",
    },
};

const Container = styled(Box)<BoxProps & Pick<Props, "variant">>(
    variant({variants: noticeVariants}),
    themeAwareCss({
        borderLeftStyle: "solid",
        borderLeftWidth: 4,
        borderRadius: 0,
        borderTopRightRadius: 1,
        borderBottomRightRadius: 1,
        paddingX: 4,
        paddingY: 2,
        marginBottom: 4,
    })
);
