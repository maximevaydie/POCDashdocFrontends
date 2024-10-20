import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {Trucker, formatDate} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";

import {AddTruckerCardsCertificatesAction} from "app/features/fleet/trucker/action-buttons/AddTruckerCardsCertificatesAction";
import {EditTruckerCardsCertificatesAction} from "app/features/fleet/trucker/action-buttons/EditTruckerCardsCertificatesAction";

import {
    CardGenericField,
    CardNumberField,
    TimeSensitiveCard,
    TimeSensitiveCardWithNumber,
} from "../trucker-details-cards";

import {TruckerDetailsPanel} from "./TruckerDetails";

interface TruckerCardsCertificatesProps {
    trucker: Trucker;
}

export function TruckerCardsCertificates({trucker}: TruckerCardsCertificatesProps) {
    const showCqc =
        !!trucker.cqc_number || !!trucker.cqc_original_delivery_date || !!trucker.cqc_deadline;
    const connectedManager = useSelector(getConnectedManager);

    const showAdrCertificate =
        !!trucker.adr_license_number ||
        !!trucker.adr_license_type ||
        !!trucker.adr_license_deadline;

    const showForkliftOperatorLicense = !!trucker.carrist_license_deadline;

    const adrLicenseTypeLabel = {
        both: t("fleet.adrLicenseType.both"),
        cistern: t("fleet.adrLicenseType.cistern"),
        package: t("fleet.adrLicenseType.package"),
        "": "",
    }[trucker.adr_license_type];

    const showDriverCard = !!trucker.driver_card_number || !!trucker.driver_card_deadline;

    let content;
    if (showDriverCard || showCqc || showAdrCertificate || showForkliftOperatorLicense) {
        content = (
            <div data-testid="trucker-card-certificates-info">
                {showDriverCard && (
                    <TimeSensitiveCardWithNumber
                        title={t("fleet.common.driverCardCardTitle")}
                        // @ts-ignore
                        expiryDate={trucker.driver_card_deadline}
                        number={trucker.driver_card_number}
                    />
                )}

                {showCqc && (
                    <TimeSensitiveCard
                        title={t("fleet.common.CqcCardTitle")}
                        // @ts-ignore
                        expiryDate={trucker.cqc_deadline}
                    >
                        <CardNumberField number={trucker.cqc_number} />
                        <CardGenericField
                            label={t("fleet.CQCOriginalDelivery")}
                            value={formatDate(trucker.cqc_original_delivery_date, "P")}
                        />
                    </TimeSensitiveCard>
                )}

                {showAdrCertificate && (
                    <TimeSensitiveCard
                        title={t("fleet.common.adrLicenseCardTitle")}
                        // @ts-ignore
                        expiryDate={trucker.adr_license_deadline}
                    >
                        <CardNumberField number={trucker.adr_license_number} />
                        {adrLicenseTypeLabel && (
                            <CardGenericField
                                label={t("fleet.adrLicenseType")}
                                value={adrLicenseTypeLabel}
                            />
                        )}
                    </TimeSensitiveCard>
                )}

                {showForkliftOperatorLicense && (
                    <TimeSensitiveCard
                        title={t("fleet.common.carristLicenseCardTitle")}
                        // @ts-ignore
                        expiryDate={trucker.carrist_license_deadline}
                    />
                )}
            </div>
        );
    } else if (!trucker.is_disabled && managerService.hasAtLeastUserRole(connectedManager)) {
        content = (
            <Flex flexDirection="column" alignItems="center">
                <Flex alignItems="center" justifyContent="center" width="5em" height="4em">
                    <Icon name="businessCard" scale={5} color="grey.dark" />
                </Flex>
                <Text my={4} maxWidth="50%" textAlign="center" color="grey.dark">
                    {t("fleet.common.EmptyCertificatesSection")}
                </Text>

                <EditTruckerCardsCertificatesAction
                    trucker={trucker}
                    label={t("components.addCards")}
                    variant="secondary"
                    data-testid="add-cards-certificates-button"
                />
            </Flex>
        );
    }

    return (
        <TruckerDetailsPanel>
            <Flex justifyContent="space-between">
                <Text variant="h1" mb={3}>
                    {t("fleet.common.certificatesSection")}
                </Text>
                <AddTruckerCardsCertificatesAction trucker={trucker} />
            </Flex>
            {content}
        </TruckerDetailsPanel>
    );
}
