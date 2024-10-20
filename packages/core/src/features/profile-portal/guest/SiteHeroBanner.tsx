import {t} from "@dashdoc/web-core";
import {Box, CompanyAvatar, OnDesktop, OnMobile, Text} from "@dashdoc/web-ui";
import {SiteSwitcher} from "features/sidebar/SiteSwitcher";
import React from "react";
import {Site} from "types";

type Props = {site: Site};

export function SiteHeroBanner({site}: Props) {
    const siteTitle = t("flow.profilePortal.welcomeToTheSite", {site_name: site && site.name});
    const siteDetails = t("flow.profilePortal.pleaseBookASlot");
    return (
        <>
            <OnDesktop>
                <Box
                    p={8}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `min-content 1fr`,
                        gridGap: "36px",
                    }}
                >
                    <Box margin="auto">
                        <CompanyAvatar name={site.name} size="xlarge" />
                    </Box>
                    <Box margin="auto">
                        <Text
                            variant="title"
                            color="grey.dark"
                            lineHeight={4}
                            data-testid="flow-site-hero-title"
                        >
                            {siteTitle}
                        </Text>
                        <Text mt={4} variant="title">
                            {siteDetails}
                        </Text>
                    </Box>
                </Box>
            </OnDesktop>
            <OnMobile>
                <Box px={5}>
                    <Box>
                        <SiteSwitcher />
                    </Box>
                    <Box mt={3}>
                        <Text variant="h1" data-testid="flow-site-hero-title">
                            {siteTitle}
                        </Text>
                        <Text my={3}>{siteDetails}</Text>
                    </Box>
                </Box>
            </OnMobile>
        </>
    );
}
