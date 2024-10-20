import {getConnectedManager} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Text, Link} from "@dashdoc/web-ui";
import React from "react";

import {useSelector} from "app/redux/hooks";
import {RootState} from "app/redux/reducers/index";

import {DataBroker} from "./types";

type Props = {
    dataBroker: DataBroker;
};

export function DataBrokerHelp({dataBroker}: Props) {
    const {userLanguage} = useSelector((state: RootState) => {
        const connectedManager = getConnectedManager(state);
        return {
            userLanguage: connectedManager?.language,
        };
    });
    if (dataBroker === "mobile") {
        return (
            <>
                <Text>{t("settings.telematicsViaMobileDescription")}</Text>
                <Text mt={4}>💡&nbsp;{t("settings.telematicsViaMobileWhen")}</Text>
            </>
        );
    }
    return (
        <>
            <Text>{t("settings.telematicsViaGeofencingTrackingDescription")}</Text>
            <Text mt={4}>
                💡&nbsp;{t("settings.telematicsViaGeofencingTrackingWhen")}
                {/* This article exists only in FR 🤷‍♂️ */}
                {userLanguage === "fr" && (
                    <>
                        &nbsp;
                        <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://help.dashdoc.com/fr/articles/8278962-connecter-sa-telematique-a-dashdoc-quels-interets#h_b7572fd363"
                        >
                            {t("common.learnMore")}
                        </Link>
                    </>
                )}
            </Text>
        </>
    );
}
