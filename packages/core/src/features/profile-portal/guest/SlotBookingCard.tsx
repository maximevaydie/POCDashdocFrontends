import {t} from "@dashdoc/web-core";
import {Box, Flex, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import {SlotBookingAction} from "features/slot/actions/SlotBookingAction";
import * as React from "react";

import {LoginSVG} from "./components/LoginSVG";

export function SlotBookingCard() {
    const title = t("flow.profilePortal.bookASlotToCome");
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
                        <SlotBookingAction />
                    </Box>
                    <LoginSVG />
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
                    <SlotBookingAction />
                </Flex>
            </OnMobile>
        </>
    );
}
