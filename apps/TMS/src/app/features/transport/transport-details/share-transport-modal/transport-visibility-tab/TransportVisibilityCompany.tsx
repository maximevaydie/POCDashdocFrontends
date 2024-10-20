import {companyService, useBaseUrl, verifiedIcon} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Badge,
    Box,
    Button,
    ClickableFlex,
    CompanyAvatar,
    Flex,
    Icon,
    Text,
    TooltipWrapper,
} from "@dashdoc/web-ui";
import {formatDateDistance} from "dashdoc-utils";
import {
    TransportVisibilityResponse,
    TransportVisibilityRole,
} from "dashdoc-utils/dist/api/scopes/transports";
import React from "react";

type Props = {
    company: TransportVisibilityResponse[0];
    onInviteClick: (company: TransportVisibilityResponse[0]) => void;
};

export function TransportVisibilityCompany({company, onInviteClick}: Props) {
    const baseUrl = useBaseUrl();

    return (
        <ClickableFlex
            key={company.pk}
            flexDirection="row"
            flex="1"
            borderRadius={2}
            p={2}
            onClick={() => {
                if (company.can_view_details) {
                    const link = companyService.getPartnerLink(baseUrl, company);
                    window.open(link);
                }
            }}
            disabled={!company.can_view_details}
        >
            <Flex flex={2} alignItems="center" mr={2}>
                <CompanyAvatar name={company.name} logo={company.logo} />
                <Box ml={3} py={1}>
                    <Flex alignItems="baseline">
                        <Box>
                            <Text
                                lineHeight="16px"
                                color={
                                    company.invitation_status === "registered"
                                        ? "grey.ultradark"
                                        : "grey.dark"
                                }
                            >
                                {company.name}
                            </Text>
                        </Box>
                        {company.roles.indexOf("creator") !== -1 && (
                            <Badge ml={2} variant="blue" shape="squared">
                                <Text variant="subcaption" color="blue.dark">
                                    {getRoleLabel("creator")}
                                </Text>
                            </Badge>
                        )}
                    </Flex>
                    <Flex>
                        <Text variant="caption" alignItems="center" mt={1} color="grey.dark">
                            {company.roles
                                .filter((r) => r !== "creator") // shown as a badge
                                .map(getRoleLabel)
                                .join(", ")}
                        </Text>
                    </Flex>
                </Box>
            </Flex>

            <Flex alignItems="flex-end" justifyContent="flex-start" flexDirection="column">
                <Flex>
                    <Flex alignItems="flex-end" flexDirection="column" mr={2}>
                        <Flex>
                            {company.can_invite_to && (
                                <TooltipWrapper
                                    content={t(
                                        "transportDetails.shareTransportModal.pendingInvitesCountTooltip"
                                    )}
                                >
                                    <Badge
                                        variant="neutral"
                                        height="38px"
                                        alignItems="center"
                                        data-testid="pending-invitations-count-badge"
                                        shape="squared"
                                    >
                                        <Icon name="hourglass" color="grey.dark" mr={2} />
                                        <Text color="grey.dark" variant="h1">
                                            {company.pending_invitations_count}
                                        </Text>
                                    </Badge>
                                </TooltipWrapper>
                            )}
                            <TooltipWrapper
                                content={
                                    company.account_type === "subscribed"
                                        ? t(
                                              "transportDetails.shareTransportModal.subscribedManagersCountTooltip"
                                          )
                                        : t(
                                              "transportDetails.shareTransportModal.invitedManagersCountTooltip"
                                          )
                                }
                            >
                                <Badge
                                    variant={
                                        company.invitation_status === "registered"
                                            ? "success"
                                            : "neutral"
                                    }
                                    height="38px"
                                    alignItems="center"
                                    ml={2}
                                    data-testid="managers-count-badge"
                                    shape="squared"
                                >
                                    <Icon name="user" color="grey.dark" mr={2} />
                                    <Text
                                        color={
                                            company.invitation_status === "registered"
                                                ? "green.dark"
                                                : "grey.dark"
                                        }
                                        variant="h1"
                                    >
                                        {company.managers_count}
                                    </Text>
                                </Badge>
                            </TooltipWrapper>
                        </Flex>
                        {company.last_login && company.invitation_status === "registered" && (
                            <Text variant="subcaption" color="grey.dark">
                                {t("transportDetails.shareTransportModal.lastLogin", {
                                    lastLogin: formatDateDistance(company.last_login),
                                })}
                            </Text>
                        )}
                    </Flex>
                    <Flex flexDirection="column" minWidth="150px">
                        {company.account_type === "subscribed" && (
                            <Badge
                                variant="blue"
                                height="38px"
                                alignItems="center"
                                width="100%"
                                justifyContent="center"
                                shape="squared"
                            >
                                <Text color="blue.dark">
                                    {t("common.dashdocCustomer")} {verifiedIcon}
                                </Text>
                            </Badge>
                        )}

                        {company.can_invite_to && company.can_view_details && (
                            <Button
                                variant="secondary"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onInviteClick(company);
                                }}
                                data-testid="transport-share-modal-invite-link"
                            >
                                {t("transportDetails.shareTransportModal.inviteContactButton")}
                            </Button>
                        )}
                        {company.account_type !== "subscribed" &&
                            (!company.can_invite_to || !company.can_view_details) && (
                                <TooltipWrapper
                                    content={t(
                                        "transportDetails.shareTransportModal.managedByThirdPartyTooltip",
                                        {
                                            name: company.managed_by_name,
                                        }
                                    )}
                                >
                                    <Flex
                                        height="38px"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text color="grey.dark">
                                            {t(
                                                "transportDetails.shareTransportModal.managedByThirdParty"
                                            )}
                                        </Text>
                                        <Icon name="info" ml={2} />
                                    </Flex>
                                </TooltipWrapper>
                            )}
                        <Text variant="subcaption"> </Text>
                    </Flex>
                </Flex>
            </Flex>
        </ClickableFlex>
    );
}

function getRoleLabel(role: TransportVisibilityRole) {
    const roleLabels: Record<TransportVisibilityRole, string> = {
        creator: t("common.creator"),
        carrier: t("common.carrier"),
        shipper: t("common.shipper"),
        customer_to_invoice: t("common.customerToInvoice"),
        rental_carrier: t("transportDetails.shareTransportModal.rentalCarrier"),
        site: t("common.site"),
    };
    return roleLabels[role];
}
