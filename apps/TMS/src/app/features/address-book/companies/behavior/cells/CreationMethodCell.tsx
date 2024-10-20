import {useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {NoWrap, Text} from "@dashdoc/web-ui";
import {CreationMethod, Address, parseAndZoneDate} from "dashdoc-utils";
import React from "react";

import {DateCell} from "app/features/transport/transports-list/TransportColumns";

type Props = {
    address: Address;
};

export function CreationMethodCell({address}: Props) {
    const timezone = useTimezone();
    const zonedDate = parseAndZoneDate(address.created ?? null, timezone);
    const creationMethodLabel = getCreationMethodLabel(address.creation_method);
    const createdByUser = address.created_by_user?.display_name;
    const createdBy = address.created_by?.name;
    return (
        <NoWrap>
            {creationMethodLabel && (
                <Text variant="caption" lineHeight={0}>
                    {creationMethodLabel}
                </Text>
            )}
            {createdByUser && (
                <Text variant="caption" lineHeight={0}>
                    {address.created_by_user?.display_name ?? ""}
                </Text>
            )}
            {createdBy && (
                <Text variant="caption" lineHeight={0}>
                    {address.created_by?.name ?? ""}
                </Text>
            )}
            {zonedDate && (
                <Text variant="caption" lineHeight={0}>
                    <DateCell zonedDate={zonedDate} />
                </Text>
            )}
        </NoWrap>
    );
}

const getCreationMethodLabel = (creationMethod: CreationMethod | undefined) => {
    switch (creationMethod) {
        case "partner":
            return t("address.partner");
        case "api":
            return t("address.api");
        case "manager":
            return t("address.manager");
        case "trucker":
            return t("address.trucker");
        default:
            return "";
    }
};
