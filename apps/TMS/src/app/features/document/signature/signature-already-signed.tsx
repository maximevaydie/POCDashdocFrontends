import {t} from "@dashdoc/web-core";
import {theme} from "@dashdoc/web-ui";
import {DeliveryDocument} from "dashdoc-utils";
import React from "react";

import {isTransportRental} from "app/services/transport/transport.service";

import {getRenderDeliveryDocument} from "./signature-done";
import {intercomSendSignedConsignmentEvent} from "./utils";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    documentsToSign: DeliveryDocument[];
    documentsNumbersAsString: string;
    signatoryName: string;
    onBadUser: () => void;
};

export function SignatureAlreadySigned({
    transport,
    documentsToSign,
    documentsNumbersAsString,
    signatoryName,
    onBadUser,
}: Props) {
    const isRental = isTransportRental(transport);
    return (
        <>
            <div style={styles.identifiedUser}>
                {t("signature.loggedInAs", {name: signatoryName})}
            </div>
            <a style={styles.notIdentifiedUser} onClick={onBadUser}>
                {t("signature.notYourself", {name: signatoryName})}
            </a>
            <div style={styles.info}>
                {t("signature.youAlreadySigned", {
                    smart_count: documentsToSign.length,
                    cnNumber: documentsNumbersAsString,
                })}
            </div>
            {documentsToSign.map((document) => {
                return getRenderDeliveryDocument(
                    document,
                    transport.business_privacy,
                    isRental,
                    intercomSendSignedConsignmentEvent
                );
            })}
            <div style={styles.securedInfo}>{t("signature.securedSignature")}</div>
        </>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    identifiedUser: {
        textAlign: "center",
        fontSize: "16px",
        color: theme.colors.blue.default,
    },
    notIdentifiedUser: {
        marginBottom: "65px",
        fontSize: "12px",
        color: theme.colors.blue.default,
        cursor: "pointer",
    },
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    securedInfo: {
        textAlign: "center",
        fontSize: "12px",
        color: theme.colors.grey.dark,
    },
};
