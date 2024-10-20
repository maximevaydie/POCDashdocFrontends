import {apiService, getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Button, Callout, Flex, Icon, Link as LinkUI, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {TelematicConnector} from "dashdoc-utils";
import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";

import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";

import {AddTelematicAction} from "./actions/AddTelematicAction";
import {UpdateDataBrokerAction} from "./actions/UpdateDataBrokerAction";
import {TelematicList} from "./TelematicList";

export function TelematicSetting() {
    const [telematics, setTelematics] = useState<TelematicConnector[]>([]);

    useEffect(() => {
        fetchTelematics();
    }, []);

    const {userLanguage} = useSelector((state: RootState) => {
        const connectedManager = getConnectedManager(state);
        return {
            userLanguage: connectedManager?.language,
        };
    });

    return (
        <Flex flexDirection="column" overflow="auto">
            <Flex>
                <TooltipWrapper content={t("settings.telematicsHelp")}>
                    <Text variant="h1" my={4}>
                        {t("settings.telematicsEnabled")}
                        <Icon ml={2} name="info" verticalAlign="middle" />
                    </Text>
                </TooltipWrapper>
            </Flex>
            <Flex>
                <div className="col-md-6">
                    <Link to="/app/traces" style={{textDecoration: "none"}}>
                        <Button
                            style={{marginBottom: "1em"}}
                            variant="secondary"
                            onClick={() => {}}
                        >
                            <Icon name="telematicConnection" mr={3} mt={0} mb={0} />
                            {t("traces.myTraces")}
                        </Button>
                    </Link>
                </div>
                <div className="col-md-6">
                    <AddTelematicAction onCreate={fetchTelematics} />
                </div>
            </Flex>

            <div className="col-md-12" id="scroll-listener" data-testid="settings-plates-table">
                <TelematicList onReload={fetchTelematics} telematics={telematics} />
                <UpdateDataBrokerAction />
            </div>

            <Callout marginY={4}>
                {t("settings.telematicsDataPolicy")}
                {/* This article exists only in FR 🤷‍♂️ */}
                {userLanguage === "fr" && (
                    <>
                        &nbsp;
                        <LinkUI
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://help.dashdoc.com/fr/articles/8279082-la-gestion-des-donnees-de-telematique-dans-dashdoc"
                        >
                            {t("common.learnMore")}
                        </LinkUI>
                    </>
                )}
            </Callout>
        </Flex>
    );

    async function fetchTelematics() {
        const result: TelematicConnector[] = await apiService.get(`/telematics/links/`, {
            apiVersion: "v4",
        });
        setTelematics(result);
    }
}
