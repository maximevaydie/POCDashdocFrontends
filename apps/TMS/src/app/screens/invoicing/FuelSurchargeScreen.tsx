import {useBaseUrl, useDispatch} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {Button, Card, CommonScreen, Flex, LoadingWheel, Text} from "@dashdoc/web-ui";
import {FuelSurchargeAgreementOwnerType} from "dashdoc-utils";
import React, {useState} from "react";
import {useLocation, useParams} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {FuelSurchargeAgreementClients} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementClients";
import {FuelSurchargeAgreementDetails} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementDetails";
import {FuelSurchargeAgreementInvoiceItem} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementInvoiceItem";
import {FuelSurchargeAgreementTitle} from "app/features/pricing/fuel-surcharges/FuelSurchargeAgreementTitle";
import {FuelSurchargeItems} from "app/features/pricing/fuel-surcharges/FuelSurchargeItems";
import {FuelPriceIndexesUpdateFormModal} from "app/features/pricing/fuel-surcharges/modals/FuelPriceIndexesUpdateFormModal";
import {
    fetchBulkUpdateFuelPriceIndexes,
    type BulkUpdateFuelPriceIndex,
} from "app/redux/actions/fuel-surcharge/fuel-price-indexes";
import {useFuelSurchargeAgreement} from "app/screens/invoicing/hooks/useFuelSurchargeAgreement";
import {SidebarTabNames} from "app/types/constants";

export function FuelSurchargeScreen() {
    const baseUrl = useBaseUrl();
    const location = useLocation();
    const dispatch = useDispatch();

    const {fuelSurchargeAgreementUid} = useParams<{fuelSurchargeAgreementUid: string}>();
    const {
        isLoading,
        fuelSurchargeAgreement,
        handleReload: handleReloadFuelSurchargeAgreement,
        handleUpdate: handleUpdateFuelSurchargeAgreement,
    } = useFuelSurchargeAgreement(fuelSurchargeAgreementUid);

    const [isFuelPriceIndexUpdateModalOpen, setIsFuelPriceIndexUpdateModalOpen] = useState(false);
    const [isFuelPriceIndexUpdateModalSubmitting, setIsFuelPriceIndexUpdateModalSubmitting] =
        useState(false);

    if (isLoading || !fuelSurchargeAgreement) {
        return <LoadingWheel />;
    }

    const isSaleAgreement =
        fuelSurchargeAgreement.owner_type === FuelSurchargeAgreementOwnerType.CARRIER;

    return (
        <CommonScreen
            title={getTabTranslations(SidebarTabNames.FUEL_SURCHARGES)}
            getCustomTitleWrapper={(title) => (
                <FuelSurchargeAgreementTitle
                    title={title}
                    fuelSurchargeAgreement={fuelSurchargeAgreement}
                />
            )}
            customTitle={fuelSurchargeAgreement.name}
            backTo={backToURL}
            backToLabel={t("app.back")}
        >
            <Flex id="fuel-surcharge-screen-content" flex="1 1 0%">
                <Card p={4} display="flex" flex="3 1 0">
                    <Flex bg="white" flexDirection="column" height="100%">
                        <Flex mb={5}>
                            <Flex flexGrow={1}>
                                <Text variant="h1">{t("fuelSurcharges.history")}</Text>
                            </Flex>
                            <Button
                                data-testid="fuel-surcharge-agreement-update-price-index-button"
                                onClick={() => setIsFuelPriceIndexUpdateModalOpen(true)}
                            >
                                {t("fuelSurcharges.update")}
                            </Button>
                        </Flex>
                        <Flex flexGrow={1}>
                            <FuelSurchargeItems fuelSurchargeAgreement={fuelSurchargeAgreement} />
                        </Flex>
                    </Flex>
                </Card>

                <Flex flex="1 1 0" flexDirection="column" ml={4}>
                    <Card p={4}>
                        <FuelSurchargeAgreementDetails
                            fuelSurchargeAgreement={fuelSurchargeAgreement}
                        />
                    </Card>

                    {isSaleAgreement && (
                        <Card p={4} mt={3}>
                            <FuelSurchargeAgreementInvoiceItem
                                fuelSurchargeAgreement={fuelSurchargeAgreement}
                                onUpdate={(invoiceItem) =>
                                    handleUpdateFuelSurchargeAgreement({
                                        invoiceItem,
                                    })
                                }
                            />
                        </Card>
                    )}

                    <Card p={4} mt={3} flexGrow={1}>
                        <FuelSurchargeAgreementClients
                            fuelSurchargeAgreement={fuelSurchargeAgreement}
                            onUpdate={(clients) =>
                                handleUpdateFuelSurchargeAgreement({
                                    clients,
                                })
                            }
                        />
                    </Card>
                </Flex>
            </Flex>

            {isFuelPriceIndexUpdateModalOpen && (
                <FuelPriceIndexesUpdateFormModal
                    fuelPriceIndexes={[fuelSurchargeAgreement.fuel_price_index]}
                    onClose={() => setIsFuelPriceIndexUpdateModalOpen(false)}
                    isSubmitting={isFuelPriceIndexUpdateModalSubmitting}
                    onSubmit={handleSubmitFuelPriceIndex}
                />
            )}
        </CommonScreen>
    );

    function backToURL() {
        return (location.state as any)?.from ?? baseUrl + "/fuel-surcharges";
    }

    async function handleSubmitFuelPriceIndex(fuelPriceIndexes: BulkUpdateFuelPriceIndex[]) {
        setIsFuelPriceIndexUpdateModalSubmitting(true);
        try {
            await dispatch(fetchBulkUpdateFuelPriceIndexes(fuelPriceIndexes));
            handleReloadFuelSurchargeAgreement();
            setIsFuelPriceIndexUpdateModalOpen(false);
        } catch (e) {
            Logger.error(e);
        }
        setIsFuelPriceIndexUpdateModalSubmitting(false);
    }
}
