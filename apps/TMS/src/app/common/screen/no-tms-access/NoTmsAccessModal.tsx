import {t} from "@dashdoc/web-core";
import {Box, Callout, Link, ModalBase, Text, renderInModalPortal} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {NoTmsAccessContent} from "./components/NoTmsAccessContent";

export function NoTmsAccessModal() {
    return renderInModalPortal(
        <ModalBase size="medium" title={null} data-testid="welcome-modal">
            <NoTmsAccessContent />
            <Box px={6} pb={4} flex={1}>
                <CustomCallout title={t("tms.noAccess.doYouWantLearnMore")}>
                    <Text mb={2}>{t("tms.noAccess.doYouWantDashdocTms")}</Text>
                    <Link
                        onClick={() => {
                            Intercom("showSpace", "home");
                        }}
                    >
                        {t("common.contactUs")}
                    </Link>
                </CustomCallout>
            </Box>
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
