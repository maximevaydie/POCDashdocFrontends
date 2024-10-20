import {t} from "@dashdoc/web-core";
import {Button, Icon, theme} from "@dashdoc/web-ui";
import {formatDate, DeliveryDocument} from "dashdoc-utils";
import React from "react";

import {isTransportRental} from "app/services/transport/transport.service";

import {SignatureInfoCell} from "./signature-info-cell";
import {SignatureLoadList} from "./signature-load-list";
import {intercomSendDraftConsignmentEvent} from "./utils";

import type {Transport, Site} from "app/types/transport";

type DeliveryDocumentsButtonsProps = {
    documentsToSign: DeliveryDocument[];
    isRental: boolean;
};

function DeliveryDocumentsButtons({
    documentsToSign,
    isRental,
}: DeliveryDocumentsButtonsProps): JSX.Element {
    return (
        <>
            {documentsToSign.map((document) => (
                <Button
                    key={document.reference}
                    onClick={() => {
                        intercomSendDraftConsignmentEvent();
                        window.open(document.file);
                    }}
                    variant="secondary"
                    mb={4}
                    width="300px"
                >
                    <Icon name="eye" mr={2} />
                    {isRental ? t("signature.seeRentalNote") : t("signature.seeConsignmentNote")}
                </Button>
            ))}
        </>
    );
}

type Props = {
    transport: Transport;
    site: Site;
    documentsToSign: DeliveryDocument[];
    documentsNumbersAsString: string;
    plates: string;
    signatoryName: string;
    onConfirm: () => void;
    onAddObservations: () => void;
    onBadUser: () => void;
};

export function SignatureConfirmLoad({
    transport,
    site,
    documentsToSign,
    documentsNumbersAsString,
    plates,
    signatoryName,
    onConfirm,
    onAddObservations,
    onBadUser,
}: Props): JSX.Element {
    const isRental = isTransportRental(transport);
    const [rentalOrigin, rentalDestination] = [
        transport.deliveries[0]?.origin,
        transport.deliveries[0]?.destination,
    ];

    const rentalDatesSection = isRental && (
        <>
            {rentalOrigin?.real_end && (
                <SignatureInfoCell
                    icon={"clock"}
                    title={t("activityStatus.startOfRental")}
                    subtitle={formatDate(rentalOrigin.real_end, "PPPPp")}
                />
            )}
            {rentalDestination?.real_end && (
                <SignatureInfoCell
                    icon={"clock"}
                    title={t("activityStatus.endOfRental")}
                    subtitle={formatDate(rentalDestination.real_end, "PPPPp")}
                />
            )}
        </>
    );

    return (
        <>
            <div style={styles.identifiedUser}>
                {t("signature.loggedInAs", {name: signatoryName})}
            </div>
            <a style={styles.notIdentifiedUser} onClick={onBadUser}>
                {t("signature.notYourself", {name: signatoryName})}
            </a>
            <div style={styles.info}>
                {isRental
                    ? t("signature.rentalConfirmationInfo", {
                          rentalNoteNumber: documentsNumbersAsString,
                      })
                    : t("signature.confirmationInfo", {
                          cnNumber: documentsNumbersAsString,
                      })}
            </div>
            <SignatureLoadList deliveries={transport.deliveries} />
            <SignatureInfoCell
                icon={"map-marked-alt"}
                title={
                    site.address
                        ? `${site.address?.name || site.address?.company?.name}, ${
                              site.address?.city
                          }`
                        : ""
                }
                subtitle={
                    site.address ? `${site.address?.address}, ${site.address?.postcode}` : ""
                }
            />
            <SignatureInfoCell
                icon={"truck"}
                title={transport.carrier?.name ?? ""}
                subtitle={plates}
            />
            {rentalDatesSection}
            <DeliveryDocumentsButtons documentsToSign={documentsToSign} isRental={isRental} />
            <Button
                data-testid="add-signature-observations-button"
                onClick={onAddObservations}
                severity="warning"
                width="300px"
                mb={4}
            >
                <Icon name="warning" mr={2} />
                {t("signature.addObservations")}
            </Button>
            <Button data-testid="signature-confirm-button" onClick={onConfirm} width="300px">
                <Icon name="check" mr={2} />
                {t("signature.confirmInfos")}
            </Button>
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
};
