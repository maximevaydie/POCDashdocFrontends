import {getConnectedManager, managerService} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Flex, Icon, Text} from "@dashdoc/web-ui";
import {Trucker} from "dashdoc-utils";
import React from "react";
import {useSelector} from "react-redux";

import {AddTruckerDriverLicenseAction} from "app/features/fleet/trucker/action-buttons/AddTruckerDriverLicenseAction";
import {EditTruckerDriverLicenseAction} from "app/features/fleet/trucker/action-buttons/EditTruckerDriverLicenseAction";

import {TimeSensitiveCardWithNumber} from "../trucker-details-cards";

import {TruckerDetailsPanel} from "./TruckerDetails";

interface TruckerDriverLicenseProps {
    trucker: Trucker;
}

export function TruckerDriverLicense({trucker}: TruckerDriverLicenseProps) {
    const showDrivingLicense =
        !!trucker.driving_license_number || !!trucker.driving_license_deadline;
    const connectedManager = useSelector(getConnectedManager);

    let content;
    if (showDrivingLicense) {
        content = (
            <div data-testid="trucker-driving-license-info">
                {showDrivingLicense && (
                    <TimeSensitiveCardWithNumber
                        title={t("fleet.common.drivingLicenseCardTitle")}
                        // @ts-ignore
                        expiryDate={trucker.driving_license_deadline}
                        number={trucker.driving_license_number}
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
                    {t("fleet.common.EmptyLicensesAndCardsSection")}
                </Text>

                <EditTruckerDriverLicenseAction
                    trucker={trucker}
                    label={t("components.addLicense")}
                    variant="secondary"
                    data-testid="add-driver-license-button"
                />
            </Flex>
        );
    }

    return (
        <TruckerDetailsPanel>
            <Flex justifyContent="space-between">
                <Text variant="h1" mb={3}>
                    {t("fleet.common.LicensesAndCardsSection")}
                </Text>
                <AddTruckerDriverLicenseAction trucker={trucker} />
            </Flex>
            {content}
        </TruckerDetailsPanel>
    );
}
