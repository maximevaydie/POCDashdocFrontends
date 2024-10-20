import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

interface TruckerVersion {
    app_version: number;
    readable_app_version: string;
    platform: string;
    new_app_update_available: boolean;
}

const TruckerVersionCell = ({trucker}: {trucker: TruckerVersion}) => {
    return (
        <>
            {trucker.readable_app_version ? (
                trucker.new_app_update_available ? (
                    <Flex>
                        <TooltipWrapper
                            content={t("settings.outdated")}
                            boxProps={{display: "inline-flex"}}
                        >
                            <Icon name="warning" />
                            <Text ml={1}>{t("common.no")}</Text>
                        </TooltipWrapper>
                    </Flex>
                ) : (
                    <Text>{t("common.yes")}</Text>
                )
            ) : (
                ""
            )}
            {trucker.readable_app_version}
            {trucker.platform === "android" && " (Android)"}
            {trucker.platform === "ios" && " (iOS)"}
        </>
    );
};

export default TruckerVersionCell;
