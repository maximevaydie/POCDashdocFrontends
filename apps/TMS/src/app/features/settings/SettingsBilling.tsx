import {apiService, fetchUsages, getManagersUsage, getTruckersUsage} from "@dashdoc/web-common";
import {BuildConstants, Logger, t} from "@dashdoc/web-core";
import {Box, Flex, Link, LoadingWheel, Text} from "@dashdoc/web-ui";
import * as Sentry from "@sentry/browser";
import {Subscription} from "dashdoc-utils";
import React, {useCallback, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";

import {ManagersUsageTooltipContent} from "app/features/subscription/ManagersUsageTooltipContent";
import {TruckersUsageTooltipContent} from "app/features/subscription/TruckersUsageTooltipContent";
import {UsageCard} from "app/features/subscription/UsageCard";
import {fetchCurrentSubscription} from "app/redux/actions/company/fetch-current-subscription";
import {RootState} from "app/redux/reducers/index";

let chargebeeInstance: ChargebeeInstance;
let chargebeePortal: any;

function BillingUpdate() {
    const [state, setState] = useState({
        loading: true,
        error: false,
    });

    const dispatch = useDispatch();
    const subscription: Subscription | null = useSelector(
        (state: RootState) => state.account.subscription
    );
    const managersUsage = useSelector(getManagersUsage);
    const truckersUsage = useSelector(getTruckersUsage);

    const fetchSubscription = useCallback(async () => {
        Chargebee.init({site: BuildConstants.chargebeeSiteName});
        chargebeeInstance = Chargebee.getInstance();

        try {
            await dispatch(fetchCurrentSubscription());
            await dispatch(fetchUsages());
            setState({loading: false, error: false});
        } catch (e) {
            setState({loading: false, error: true});
            Sentry.captureException(e);
            Logger.warn(e);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    const handleOpenPortalSection = (portalSection: string) => {
        if (subscription) {
            chargebeeInstance.setPortalSession(() => {
                return apiService.post("/billing/chargebee-create-portal-session/", undefined, {
                    apiVersion: "v4",
                });
            });
            chargebeePortal = chargebeeInstance.createChargebeePortal();
            chargebeePortal.openSection({
                sectionType: portalSection,
                params: {subscriptionId: subscription.chargebee_subscription_id},
            });
        } else {
            Logger.error("No subscription found for user. Cannot open the Chargebee portal.");
        }
    };

    const _renderNoSubscription = () => {
        const languageCode = BuildConstants.language.slice(0, 2);
        return (
            <Box>
                <Text variant="title" mb={4}>
                    {t("settings.payment")}
                </Text>
                <Box>
                    {t("settings.billing.noSubscription")}{" "}
                    <a
                        href={`https://www.dashdoc.com/${languageCode}/contact?utm_source=settings-billing-page`}
                    >
                        {t("settings.billing.salesContactLink")}
                    </a>
                </Box>
            </Box>
        );
    };

    const _renderSubscription = (subscription: Subscription) => {
        return (
            <Box>
                <Text variant="title" mb={4}>
                    {t("settings.payment")}
                </Text>
                <Text variant="h1" mt={4} mb={2}>
                    {t("settings.billing.informations")}
                </Text>
                <Box py={1}>
                    <Link
                        onClick={() =>
                            handleOpenPortalSection(Chargebee.getPortalSections().PAYMENT_SOURCES)
                        }
                        mb={4}
                    >
                        {t("settings.editPaymentDetails")}
                    </Link>
                </Box>

                <Box py={1}>
                    <Link
                        onClick={() =>
                            handleOpenPortalSection(Chargebee.getPortalSections().ADDRESS)
                        }
                        mb={4}
                    >
                        {t("settings.editBillingAddress")}
                    </Link>
                </Box>

                <Box py={1}>
                    <Link
                        onClick={() =>
                            handleOpenPortalSection(Chargebee.getPortalSections().ACCOUNT_DETAILS)
                        }
                        mb={4}
                    >
                        {t("settings.editBillingEmail")}
                    </Link>
                </Box>

                <Text variant="h1" mt={4} mb={2}>
                    {t("settings.subscriptionUseForCurrentPeriod")}
                </Text>
                <Flex style={{gap: "10px", flexWrap: "wrap"}}>
                    {managersUsage && (
                        <UsageCard
                            title={t("subscription.managersUsageTooltip.activeManagerTitle")}
                            used={managersUsage.used}
                            softLimit={managersUsage.soft_limit}
                            tooltipContent={
                                <ManagersUsageTooltipContent
                                    managers={managersUsage.used}
                                    managersSoftLimit={managersUsage.soft_limit}
                                    periodStartDate={managersUsage.period_start_date}
                                    periodEndDate={managersUsage.period_end_date}
                                />
                            }
                        />
                    )}
                    {truckersUsage && (
                        <UsageCard
                            title={t("subscription.truckersUsageTooltip.activeTruckerTitle")}
                            used={truckersUsage.used}
                            softLimit={truckersUsage.soft_limit}
                            tooltipContent={
                                <TruckersUsageTooltipContent
                                    truckers={truckersUsage.used}
                                    truckersSoftLimit={truckersUsage.soft_limit}
                                    periodStartDate={truckersUsage.period_start_date}
                                    periodEndDate={truckersUsage.period_end_date}
                                />
                            }
                        />
                    )}
                    {!managersUsage?.soft_limit && !truckersUsage?.soft_limit && (
                        <UsageCard
                            title={t("common.credits")}
                            used={subscription.current_used_credits}
                            tooltipContent={t("settings.billing.creditsTooltip")}
                        />
                    )}
                    <UsageCard
                        title={t("settings.SMSSent")}
                        used={subscription.current_used_texts}
                        tooltipContent={t("settings.billing.SMSTooltip")}
                    />
                </Flex>

                <Text variant="h1" mt={4} mb={2}>
                    {t("settings.billing.invoices")}
                </Text>

                <Box py={1}>
                    <Link
                        onClick={() =>
                            handleOpenPortalSection(Chargebee.getPortalSections().BILLING_HISTORY)
                        }
                        mb={4}
                    >
                        {t("settings.showInvoices")}
                    </Link>
                </Box>
            </Box>
        );
    };

    if (state.loading) {
        return <LoadingWheel />;
    } else if (state.error) {
        return <p className="text-danger">{t("common.error")}</p>;
    }
    if (subscription === null || subscription.chargebee_status !== "active") {
        return _renderNoSubscription();
    }
    return _renderSubscription(subscription);
}

export default BillingUpdate;
