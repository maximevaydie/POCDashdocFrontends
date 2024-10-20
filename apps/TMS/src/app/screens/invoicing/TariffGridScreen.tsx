import {useBaseUrl, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Card,
    CommonScreen,
    ErrorMessage,
    Flex,
    LoadingWheel,
    SwitchInput,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import {cloneDeep} from "lodash";
import React, {FunctionComponent, useMemo, useState} from "react";
import {RouteComponentProps, useLocation, useParams} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {UpdateOrDeleteTariffGridConfirmationMessage} from "app/features/pricing/tariff-grids/components/UpdateOrDeleteTariffGridConfirmationMessage";
import {DirectionModal} from "app/features/pricing/tariff-grids/modals/direction-modal";
import {TariffGridVersionModal} from "app/features/pricing/tariff-grids/modals/tariff-grid-version-modal";
import {TariffGridComponent} from "app/features/pricing/tariff-grids/TariffGrid";
import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {TariffGridSideContent} from "app/features/pricing/tariff-grids/TariffGridSideCard";
import {TariffGridTitle} from "app/features/pricing/tariff-grids/TariffGridTitle";
import {
    TariffGrid,
    TariffGridOwnerType,
    TariffGridVersion,
} from "app/features/pricing/tariff-grids/types";
import {useTariffGrid} from "app/screens/invoicing/hooks/useTariffGrid";
import {useTariffGridZones} from "app/screens/invoicing/hooks/useTariffGridZones";
import {useTariffGridZonesCountries} from "app/screens/invoicing/hooks/useTariffGridZonesCountries";
import {SidebarTabNames} from "app/types/constants";

interface TariffGridScreenProps extends RouteComponentProps {
    tariffGridUid?: string;
}

export const TariffGridScreen: FunctionComponent<TariffGridScreenProps> = ({history}) => {
    const hasDashdocInvoicingEnabled = useFeatureFlag("dashdocInvoicing");
    const zones = useTariffGridZones();
    const zonesCountries = useTariffGridZonesCountries();
    const location = useLocation();
    const match = useParams<{tariffGridUid: string}>();
    const baseUrl = useBaseUrl();
    const [showTariffGridVersionModal, openTariffGridVersionModal, closeTariffGridVersionModal] =
        useToggle(false);
    const [showDirectionModal, openDirectionModal, closeDirectionModal] = useToggle(false);
    const [selectedTariffGridVersion, setSelectedTariffGridVersion] =
        useState<TariffGridVersion>();

    let back = useMemo(() => {
        let result = `${baseUrl}/tariff-grids/`;
        if (location.state) {
            const from = (location.state as any).from;
            if (from) {
                result = from;
            }
        }
        return result;
        // We don't update this back-link, this is a component lifecycle related value.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const {saving, hasUnsavedChanges, tariffGrid, update, save, fetch} = useTariffGrid(
        match.tariffGridUid
    );

    const isStillLoading =
        zones === undefined || zonesCountries === undefined || tariffGrid === undefined;

    const hasNaN = useMemo(
        () =>
            tariffGrid?.current_version?.table?.some((line) => line.some((value) => isNaN(value))),
        [tariffGrid]
    );

    const switchStatus = () => {
        if (!tariffGrid) {
            return;
        }
        const newTariffGrid: TariffGrid = cloneDeep(tariffGrid);
        const newStatus = tariffGrid.status === "active" ? "inactive" : "active";
        newTariffGrid.status = newStatus;
        update(newTariffGrid);
    };

    const isPurchaseTariffGrid = tariffGrid?.owner_type === TariffGridOwnerType.SHIPPER;
    const hasMissingMandatoryInvoiceItem =
        hasDashdocInvoicingEnabled && !isPurchaseTariffGrid && !tariffGrid?.invoice_item;
    const disableSaveButton = hasMissingMandatoryInvoiceItem || hasNaN || saving;

    if (isStillLoading) {
        return <LoadingWheel />;
    }

    return (
        <CommonScreen
            ellipsisTitle
            title={getTabTranslations(SidebarTabNames.TARIFF_GRIDS)}
            customTitle={tariffGrid?.name}
            getCustomTitleWrapper={(title) => (
                <TariffGridTitle title={title} tariffGrid={tariffGrid} />
            )}
            backTo={back}
            backToLabel={t("app.back")}
            actions={
                <Box mt={2}>
                    <SwitchInput
                        value={tariffGrid?.status === "active"}
                        data-testid="tariff-grid-status-switch"
                        onChange={switchStatus}
                        labelRight={
                            tariffGrid.status === "active"
                                ? t("tariffGrids.ActiveGrid")
                                : t("tariffGrids.InactiveGrid")
                        }
                    />
                </Box>
            }
        >
            <Flex id="tariff-grid-screen-content" flexGrow={1} flex="1 1 0%" minHeight="0" mb={8}>
                <TariffGridComponent tariffGrid={tariffGrid} onChange={update} />

                <TariffGridSideContent
                    tariffGrid={tariffGrid}
                    hasUnsavedChanges={hasUnsavedChanges}
                    mandatoryInvoiceItem={hasMissingMandatoryInvoiceItem}
                    onChange={update}
                    openEditTariffGridVersionModal={(tariffGridVersion) => {
                        setSelectedTariffGridVersion(tariffGridVersion);
                        openTariffGridVersionModal();
                    }}
                    openCreateTariffGridVersionModal={openTariffGridVersionModal}
                    openDirectionModal={openDirectionModal}
                />

                {showTariffGridVersionModal && (
                    <TariffGridVersionModal
                        rootId={"tariff-grid-screen-content"}
                        tariffGrid={tariffGrid}
                        tariffGridVersion={selectedTariffGridVersion}
                        onClose={() => {
                            closeTariffGridVersionModal();
                            setSelectedTariffGridVersion(undefined);
                        }}
                        onSubmit={refetchTariffGridVersionAndCloseModal}
                        onDelete={refetchTariffGridVersionAndCloseModal}
                    />
                )}

                {showDirectionModal && (
                    <DirectionModal
                        rootId={"tariff-grid-screen-content"}
                        origin_or_destination={tariffGrid.origin_or_destination}
                        isOriginOrDestination={tariffGrid.is_origin_or_destination}
                        onClose={closeDirectionModal}
                        onSubmit={async ({origin_or_destination, isOriginOrDestination}) => {
                            if (
                                (origin_or_destination && origin_or_destination.id === null) ||
                                isOriginOrDestination !== tariffGrid.is_origin_or_destination
                            ) {
                                update(
                                    tariffGridService.editLandmark(
                                        tariffGrid,
                                        origin_or_destination,
                                        isOriginOrDestination
                                    )
                                );
                            }
                        }}
                    />
                )}
            </Flex>

            <Card
                p={2}
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"right"}
                alignItems={"center"}
                position="absolute"
                bottom="0"
                right="0"
                width="100%"
                borderRadius={0}
                zIndex="level3"
                flexShrink={0}
            >
                {hasNaN && <ErrorMessage error={t("tariffGrids.GridCannotHaveEmptyCell")} />}
                <Button
                    mr={2}
                    variant={"plain"}
                    onClick={() => {
                        history.push(`/app/tariff-grids/`);
                    }}
                >
                    {t("common.cancel")}
                </Button>
                <Button
                    disabled={disableSaveButton}
                    data-testid={"save-tariff-grid-changes"}
                    onClick={save}
                    withConfirmation={hasUnsavedChanges}
                    modalProps={{
                        title: t("tariffGrids.applyChanges"),
                        mainButton: {
                            severity: "warning",
                            children: t("tariffGrids.applyChanges"),
                        },
                    }}
                    confirmationMessage={
                        <UpdateOrDeleteTariffGridConfirmationMessage
                            isPurchaseTariffGrid={isPurchaseTariffGrid}
                        />
                    }
                >
                    {t("tariffGrids.SaveChanges")}
                </Button>
            </Card>
        </CommonScreen>
    );

    function refetchTariffGridVersionAndCloseModal() {
        fetch();
        closeTariffGridVersionModal();
        setSelectedTariffGridVersion(undefined);
    }
};
