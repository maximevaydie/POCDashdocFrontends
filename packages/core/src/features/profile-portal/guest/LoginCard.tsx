import {t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import {LoginAction} from "features/account/actions";
import * as React from "react";

import {ScheduleSVG} from "./components/ScheduleSVG";

export function LoginCard() {
    const title = t("flow.profilePortal.seeMyPlannedBookings");

    return (
        <>
            <OnDesktop>
                <Flex
                    style={{
                        gap: "12px",
                    }}
                    flexDirection="column"
                    backgroundColor="grey.white"
                    alignItems="center"
                    borderRadius={2}
                    p={8}
                >
                    <Text textAlign="center" variant="title">
                        {title}
                    </Text>
                    <Box minWidth="200px">
                        <LoginAction />
                    </Box>
                    <ScheduleSVG />
                </Flex>
            </OnDesktop>
            <OnMobile>
                <Flex
                    style={{
                        gap: "16px",
                    }}
                    flexDirection="column"
                    backgroundColor="grey.white"
                    alignItems="center"
                    borderRadius={2}
                    p={4}
                >
                    <Text textAlign="center" variant="h1" mb={2}>
                        {title}
                    </Text>
                    <LoginAction />
                </Flex>
            </OnMobile>
        </>
    );
}
