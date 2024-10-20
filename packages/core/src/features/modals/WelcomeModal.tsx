import {t} from "@dashdoc/web-core";
import {Box, Button, Callout, Flex, Link, ModalBase, Text} from "@dashdoc/web-ui";
import {SiteAvatar} from "features/sidebar/SiteAvatar";
import React, {ReactNode} from "react";
import {Site} from "types";

import {WelcomeContent} from "./components/WelcomeContent";

type Props =
    | {
          site: Site;
          onClose: () => void;
      }
    | {};

export function WelcomeModal(props: Props) {
    return (
        <ModalBase size="medium" title={null} data-testid="welcome-modal">
            <WelcomeContent />
            {"site" in props ? (
                <Box backgroundColor="grey.light" px={6} py={2}>
                    <Text color="grey.dark" variant="h2" mb={2}>
                        {t("flow.welcomeModal.youAreOnSite")}
                    </Text>
                    <SiteAvatar site={props.site} />
                </Box>
            ) : (
                <Flex px={6} pb={4} flex={1} style={{gap: "24px"}}>
                    <CustomCallout title={t("flow.welcomeModal.calloutTitle")}>
                        <Text>{t("flow.welcomeModal.calloutText")}</Text>
                    </CustomCallout>
                    <CustomCallout title={t("flow.welcomeModal.moreAboutFlowTitle")}>
                        <Text mb={2}>{t("flow.welcomeModal.moreAboutFlowText")}</Text>
                        <Link
                            onClick={() => {
                                Intercom("showSpace", "home");
                            }}
                        >
                            {t("common.contactUs")}
                        </Link>
                    </CustomCallout>
                </Flex>
            )}
            {"onClose" in props && (
                <Flex flexDirection="column" px={6} pt={6} pb={4} flex={1}>
                    <Flex justifyContent="flex-end">
                        <Button
                            type="button"
                            onClick={props.onClose}
                            data-testid="confirm-understanding"
                        >
                            {t("common.confirmUnderstanding")}
                        </Button>
                    </Flex>
                </Flex>
            )}
        </ModalBase>
    );
}

function CustomCallout({title, children}: {title: string; children: ReactNode}) {
    return (
        <Callout iconDisabled alignItems="initial">
            <Text variant="h2" mb={4}>
                {title}
            </Text>
            {children}
        </Callout>
    );
}
