import {apiService, getConnectedManager, useSelector, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, LoadingOverlay, TabTitle, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {LuzmoDashboardComponent} from "@luzmo/react-embed";
import {formatDateRelative} from "dashdoc-utils";
import React, {useEffect, useState} from "react";

export enum LuzmoDashboards {
    REVENUE = "4c0a07c6-f71f-4f5b-8ab6-e26a30513949",
    INVOICES = "5132b0e2-ca8b-475b-96e9-fd8b6a699fdc",
}

type LuzmoWrapperProps = {
    dashboardSlug: LuzmoDashboards;
    title: string;
};

export function LuzmoWrapper({dashboardSlug, title}: LuzmoWrapperProps) {
    const [credentials, setCredentials] = useState({key: "", token: "", last_update: ""});
    const connectedManager = useSelector(getConnectedManager);
    const timezone = useTimezone();

    useEffect(() => {
        (async () => {
            const response = await apiService.get(`/bi/luzmo/`, {
                apiVersion: "web",
            });
            setCredentials(response);
        })();
    }, [dashboardSlug, connectedManager]);

    if (!credentials.key || !credentials.token) {
        return <LoadingOverlay />;
    }

    return (
        <>
            <Flex justifyContent="space-between" mb={4} mr={3}>
                <TabTitle title={title} />
                <TooltipWrapper
                    content={t("reports.updateDelayExplanation")}
                    boxProps={{display: "flex", alignItems: "center"}}
                >
                    <Icon name="clockArrow" strokeWidth={2} />
                    <Text variant="captionBold" ml={1}>
                        {t("common.lastUpdateAt", {
                            date: formatDateRelative(credentials.last_update),
                        })}
                    </Text>
                </TooltipWrapper>
            </Flex>
            <LuzmoDashboardComponent
                authKey={credentials.key}
                authToken={credentials.token}
                dashboardSlug={dashboardSlug}
                language={connectedManager?.language}
                timezoneId={timezone}
                switchScreenModeOnResize={false}
                loaderSpinnerColor="rgb(0, 81, 126)"
                loaderSpinnerBackground="rgb(236 248 255)"
            ></LuzmoDashboardComponent>
        </>
    );
}
