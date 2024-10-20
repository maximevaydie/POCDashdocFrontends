import {useTimezone} from "@dashdoc/web-common";
import {getConnectedCompanyId} from "@dashdoc/web-common";
import {Box, Flex, Link, TooltipWrapper} from "@dashdoc/web-ui";
import React from "react";

import {useSelector} from "app/redux/hooks";
import {
    getOneWordVisibilityLabel,
    getStatusUpdateRelatedObjectInfo,
    getStatusUpdateText,
    getVisibilityLabelText,
} from "app/services/transport";

import {ActivityElement} from "./ActivityElement";
import {UpdateDetails} from "./UpdateDetails";

import type {Site, Transport, TransportStatus} from "app/types/transport";

export function StatusUpdate({
    transport,
    statusUpdate,
    isOrder,
}: {
    transport: Transport;
    statusUpdate: TransportStatus;
    isOrder: boolean;
}) {
    const timezone = useTimezone();
    const sites = useSelector((state) => Object.values(state.entities.sites ?? {}));
    let additionalInfo: {
        transport: Transport;
        companyName?: string;
        postCode?: string;
        timezone: string;
        siteCategory?: Site["category"];
        siteIndex?: number;
    } = {
        transport,
        timezone,
    };
    if (statusUpdate.category === "on_the_way") {
        const site = sites.find(({uid}) => uid === statusUpdate.site);
        additionalInfo.companyName = site?.address?.company?.name || "";
        additionalInfo.postCode = site?.address?.postcode;
    }
    if (
        [
            "loading_complete",
            "unloading_complete",
            "activity.undone",
            "supports_exchange.amended",
        ].includes(statusUpdate.category)
    ) {
        const site = sites.find(({uid}) => uid === statusUpdate.site);
        if (site) {
            additionalInfo.siteCategory = site.category;

            const segments = transport.segments;

            const orderedSiteUids: string[] = [];

            for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
                let segment = segments[segmentIndex];
                let lastSiteUid = orderedSiteUids[orderedSiteUids.length - 1];
                if (segment.origin.uid !== lastSiteUid) {
                    orderedSiteUids.push(segment.origin.uid);
                }
                orderedSiteUids.push(segment.destination.uid);
            }

            additionalInfo.siteIndex = orderedSiteUids.indexOf(site.uid) + 1;
        }
    }

    const title = getStatusUpdateText(statusUpdate, isOrder, additionalInfo);

    const subtitleDetails = (
        <>
            {" · "}
            {/* It looks like we don't have the data visibility_level on statusUpdate
            TODO Remove this section OR fix it */}
            <TooltipWrapper
                content={getVisibilityLabelText((statusUpdate as any).visibility_level)}
            >
                <Flex ml={1} alignItems="center">
                    {getOneWordVisibilityLabel((statusUpdate as any).visibility_level)}
                </Flex>
            </TooltipWrapper>
        </>
    );

    return (
        <ActivityElement
            title={title}
            subtitleDetails={subtitleDetails}
            data-testid={`status-update-${statusUpdate.category}`}
            update={statusUpdate}
            isAmendEvent={[
                "invoice_number_removed",
                "amended",
                "activity.amended",
                "uninvoiced",
                "delivery_load.amended",
                "rest.amended",
                "supports_exchange.amended",
            ].includes(statusUpdate.category)}
            relatedObjectInfo={<RelatedObjectInfo statusUpdate={statusUpdate} />}
        >
            {!!statusUpdate.update_details && (
                <UpdateDetails update={statusUpdate} siteCategory={additionalInfo.siteCategory} />
            )}
        </ActivityElement>
    );
}

function RelatedObjectInfo({statusUpdate}: {statusUpdate: TransportStatus}) {
    const companyPk = useSelector(getConnectedCompanyId);
    const info = getStatusUpdateRelatedObjectInfo(statusUpdate, companyPk);
    if (!info) {
        return null;
    }

    if (info.target) {
        return (
            <Box as="span">
                {"("}
                {info.prefix}
                <Link href={info.target} target="_blank" rel="noopener noreferrer">
                    {info.text}
                </Link>
                {")"}
            </Box>
        );
    }

    return <Box as="span">{"(" + info.text + ")"}</Box>;
}
