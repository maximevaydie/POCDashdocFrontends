import {Box, Flex} from "@dashdoc/web-ui";
import {SlotBookingAction} from "features/slot/actions/SlotBookingAction";
import React from "react";
import {useSelector} from "redux/hooks";
import {selectProfile} from "redux/reducers/flow";

import {ShareSiteAction} from "./ShareSiteAction";
import {SiteSwitcher} from "./SiteSwitcher";

type Props = {
    children: React.ReactNode;
};

export function Sidebar({children}: Props) {
    const profile = useSelector(selectProfile);
    return (
        <Flex
            height="100%"
            flexGrow={1}
            borderRight="1px solid"
            borderColor="grey.light"
            flexDirection="column"
        >
            <Box px={3}>
                <SiteSwitcher />
            </Box>
            {profile !== "guest" && (
                <Box px={3}>
                    <Box py={4} borderBottom="1px solid" borderColor="grey.light">
                        <SlotBookingAction />
                        <Box mt={3}>
                            <ShareSiteAction />
                        </Box>
                    </Box>
                </Box>
            )}
            {children}
        </Flex>
    );
}
