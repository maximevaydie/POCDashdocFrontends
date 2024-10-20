import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    ClickOutside,
    ClickableBox,
    ClickableFlex,
    Icon,
    Text,
    theme,
} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import * as Sentry from "@sentry/browser";
import {useToggle} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {useSelector} from "react-redux";

import {CommitHash} from "../constants/constants";
import {useInterval} from "../hooks/useInterval";
import {getConnectedManager} from "../../../../react/Redux/accountSelector";
import {apiService} from "../services/api.service";

const NewsAlert = () => {
    const radius = "0.5em";
    return (
        <Badge
            position="absolute"
            p={radius}
            bottom="0.5em"
            right="0.25em"
            ml="auto"
            variant="errorDark"
        ></Badge>
    );
};

type Props = {
    topbarHeight: number;
};
export const HelpSection = ({topbarHeight}: Props) => {
    const [showHelpActions, , closeHelpActions, toggleHelpActions] = useToggle(false);
    const [shouldShowNewsBadge, killBadge] = useLatestNews();

    return (
        <ClickOutside position="relative" onClickOutside={closeHelpActions}>
            <ClickableFlex
                height="100%"
                alignItems="center"
                px={2}
                hoverStyle={{bg: "grey.ultradark"}}
                onClick={toggleHelpActions}
            >
                <Icon
                    width={22.5}
                    height={22.5}
                    scale={1.4}
                    name="questionCircle"
                    color="grey.white"
                    css={{}}
                />
                {shouldShowNewsBadge && <NewsAlert />}
            </ClickableFlex>
            {showHelpActions && (
                <Box
                    width="100%"
                    minWidth="fit-content"
                    position="absolute"
                    top={topbarHeight}
                    right={0}
                    boxShadow="large"
                    backgroundColor="grey.white"
                    borderRadius={1}
                    css={css`
                        &:hover {
                            box-shadow: ${theme.shadows.large};
                        }
                    `}
                    zIndex="topbar" // to be over FloatingPanel
                >
                    <ClickableBox
                        py={2}
                        px={4}
                        onClick={() => {
                            if (/.*\/flow\/.*/.test(window.location.href)) {
                                // There is no way to open a collection in the intercom messenger directly
                                window.open("https://help.dashdoc.com/fr/collections/5526016");
                            } else {
                                Intercom("showSpace", "help");
                            }
                            closeHelpActions();
                        }}
                    >
                        <Text whiteSpace="nowrap">{t("topbar.help.helpCenter")}</Text>
                    </ClickableBox>
                    <Box width="100%" borderBottom="1px solid" borderBottomColor="grey.light" />
                    <ClickableBox
                        py={2}
                        px={4}
                        onClick={() => {
                            Intercom("showSpace", "home");
                            closeHelpActions();
                        }}
                    >
                        <Text whiteSpace="nowrap">{t("topbar.help.contactSupport")}</Text>
                    </ClickableBox>
                    <Box width="100%" borderBottom="1px solid" borderBottomColor="grey.light" />
                    <ClickableBox
                        py={2}
                        px={4}
                        position={"relative"}
                        onClick={() => {
                            Intercom("showSpace", "news");
                            closeHelpActions();
                            killBadge();
                        }}
                    >
                        <Text whiteSpace="nowrap">{t("topbar.help.news")}</Text>
                        {shouldShowNewsBadge && <NewsAlert />}
                    </ClickableBox>

                    {CommitHash && (
                        <>
                            <Box
                                width="100%"
                                borderBottom="1px solid"
                                borderBottomColor="grey.light"
                            />{" "}
                            <Text
                                color="grey.dark"
                                py={2}
                                px={4}
                                variant="captionBold"
                                textAlign="right"
                            >
                                {CommitHash}
                            </Text>
                        </>
                    )}
                </Box>
            )}
        </ClickOutside>
    );
};

const NEWS_POLLING_INTERVAL_MS = 24 * 60 * 60 * 1000; // every 24 hours
/**
 * Sets up a poller to every minute query the /latest-news/ endpoint
 * and display the badge in the HelpSection if anything is new.
 */
function useLatestNews(): [boolean, () => void] {
    const [shouldShowNewsBadge, setShouldShowNewsBadge] = useState(false);
    const connectedManager = useSelector(getConnectedManager);

    const killBadge = useCallback(async () => {
        const nowInSeconds = Math.trunc(Date.now() / 1000);
        await apiService.patch("latest-news/", {timestamp: nowInSeconds}, {apiVersion: "web"});
        setShouldShowNewsBadge(false);
    }, [setShouldShowNewsBadge]);

    const getNewsBadgeStatus = useCallback(async () => {
        if (!connectedManager) {
            return;
        }

        let incomingNews;
        try {
            incomingNews = await apiService.get("latest-news/", {apiVersion: "web"});
        } catch (error) {
            Sentry.captureException(error);
            return;
        }

        if (!incomingNews) {
            return;
        }

        const incomingAlreadySeen: boolean = incomingNews["seen"];
        if (incomingAlreadySeen === false) {
            setShouldShowNewsBadge(true);
        }
    }, [setShouldShowNewsBadge]);

    useEffect(() => {
        getNewsBadgeStatus();
    }, [getNewsBadgeStatus]);

    useInterval(getNewsBadgeStatus, NEWS_POLLING_INTERVAL_MS);

    return [shouldShowNewsBadge, killBadge];
}
