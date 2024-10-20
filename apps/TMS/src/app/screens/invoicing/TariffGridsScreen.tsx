import {HasFeatureFlag, HasNotFeatureFlag} from "@dashdoc/web-common";
import React from "react";
import {RouteComponentProps} from "react-router";

import {TariffGridsScreenLegacy} from "app/screens/invoicing/TariffGridsScreenLegacy";
import {TariffGridsScreenNew} from "app/screens/invoicing/TariffGridsScreenNew";

export type TariffGridsScreenProps = RouteComponentProps;

export function TariffGridsScreen(props: TariffGridsScreenProps) {
    return (
        <>
            <HasFeatureFlag flagName="purchaseTariffGrids">
                <TariffGridsScreenNew />
            </HasFeatureFlag>

            <HasNotFeatureFlag flagName="purchaseTariffGrids">
                <TariffGridsScreenLegacy {...props} />
            </HasNotFeatureFlag>
        </>
    );
}
