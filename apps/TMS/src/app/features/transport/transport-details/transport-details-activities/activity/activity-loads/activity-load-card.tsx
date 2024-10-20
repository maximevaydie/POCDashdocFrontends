import {t} from "@dashdoc/web-core";
import {ClickableFlex, Flex, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React, {FunctionComponent} from "react";

interface ActivityLoadCardProps {
    clickable: boolean;
    onClick: () => any;
    background?: string;
    children?: React.ReactNode;
    dataTestId: string;
}

const EditableCard = styled(ClickableFlex)`
    position: relative;
    &:hover {
        &::after {
            content: "${() => t("common.edit")}";
            position: absolute;
            right: 0;
            margin-right: 12px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 12px;
            border: 1px solid ${theme.colors.grey.light};
            border-radius: 3px;
            padding: 5px 10px;
            background: white;
            outline: 5px solid ${theme.colors.grey.light};
        }
    }
`;

export const ActivityLoadCard: FunctionComponent<ActivityLoadCardProps> = ({
    clickable,
    onClick,
    background = "grey.ultralight",
    children,
    dataTestId,
}) => {
    const Card = clickable ? EditableCard : Flex;

    return (
        <Card
            p={3}
            bg={background}
            onClick={clickable ? onClick : undefined}
            mb={1}
            borderRadius={1}
            data-testid={dataTestId}
        >
            {children}
        </Card>
    );
};
