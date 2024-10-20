import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import {CountBadge} from "@dashdoc/web-ui";
import {Header} from "@dashdoc/web-ui";
import React, {FunctionComponent} from "react";

export interface OffersHeaderProps {
    offersCount: number;
}

export const OffersHeader: FunctionComponent<OffersHeaderProps> = ({offersCount}) => (
    <Header title={t("shipper.requiresAssignCarrier")}>
        {offersCount > 0 && (
            <CountBadge value={offersCount} data-testid="offers-header-badge-count" />
        )}
        <Text>{t("shipper.carrierOffers", {smart_count: offersCount})}</Text>
    </Header>
);
