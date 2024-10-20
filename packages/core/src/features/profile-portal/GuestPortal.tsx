import {InvalidStateScreen, isAuthenticated, LoadingScreen} from "@dashdoc/web-common";
import {Box, Flex, OnDesktop, OnMobile} from "@dashdoc/web-ui";
import {PublicContent} from "features/sidebar/content/PublicContent";
import React from "react";
import {useSelector} from "react-redux";
import {RootState} from "redux/reducers";
import {selectSite, selectSiteLoading} from "redux/reducers/flow/site.slice";

import {LoginCard} from "./guest/LoginCard";
import {SiteHeroBanner} from "./guest/SiteHeroBanner";
import {SlotBookingCard} from "./guest/SlotBookingCard";

export function GuestPortal() {
    const isAuth = useSelector(isAuthenticated);
    const loading = useSelector(({account}: RootState) => account.loading);
    const site = useSelector(selectSite);
    const siteLoading = useSelector(selectSiteLoading);
    if (loading) {
        return <LoadingScreen />;
    }
    if (["idle", "pending", "reloading"].includes(siteLoading)) {
        return <LoadingScreen />;
    }
    if (!site) {
        return <InvalidStateScreen />;
    }
    return (
        <>
            <OnDesktop>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateRows: ` minmax(min-content, 360px) 1fr`,
                    }}
                >
                    <SiteHeroBanner site={site} />
                    <Box
                        backgroundColor="grey.ultralight"
                        px={[0, 2, 8]}
                        py={6}
                        style={{
                            display: "grid",
                            gridTemplateColumns: `minmax(300px, 1fr) minmax(300px, 1fr)`,
                            gap: "36px",
                        }}
                    >
                        <Box>
                            <SlotBookingCard />
                        </Box>

                        {!isAuth && (
                            <Box>
                                <LoginCard />
                            </Box>
                        )}
                    </Box>
                </Box>
            </OnDesktop>
            <OnMobile>
                <Box backgroundColor="grey.white">
                    <SiteHeroBanner site={site} />
                    <Flex
                        flexDirection="column"
                        style={{gap: "16px"}}
                        py={4}
                        px={4}
                        backgroundColor="grey.light"
                    >
                        <SlotBookingCard />
                        <LoginCard />
                    </Flex>
                    <Box px={5}>
                        <PublicContent />
                    </Box>
                </Box>
            </OnMobile>
        </>
    );
}
