import {DeprecatedIcon, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import styled from "@emotion/styled";
import React from "react";

const Container = styled("div")`
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
    color: ${theme.colors.grey.ultradark};
    width: 300px;
`;

const TextContainer = styled("div")`
    margin-left: 18px;
    display: flex;
    flex-direction: column;
`;

const Title = styled("div")`
    font-size: 14px;
    font-weight: 600;
`;

const Subtitle = styled("div")`
    font-size: 12px;
`;

type Props = {
    icon: string;
    title: string;
    subtitle?: string;
};

export function SignatureInfoCell({icon, title, subtitle}: Props): JSX.Element {
    return (
        <Container>
            <DeprecatedIcon
                name={icon}
                color={theme.colors.blue.default}
                css={css`
                    font-size: 25px;
                    align-self: center;
                `}
            />
            <TextContainer>
                <Title>{title}</Title>
                {subtitle && <Subtitle>{subtitle}</Subtitle>}
            </TextContainer>
        </Container>
    );
}
