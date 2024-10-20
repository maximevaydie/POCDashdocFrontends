import {getConnectedCompany, useFeatureFlag} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {EditableField, Flex} from "@dashdoc/web-ui";
import React from "react";

import {
    getTotalDistanceBySegmentUid,
    DistanceBySegment,
} from "app/features/transport/distance/getTotalDistanceBySegmentUid";
import {InformationBlockTitle} from "app/features/transport/transport-information/information-block-title";
import {useSelector} from "app/redux/hooks";
import {transportRightService} from "app/services/transport";

import {CarbonFootprintBanner} from "../../transport-information/carbon-footprint/CarbonFootprintBanner";

import {NumberStat} from "./NumberStat";
import {TripStartEndStats} from "./TripStartEndStats";

import type {Transport} from "app/types/transport";

type Props = {
    transport: Transport;
    onClickOnDistance: () => void;
};

export const TransportStats = ({transport, onClickOnDistance}: Props) => {
    const connectedCompany = useSelector(getConnectedCompany);

    const hasInvoiceEntityEnabled = useFeatureFlag("invoice-entity");

    const canEditTransportDistance = transportRightService.canEditTransportDistance(
        transport,
        connectedCompany?.pk,
        hasInvoiceEntityEnabled
    );

    const totalTransportDistance = getTotalDistanceBySegmentUid(
        transport.segments as any as DistanceBySegment
    );

    const hasTripStartEnd = connectedCompany?.settings?.trip_start_end;

    return (
        <Flex flexWrap="wrap">
            {hasTripStartEnd ? (
                <TripStartEndStats transport={transport} />
            ) : (
                <InformationBlockTitle
                    iconName="roadStraight"
                    label={t("activity.distanceSubtitle")}
                    minWidth="200px"
                    p={3}
                >
                    <EditableField
                        clickable={canEditTransportDistance}
                        label={""}
                        value={
                            <NumberStat
                                value={totalTransportDistance}
                                unit={t("common.units.km")}
                            />
                        }
                        onClick={onClickOnDistance}
                        data-testid="transport-details-distance"
                    />
                </InformationBlockTitle>
            )}
            <CarbonFootprintBanner transport={transport} verticalDisplay minWidth="220px" />
        </Flex>
    );
};
