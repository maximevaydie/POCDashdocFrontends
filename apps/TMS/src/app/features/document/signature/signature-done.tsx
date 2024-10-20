import {urlService} from "@dashdoc/web-common";
import {BuildConstants, t} from "@dashdoc/web-core";
import {DeprecatedIcon, theme} from "@dashdoc/web-ui";
import {css} from "@emotion/react";
import {DeliveryDocument} from "dashdoc-utils";
import React from "react";

import {isTransportRental} from "app/services/transport/transport.service";

import {intercomSendSignedConsignmentEvent} from "./utils";

import type {Transport} from "app/types/transport";

export function getRenderDeliveryDocument(
    document: DeliveryDocument,
    isBusinessPrivacy: Transport["business_privacy"],
    isRental: boolean,
    intercomCallback: () => void
) {
    const handleCNClick = () => {
        intercomCallback();
    };

    const trackingLink = `${urlService.getBaseUrl()}/tracking/shipments/${document.delivery}/`;

    const documentTitle = isRental
        ? t("signature.rentalNote", {rentalNoteReference: document.reference})
        : t("signature.cmr", {cmrReference: document.reference});

    return (
        <React.Fragment key={document.pk}>
            <a href={`${document.file}?refresh`} target="_blank" rel="noopener noreferrer">
                <DeprecatedIcon
                    name="file-signature"
                    color={theme.colors.blue.default}
                    css={css`
                        font-size: 45px;
                        margin-bottom: 10px;
                    `}
                    onClick={handleCNClick}
                />
            </a>
            <div style={styles.info}>{documentTitle}</div>
            {!isBusinessPrivacy && (
                <div style={styles.info}>
                    {t("signature.linkTrackingPagePart1")}
                    <a href={trackingLink} target="_blank" rel="noopener noreferrer">
                        {t("signature.linkTrackingPagePart2")}
                    </a>
                    .
                </div>
            )}
        </React.Fragment>
    );
}

type Props = {
    transport: Transport;
    documentsToSign: DeliveryDocument[];
};

export function SignatureDone({transport, documentsToSign}: Props): JSX.Element {
    const isRental = isTransportRental(transport);
    return (
        <>
            <img src={`${BuildConstants.staticUrl}img/icons8-pouce-en-air-64.png`} />
            <div style={styles.thankYou}>{t("common.thanks")}</div>
            <div style={styles.info}>{t("signature.signatureSavedNotification")}</div>
            <div style={styles.info}>
                {isRental
                    ? t("signature.seeSignedRentalNote", {smart_count: documentsToSign.length})
                    : t("signature.seeCMR", {smart_count: documentsToSign.length})}
            </div>

            {documentsToSign.map((document) =>
                getRenderDeliveryDocument(
                    document,
                    transport.business_privacy,
                    isRental,
                    intercomSendSignedConsignmentEvent
                )
            )}

            <div style={styles.smallInfo}>{t("signature.securedByDashdoc")}</div>
        </>
    );
}

const styles: {[key: string]: React.CSSProperties} = {
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    smallInfo: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        fontSize: "12px",
    },
    thankYou: {
        color: theme.colors.blue.default,
        fontSize: "24px",
        marginBottom: "27px",
    },
};
