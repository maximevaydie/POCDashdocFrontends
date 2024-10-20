import {t} from "@dashdoc/web-core";
import {ClickableAddRegion, Flex, Icon, theme} from "@dashdoc/web-ui";
import * as React from "react";

import {UpdatableAddress} from "app/features/address/updatable-address";

import type {Activity} from "app/types/transport";

type ActivityAddressProps = {
    activity: Activity;
    updatesAllowed: boolean;
    refUpdateAllowed: boolean;
    showReference?: boolean;
    onEditReferenceModalShown?: (payload: {
        siteUid: string;
        role: "carrier" | "shipper" | "origin" | "destination";
        reference: string;
    }) => any;
    onViewReferenceModalShown?: (reference: string) => void;
    onActivityAddressModalShown: (activity: Activity) => any;
};

function ActivityAddress({
    activity,
    updatesAllowed,
    refUpdateAllowed,
    showReference,
    onEditReferenceModalShown,
    onViewReferenceModalShown,
    onActivityAddressModalShown,
}: ActivityAddressProps): JSX.Element {
    let role: "origin" | "destination";
    if (activity.type === "loading" || activity.type === "bulkingBreakEnd") {
        role = "origin";
    }
    if (activity.type === "unloading" || activity.type === "bulkingBreakStart") {
        role = "destination";
    }
    // @ts-ignore
    if (!role) {
        // @ts-ignore
        return undefined;
    }

    if (activity.site.address) {
        const reference = activity.site.reference;
        const siteUid = activity.site.uid;
        return (
            <React.Fragment>
                <UpdatableAddress
                    onClick={() => onActivityAddressModalShown(activity)}
                    addressUpdateAllowed={updatesAllowed}
                    showReference={showReference}
                    refUpdateAllowed={refUpdateAllowed}
                    onEditReferenceClick={(reference) =>
                        onEditReferenceModalShown?.({reference, siteUid, role})
                    }
                    onViewReferenceClick={(reference) => onViewReferenceModalShown?.(reference)}
                    address={activity.site.address}
                    reference={reference}
                    iconColor={theme.colors.blue.dark}
                    data-testid={role}
                />
            </React.Fragment>
        );
    }

    if (
        updatesAllowed &&
        (["loading", "unloading"].includes(activity.type) || activity.siteType === "bulkingBreak")
    ) {
        return (
            <ClickableAddRegion onClick={() => onActivityAddressModalShown(activity)}>
                <Flex
                    data-testid={"activity-add-address"}
                    as="span"
                    color="grey.dark"
                    alignItems="center"
                >
                    <Icon name="add" mr={1} />
                    {t("components.addLogisticPoint")}
                </Flex>
            </ClickableAddRegion>
        );
    }

    // @ts-ignore
    return null;
}

ActivityAddress.displayName = "ActivityAddress";

export default ActivityAddress;
