import {HasFeatureFlag, getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, EditableField, Flex, Icon, BoxProps, Text, TooltipWrapper} from "@dashdoc/web-ui";
import {formatNumberWithCustomUnit, useToggle} from "dashdoc-utils";
import React from "react";

import {CarbonFootprintModal} from "app/features/transport/transport-information/carbon-footprint/CarbonFootprintModal";
import {InformationBlockTitle} from "app/features/transport/transport-information/information-block-title";
import {useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";

import type {Transport} from "app/types/transport";

type OwnProps = {
    transport: Transport;
    verticalDisplay?: boolean;
};

export type CarbonFootprintBannerProps = OwnProps & BoxProps;

export const CarbonFootprintBanner: React.FunctionComponent<CarbonFootprintBannerProps> = ({
    transport,
    verticalDisplay,
    ...containerProps
}) => {
    const {carbonFootprint, showBetaTag} = useCarbonFootprintBannerParameters(transport);
    const connectedCompany = useSelector(getConnectedCompany);
    const canEditUserCarbonFootprint = transportRightService.canEditCarbonFootprint(
        transport,
        connectedCompany?.pk
    );

    const [carbonFootprintModalIsOpened, openCarbonFootprintModal, closeCarbonFootprintModal] =
        useToggle();

    const _renderCarbonFootprint = () => {
        return (
            <>
                <Text>
                    {formatNumberWithCustomUnit(
                        carbonFootprint,
                        {
                            unit: t("components.carbonFootprint.unit"),
                        },
                        {maximumFractionDigits: 2},
                        (formattedNumber) => (
                            <Text variant="title" display="inline">
                                {formattedNumber}
                            </Text>
                        )
                    )}
                </Text>
                {!!transport.transport_operation_category && (
                    <HasFeatureFlag flagName="carbonfootprintiso">
                        <Text variant="caption" mt={3} data-testid="transport-operation-category">
                            {t("components.carbonFootprint.transportOperationCategory", {
                                name: transport.transport_operation_category.name,
                            })}
                        </Text>
                    </HasFeatureFlag>
                )}
            </>
        );
    };

    if (verticalDisplay) {
        return (
            <Flex {...containerProps}>
                <InformationBlockTitle
                    iconName="ecologyLeaf"
                    label={t("carbonFootprint.title")}
                    p={3}
                    afterLabel={
                        showBetaTag && (
                            <TooltipWrapper content={t("common.betaFeatureTooltip")}>
                                <Badge shape="squared" noWrap mr={1} ml={2}>
                                    {t("common.beta")}
                                </Badge>
                            </TooltipWrapper>
                        )
                    }
                >
                    <EditableField
                        label={null}
                        value={_renderCarbonFootprint()}
                        updateButtonLabel={
                            canEditUserCarbonFootprint ? undefined : t("common.display")
                        }
                        onClick={openCarbonFootprintModal}
                        data-testid="edit-carbon-footprint"
                    />
                </InformationBlockTitle>
                {carbonFootprintModalIsOpened && (
                    <CarbonFootprintModal
                        transport={transport}
                        onClose={closeCarbonFootprintModal}
                    />
                )}
            </Flex>
        );
    } else {
        return (
            <Flex flexDirection="column" {...containerProps}>
                <Flex alignItems="baseline" fontSize={1}>
                    <Icon name="ecologyLeaf" mr={2} />
                    <Text variant="h1">{t("carbonFootprint.title")}</Text>
                    <TooltipWrapper content={t("common.betaFeatureTooltip")}>
                        <Badge shape="squared" noWrap mr={1} ml={2}>
                            {t("common.beta")}
                        </Badge>
                    </TooltipWrapper>
                </Flex>
                <EditableField
                    label={null}
                    value={_renderCarbonFootprint()}
                    updateButtonLabel={
                        canEditUserCarbonFootprint ? undefined : t("common.display")
                    }
                    onClick={openCarbonFootprintModal}
                    data-testid="edit-carbon-footprint"
                />
                {carbonFootprintModalIsOpened && (
                    <CarbonFootprintModal
                        transport={transport}
                        onClose={closeCarbonFootprintModal}
                    />
                )}
            </Flex>
        );
    }
};

function useCarbonFootprintBannerParameters(transport: Transport) {
    const carbonFootprint =
        transport.user_carbon_footprint !== null
            ? transport.user_carbon_footprint
            : transport.estimated_carbon_footprint;

    const showBetaTag = !useFeatureFlag("carbonfootprintiso");

    return {
        carbonFootprint,
        showBetaTag,
    };
}
