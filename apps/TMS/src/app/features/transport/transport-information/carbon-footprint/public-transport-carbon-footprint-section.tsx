import {Card} from "@dashdoc/web-ui";
import React from "react";

import {CarbonFootprintBanner, CarbonFootprintBannerProps} from "./CarbonFootprintBanner";

export const PublicTransportCarbonFootprintSection: React.FunctionComponent<
    CarbonFootprintBannerProps
> = (carbonFootprintBannerProps) => {
    const hasCarbonFootprint =
        carbonFootprintBannerProps.transport.estimated_carbon_footprint !== null ||
        carbonFootprintBannerProps.transport.user_carbon_footprint !== null;

    if (!hasCarbonFootprint) {
        return null;
    }

    return (
        <Card ml={3} mb={3} flex="1" p={3}>
            <CarbonFootprintBanner {...carbonFootprintBannerProps} />
        </Card>
    );
};
