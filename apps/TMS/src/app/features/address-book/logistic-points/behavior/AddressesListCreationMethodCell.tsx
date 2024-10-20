import {LogisticPoint, useTimezone} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {NoWrap, Text} from "@dashdoc/web-ui";
import {CreationMethod, parseAndZoneDate} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {DateCell} from "app/features/transport/transports-list/TransportColumns";

type Props = {
    logisticPoint: LogisticPoint;
    searchWords: string[];
};

export const AddressesListCreationMethodCell: FunctionComponent<Props> = ({logisticPoint}) => {
    const timezone = useTimezone();
    const zonedDate = parseAndZoneDate(logisticPoint.created, timezone);
    const creationMethodLabel = getCreationMethodLabel(logisticPoint.creation_method);
    const createdByUser = logisticPoint.created_by_user?.display_name;
    const createdBy = logisticPoint.created_by?.name;
    return (
        <NoWrap>
            {creationMethodLabel && (
                <Text variant="caption" lineHeight={0}>
                    {creationMethodLabel}
                </Text>
            )}
            {createdByUser && (
                <Text variant="caption" lineHeight={0}>
                    {logisticPoint.created_by_user?.display_name ?? ""}
                </Text>
            )}
            {createdBy && (
                <Text variant="caption" lineHeight={0}>
                    {logisticPoint.created_by?.name ?? ""}
                </Text>
            )}
            {zonedDate && (
                <Text variant="caption" lineHeight={0}>
                    <DateCell zonedDate={zonedDate} />
                </Text>
            )}
        </NoWrap>
    );
};
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
