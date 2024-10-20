import type {ShipperInTransport} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Box, Button, Flex, Icon, Radio, Select, SelectOption, Text, theme} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {DeliveryDocumentBusinessPrivacyScope} from "dashdoc-utils";
import React, {useCallback, useState} from "react";

import {isTransportRental} from "app/services/transport/transport.service";

import {SignatureInfoCell} from "./signature-info-cell";
import {SignatureLoadList} from "./signature-load-list";

import type {Delivery, Site, Transport} from "app/types/transport";

const ObservationContainer = styled("div")`
    position: relative;
    margin-bottom: 5px;

    & > div:first-child {
        left: 15px;
        top: -15px;
        padding: 2px;
        position: absolute;
    }
`;

function getDeliveryOptionLabel(shipper: ShipperInTransport, delivery: Delivery) {
    const origin =
        delivery.origin.address?.city ||
        delivery.origin.address?.name ||
        t("generic.notSpecified");
    const destination =
        delivery.destination.address?.city ||
        delivery.destination.address?.name ||
        t("generic.notSpecified");
    return `${origin} ➡️ ${destination} (${shipper.name}) `;
}

type Props = {
    signatoryName: string;
    transport: Transport;
    site: Site;
    documentsNumbersAsString: string;
    plates: string;
    businessPrivacyScope: DeliveryDocumentBusinessPrivacyScope;
    onConfirmObservation: (observations?: {content: string; deliveryUid: string}) => void;
    onBadUser: () => void;
    onBack: () => void;
};

export function SignatureAddObservations({
    signatoryName,
    transport,
    site,
    documentsNumbersAsString,
    plates,
    onConfirmObservation,
    onBadUser,
    onBack,
}: Props): JSX.Element {
    const [content, setContent] = useState("");
    // @ts-ignore
    const [deliveryUid, setDeliveryUid] = useState<string>(undefined);
    const [option, setOption] = useState<"all" | "one" | undefined>("all");

    const handleConfirmClick = useCallback(() => {
        onConfirmObservation({content, deliveryUid});
    }, [onConfirmObservation, content, deliveryUid]);

    const deliveryOptions = transport.deliveries.map((delivery) => {
        return {
            value: delivery.uid,
            label: getDeliveryOptionLabel(transport.shipper, delivery),
        };
    });

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
                {isRental
                    ? t("signature.rentalConfirmationInfo", {
                          rentalNoteNumber: documentsNumbersAsString,
                      })
                    : t("signature.confirmationInfo", {
                          cnNumber: documentsNumbersAsString,
                      })}
            </div>
            <ObservationContainer>
                <div style={styles.observationsTitle}>{t("signature.observations")}</div>
                <textarea
                    data-testid="add-signature-observations-textarea"
                    style={styles.observations}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </ObservationContainer>

            {transport.deliveries.length > 1 ? (
                <Box width="300px" my={2}>
                    <Text mb={2} fontSize={14} fontWeight="600">
                        {t("signature.observations.associatedWith")}
                    </Text>
                    <Box>
                        <Flex style={{gap: "24px"}}>
                            <Radio
                                key={"all"}
                                name="delivery"
                                label={t("signature.deliverySelect.all")}
                                value="all"
                                onChange={(option: "all" | "one") => {
                                    setOption(option);
                                    // @ts-ignore
                                    setDeliveryUid(undefined);
                                }}
                                checked={option === "all"}
                            />
                            <Radio
                                key={"one"}
                                name="delivery"
                                label={t("signature.deliverySelect.one")}
                                value="one"
                                onChange={(option: "all" | "one") => {
                                    setOption(option);
                                    setDeliveryUid(transport.deliveries[0].uid);
                                }}
                                checked={option === "one"}
                            />
                        </Flex>

                        {option === "one" && (
                            <Box width="100%" mb={3}>
                                <Select
                                    label={t("common.delivery")}
                                    options={deliveryOptions}
                                    value={
                                        deliveryOptions.find(
                                            (option) => option.value === deliveryUid
                                        ) ?? null
                                    }
                                    onChange={(option: SelectOption) => {
                                        setDeliveryUid(option.value as string);
                                    }}
                                    isSearchable={false}
                                    isClearable={false}
                                    required
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            ) : (
                <div style={styles.observationsTooltip}>
                    {isRental
                        ? t("signature.rentalObservationInfo", {
                              rentalNoteNumber: documentsNumbersAsString,
                          })
                        : t("signature.observationInfo", {cnNumber: documentsNumbersAsString})}
                </div>
            )}

            <Button
                data-testid="confirm-signature-observations-button"
                onClick={handleConfirmClick}
                width="300px"
                mb={4}
            >
                <Icon name="check" mr={2} />
                {t("signature.addAboveObservations")}
            </Button>
            <Button onClick={onBack} variant="secondary" width="300px" mb={4}>
                {t("signature.goBackStep")}
            </Button>
            <div style={styles.info}>{t("signature.loadInfo")}</div>
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
        marginBottom: "22px",
        fontSize: "12px",
        color: theme.colors.blue.default,
        cursor: "pointer",
    },
    info: {
        textAlign: "center",
        color: theme.colors.grey.dark,
        marginBottom: "27px",
    },
    observations: {
        resize: "none",
        height: "120px",
        width: "302px",
        border: "1px solid",
        borderColor: theme.colors.blue.default,
        borderRadius: "3px",
    },
    observationsTitle: {
        color: theme.colors.blue.default,
        margin: "auto",
        backgroundColor: theme.colors.grey.white,
    },
    observationsTooltip: {
        color: theme.colors.blue.default,
        marginBottom: "15px",
    },
};
