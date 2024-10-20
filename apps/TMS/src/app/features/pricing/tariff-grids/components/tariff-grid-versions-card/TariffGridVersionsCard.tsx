import {t} from "@dashdoc/web-core";
import {Callout, Card, Text} from "@dashdoc/web-ui";
import React from "react";

import {AddTariffGridVersionButton} from "app/features/pricing/tariff-grids/components/tariff-grid-versions-card/AddTariffGridVersionButton";
import {TariffGridVersionElement} from "app/features/pricing/tariff-grids/components/tariff-grid-versions-card/TariffGridVersionElement";
import {TariffGridVersion} from "app/features/pricing/tariff-grids/types";

type TariffGridVersionsCardProps = {
    currentTariffGridVersion: TariffGridVersion;
    tariffGridVersions: TariffGridVersion[];
    hasUnsavedChanges: boolean;
    openEditTariffGridVersionModal: (tariffGridVersion: TariffGridVersion) => unknown;
    openCreateTariffGridVersionModal: () => unknown;
};

export const TariffGridVersionsCard = ({
    currentTariffGridVersion,
    tariffGridVersions,
    hasUnsavedChanges,
    openEditTariffGridVersionModal,
    openCreateTariffGridVersionModal,
}: TariffGridVersionsCardProps) => {
    const disableTariffGridVersionButton =
        currentTariffGridVersion.table[0]?.[0] === undefined || hasUnsavedChanges;

    return (
        <Card p={3} mt={3} flexGrow={1} overflow="display">
            <Text variant="h1">{t("common.versions")}</Text>
            <Text variant="h2" mt={3}>
                {t("common.coming")}
            </Text>
            {tariffGridVersions.length > 0 ? (
                tariffGridVersions.map((tariffGridVersion, index) => (
                    <TariffGridVersionElement
                        key={index}
                        tariffGridVersion={tariffGridVersion}
                        openEditTariffGridVersionModal={() => {
                            openEditTariffGridVersionModal(tariffGridVersion);
                        }}
                    />
                ))
            ) : (
                <Callout mt={2} iconDisabled>
                    <Text data-testid={"no-version-text"}>
                        {t("tariffGrid.planEvolutionOfGridByCreatingNewVersion")}
                    </Text>
                </Callout>
            )}
            <AddTariffGridVersionButton
                disabled={disableTariffGridVersionButton}
                onClick={openCreateTariffGridVersionModal}
            />
        </Card>
    );
};
