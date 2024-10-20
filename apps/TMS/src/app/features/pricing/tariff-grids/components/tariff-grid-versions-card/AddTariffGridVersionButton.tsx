import {t} from "@dashdoc/web-core";
import {ClickableFlex, Icon, Text, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

type AddTariffGridVersionButtonProps = {
    disabled: boolean;
    onClick: () => unknown;
};

export const AddTariffGridVersionButton = ({
    disabled,
    onClick,
}: AddTariffGridVersionButtonProps) => {
    if (disabled) {
        return (
            <TooltipWrapper
                boxProps={{width: "fit-content"}}
                content={t("tariffGridVersion.addTariffGridVersionButtonDisabledTooltip")}
            >
                <ClickableFlex
                    mt={3}
                    p={3}
                    disabled={disabled}
                    backgroundColor="grey.ultralight"
                    hoverStyle={{boxShadow: "small"}}
                    width="fit-content"
                    borderRadius={1}
                    data-testid="add-tariff-grid-version-button"
                >
                    <Icon name="add" mr={2} color="grey.dark" />
                    <Text variant="h2">{t("tariffGrid.createNewVersion")}</Text>
                </ClickableFlex>
            </TooltipWrapper>
        );
    }

    return (
        <ClickableFlex
            mt={3}
            p={3}
            backgroundColor="blue.ultralight"
            hoverStyle={{boxShadow: "small"}}
            onClick={onClick}
            width="fit-content"
            borderRadius={1}
            data-testid="add-tariff-grid-version-button"
        >
            <Icon name="add" mr={2} color="blue.default" />
            <Text variant="h2" color="blue.default">
                {t("tariffGrid.createNewVersion")}
            </Text>
        </ClickableFlex>
    );
};
