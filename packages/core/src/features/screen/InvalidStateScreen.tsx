import {t} from "@dashdoc/web-core";
import {Button, Flex, Text} from "@dashdoc/web-ui";
import React from "react";
import {useSelector} from "react-redux";

import {ProductLogo} from "../logo/ProductLogo";
import {isAuthenticated} from "../../../../../react/Redux/authSelector";
import {authService} from "../../services/auth.service";

type Props = {
    onLogout?: () => void;
};

export const InvalidStateScreen = ({onLogout}: Props) => {
    const isAuth = useSelector(isAuthenticated);
    return (
        <Flex
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            maxWidth={800}
            margin="auto"
        >
            <ProductLogo />
            <Text mt={6} variant="title">
                {t("common.oops")}
            </Text>
            <Text textAlign="center">{t("common.cannotReachServer")}</Text>
            {isAuth && (
                <Button mt={4} onClick={handleLogout}>
                    {t("common.logout")}
                </Button>
            )}
        </Flex>
    );

    function handleLogout() {
        authService.logout();
        onLogout?.();
    }
};
