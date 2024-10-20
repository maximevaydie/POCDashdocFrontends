import {FilterData, getBooleanChoiceFilter} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";

export type HasSecurityProtocolQuery = {
    has_security_protocol?: boolean;
};

export function getHasSecurityProtocolFilter(
    ignore = false
): FilterData<HasSecurityProtocolQuery> {
    return getBooleanChoiceFilter<HasSecurityProtocolQuery>({
        key: "has-security-protocol",
        testId: "has-security-protocol",
        label: t("common.securityProtocol"),
        icon: "securityProtocol",
        conditionLabel: `${t("filter.securityProtocol.isProvided").toLowerCase()} / ${t("filter.securityProtocol.isNotProvided").toLowerCase()}`,
        optionsLabels: {
            on: t("filter.securityProtocol.isProvided"),
            off: t("filter.securityProtocol.isNotProvided"),
        },
        badgeOptionsLabels: {
            on: `${t("common.securityProtocol")} ${t("filter.securityProtocol.isProvided").toLowerCase()}`,
            off: `${t("common.securityProtocol")} ${t("filter.securityProtocol.isNotProvided").toLowerCase()}`,
        },
        queryKey: "has_security_protocol",
        ignore,
    });
}
