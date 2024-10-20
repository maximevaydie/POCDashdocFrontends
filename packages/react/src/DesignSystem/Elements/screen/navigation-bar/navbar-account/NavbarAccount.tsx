import {Box, ClickableFlex, Flex, Icon, OnDesktop, Text, UserAvatar} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    name: string;
    role: string;
    picture?: string | null;
    onClick?: () => void;
    "data-testid"?: string;
};

export function NavbarAccount({name, role, picture, onClick, "data-testid": dataTestId}: Props) {
    const Container = onClick ? ClickableFlex : Flex;

    return (
        <Container
            pt={1}
            pb={1}
            alignItems="center"
            justifyContent="space-between"
            style={{gap: "8px"}}
            data-testid={dataTestId}
            onClick={onClick}
            height="100%"
            px={4}
            {...(onClick && {hoverStyle: {bg: "grey.ultradark"}})}
        >
            <Flex alignItems="center" justifyContent="space-between" style={{gap: "8px"}}>
                <UserAvatar name={name} picture={picture} />
                <OnDesktop>
                    <Box>
                        <Text color="grey.white" lineHeight="19px">
                            {name}
                        </Text>
                        <Text variant="caption" color="grey.white" lineHeight="19px">
                            {role}
                        </Text>
                    </Box>
                </OnDesktop>
            </Flex>
            <OnDesktop>
                {onClick && <Icon scale={0.8} name="arrowDown" color="grey.white" ml={2} />}
            </OnDesktop>
        </Container>
    );
}
