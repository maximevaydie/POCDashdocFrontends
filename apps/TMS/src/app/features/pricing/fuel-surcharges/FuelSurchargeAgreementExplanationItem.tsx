import {Flex, Icon, IconNames, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import React from "react";

const ExplanationBox = styled(Flex)<{isActive?: boolean}>`
    padding: 8px;
    border: 1px solid;
    border-radius: 6px;
    justify-content: center;
    align-items: center;
    background-color: ${({isActive}) => (isActive ? theme.colors.blue.ultralight : "white")};
    border-color: ${({isActive}) =>
        isActive ? theme.colors.blue.default : theme.colors.grey.light};
`;

type FuelSurchargeAgreementExplanationItemProps = {
    isActive?: boolean;
    iconName: IconNames;
    title: string;
};

export const FuelSurchargeAgreementExplanationItem: React.FC<
    FuelSurchargeAgreementExplanationItemProps
> = ({isActive = false, iconName, title}) => {
    return (
        <ExplanationBox flex="1" isActive={isActive}>
            <Icon mr="3" color={isActive ? "blue.default" : "grey.dark"} name={iconName} />
            <Text color={isActive ? "blue.default" : "grey.dark"} variant="h2" textAlign="center">
                {title}
            </Text>
        </ExplanationBox>
    );
};
