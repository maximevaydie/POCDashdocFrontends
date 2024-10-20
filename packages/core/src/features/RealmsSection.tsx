import {t} from "@dashdoc/web-core";
import {Box, ClickableFlex, ClickOutside, Flex, Icon, Text, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {Company, useToggle} from "dashdoc-utils";
import React, {ReactNode} from "react";
import {useSelector} from "react-redux";

import {assets} from "../constants/assets";
import {
    FLOW_ROOT_PATH,
    REALM_LOGO_HEIGHT,
    TMS_ROOT_PATH,
    WASTE_ROOT_PATH,
} from "../constants/constants";
import {StaticImage} from "./misc/StaticImage";
import {getConnectedCompany} from "../../../../react/Redux/accountSelector";

type Props = {
    topbarHeight: number;
};
export const RealmsSection = ({topbarHeight}: Props) => {
    const connectedCompany = useSelector(getConnectedCompany);
    const realms = getRealms(connectedCompany);
    const [showRealmsActions, , closeRealmsActions, toggleRealmsActions] = useToggle(false);
    if (realms.length <= 0) {
        return null;
    }
    return (
        <ClickOutside position="relative" onClickOutside={closeRealmsActions}>
            <ClickableFlex
                height="100%"
                alignItems="center"
                px={2}
                hoverStyle={{bg: "grey.ultradark"}}
                onClick={toggleRealmsActions}
            >
                <Icon
                    width={22.5}
                    height={22.5}
                    scale={1.4}
                    name="realms"
                    color="grey.white"
                    css={{}}
                />
            </ClickableFlex>
            {showRealmsActions && (
                <Box
                    width="340px"
                    position="absolute"
                    top={topbarHeight}
                    right={0}
                    boxShadow="large"
                    backgroundColor="grey.white"
                    borderRadius={1}
                    py={4}
                    css={css`
                        &:hover {
                            box-shadow: ${theme.shadows.large};
                        }
                    `}
                    zIndex="topbar" // to be over FloatingPanel
                >
                    <Flex flexDirection="column">
                        <Text py={4} px={4} variant="h1" color="grey.dark">
                            {t("common.dashdocProducts")}
                        </Text>
                        {realms.map((realm, index) => (
                            <>
                                {index !== 0 && (
                                    <Box
                                        mx={4}
                                        key={`${index}-border`}
                                        width="100%"
                                        borderBottom="1px solid"
                                        borderBottomColor="grey.light"
                                    />
                                )}
                                <ClickableFlex
                                    key={`${index}-box`}
                                    py={4}
                                    px={4}
                                    onClick={() => {
                                        realm.onClick();
                                        closeRealmsActions();
                                    }}
                                >
                                    <Flex flexDirection="column">
                                        <Box>{realm.icon}</Box>
                                        <Text>{realm.description}</Text>
                                    </Flex>
                                </ClickableFlex>
                            </>
                        ))}
                    </Flex>
                </Box>
            )}
        </ClickOutside>
    );
};

type Realm = {
    onClick: () => void;
    icon: ReactNode;
    description: string;
};

function getRealms(connectedCompany: Company | null): Realm[] {
    const result: Realm[] = [
        {
            description: t("common.tmsDescription"),
            icon: <StaticImage src={assets.TMS_REALM} height={`${REALM_LOGO_HEIGHT}px`} />,
            onClick: () => {
                window.open(`${TMS_ROOT_PATH}`, "_blank");
            },
        },
        {
            description: t("common.flowDescription"),
            icon: <StaticImage src={assets.FLOW_REALM} height={`${REALM_LOGO_HEIGHT}px`} />,
            onClick: () => {
                window.open(`${FLOW_ROOT_PATH}`, "_blank");
            },
        },
    ];
    // FIXME: remove this condition when we have a "commercial page" for Wam
    // ref: https://dashdoc.slack.com/archives/CBG87REKU/p1701250242127829?thread_ts=1701246887.750079&cid=CBG87REKU
    if (connectedCompany && connectedCompany.settings?.flanders_waste_management) {
        result.push({
            description: t("common.wamDescription"),
            icon: <StaticImage src={assets.WAM_REALM} height={`${REALM_LOGO_HEIGHT}px`} />,
            onClick: () => {
                window.open(`${WASTE_ROOT_PATH}`, "_blank");
            },
        });
    }
    return result;
}
