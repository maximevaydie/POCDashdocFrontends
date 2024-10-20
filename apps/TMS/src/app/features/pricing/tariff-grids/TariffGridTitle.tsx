import {useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Badge, Flex, theme} from "@dashdoc/web-ui";
import {formatDate} from "dashdoc-utils";
import React from "react";

import {tariffGridService} from "app/features/pricing/tariff-grids/tariffGrid.service";
import {TariffGrid, TariffGridOwnerType} from "app/features/pricing/tariff-grids/types";

type TariffGridTitleProps = {
    title: React.ReactNode;
    tariffGrid: TariffGrid;
};

export const TariffGridTitle = ({title, tariffGrid}: TariffGridTitleProps) => {
    const hasPurchaseTariffGridsEnabled = useFeatureFlag("purchaseTariffGrids");

    const applicationDateType =
        tariffGridService.getTariffGridApplicationDateTypeTranslation(tariffGrid);
    const linesTypeLabel = tariffGridService.getLinesTypeLabel(tariffGrid.lines_type);

    return (
        <Flex
            alignItems="center"
            flexWrap="wrap"
            css={{gap: `${theme.space[2]}px`}}
            maxWidth={"86%"}
        >
            {title}
            <Flex css={{columnGap: `${theme.space[2]}px`}}>
                {hasPurchaseTariffGridsEnabled &&
                    (tariffGrid.owner_type === TariffGridOwnerType.SHIPPER ? (
                        <Badge variant="pink" shape="squared">
                            {t("tariffGrids.ownerTypeShipper")}
                        </Badge>
                    ) : (
                        <Badge variant="turquoise" shape="squared">
                            {t("tariffGrids.ownerTypeCarrier")}
                        </Badge>
                    ))}

                {!!applicationDateType && (
                    <Badge height="fit-content" data-testid="tariff-grid-application-date-type">
                        {applicationDateType}
                    </Badge>
                )}

                <Badge ml={3} data-testid="tariff-lines-type">
                    {linesTypeLabel}
                </Badge>
                {tariffGrid.current_version.start_date && (
                    <Badge ml={3} data-testid="current-tariff-grid-version-start-date">
                        {t("tariffGridVersion.startDate", {
                            date: formatDate(tariffGrid.current_version.start_date, "P"),
                        })}
                    </Badge>
                )}
            </Flex>
        </Flex>
    );
};
