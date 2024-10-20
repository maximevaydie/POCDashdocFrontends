import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, OnDesktop, Text, useDevice} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Company} from "dashdoc-utils";
import isAfter from "date-fns/isAfter";
import React, {ReactNode} from "react";
import {useSelector} from "react-redux";

import {TOPBAR_HEIGHT} from "../../constants/constants";
import {
    getConnectedCompany,
    getConnectedManager,
    getSubscription,
} from "../../../../../react/Redux/accountSelector";
import {managerService} from "../../services/manager.service";
import {ExtraTopBars} from "../topbar/ExtraTopBars";

type Props = {
    topBar: ReactNode;
    children: ReactNode;
};

export function MainContainerWrapper({topBar, children}: Props) {
    const connectedManager = useSelector(getConnectedManager);
    const connectedCompany = useSelector(getConnectedCompany);
    const subscription = useSelector(getSubscription);
    const device = useDevice();

    const extraTopBars =
        device == "mobile" ? [] : ExtraTopBars(connectedManager, connectedCompany, subscription);

    const onContactUs = () => {
        window.location.href = `mailto:${t("blockedAccountScreen.contactEmail")}`;
    };

    if (connectedCompany) {
        const isStaff = managerService.isDashdocStaff(connectedManager);
        const isDeleted = (connectedCompany as Company & {deleted: boolean}).deleted;
        if (isDeleted && !isStaff) {
            return (
                <MainContainer>
                    <OnDesktop>{extraTopBars}</OnDesktop>
                    {topBar}
                    <h2 className="text-center">{t("app.disabledAccountTitle")}</h2>
                    <p className="text-center">{t("app.disabledAccountText")}</p>
                </MainContainer>
            );
        }
    }
    const blockUnpaidAccountDate = subscription?.block_unpaid_account_date;
    if (blockUnpaidAccountDate && isAfter(new Date(), new Date(blockUnpaidAccountDate))) {
        return (
            <MainContainer>
                <OnDesktop>{extraTopBars}</OnDesktop>
                {topBar}
                <Flex justifyContent="center">
                    <Box mt={130} maxWidth={600} alignItems="center">
                        <Text textAlign="center" variant="h1" color="grey.dark" mb={5}>
                            {t("blockedAccountScreen.title")}
                        </Text>
                        <Text variant="captionBold" textAlign="center" color="grey.dark">
                            {t("blockedAccountScreen.disableAccountBecauseNoPayment")}
                        </Text>
                        <Flex justifyContent="center" mb={7} mt={6}>
                            <Button fontSize={1} onClick={onContactUs}>
                                {t("blockedAccountScreen.contactUs")}
                            </Button>
                        </Flex>
                        <Flex justifyContent="center">
                            <Icon name="monitorRemove" size={180} color="grey.light" />
                        </Flex>
                    </Box>
                </Flex>
            </MainContainer>
        );
    }

    // compute the reserved space (navbarHeight) BEFORE adding the main Dashdoc topbar
    // which has its own specific height which isn't a multiple of 40px.
    const navbarHeight = extraTopBars.length * 40 + (topBar ? TOPBAR_HEIGHT : 0);
    return (
        <MainContainer>
            <OnDesktop>{extraTopBars}</OnDesktop>
            {topBar}
            <SubContainer navbarHeight={navbarHeight}>{children}</SubContainer>
        </MainContainer>
    );
}

const MainContainer = styled("div")`
    height: 100%;
    display: flex;
    flex-direction: column;
`;

const SubContainer = styled("div")<{navbarHeight: number}>`
    height: calc(100% - ${(props) => props.navbarHeight}px);
    display: flex;
    flex-direction: row;
    position: relative;

    @media (max-width: 639px) {
        flex-direction: column;
    }
`;
