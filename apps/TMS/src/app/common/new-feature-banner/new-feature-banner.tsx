import {updateAccountFeatureFlag} from "@dashdoc/web-common";
import {useFeatureFlag} from "@dashdoc/web-common";
import {getConnectedCompany} from "@dashdoc/web-common";
import {AnalyticsEvent, analyticsService} from "@dashdoc/web-common";
import {Logger} from "@dashdoc/web-core";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    CarouselModal,
    Link,
    SwitchInput,
    BoxProps,
    CarouselModalProps,
    Text,
} from "@dashdoc/web-ui";
import {FeatureFlags, useToggle} from "dashdoc-utils";
import React, {useState} from "react";
import {useHistory} from "react-router";

import {useDispatch, useSelector} from "app/redux/hooks";

export type NewFeatureBannerProps = {
    featureFlag: FeatureFlags;
    featureLabel: string;
    disabledMessage: string;
    enabledMessage: string;
    surveyLink?: string;
    learnMoreLink?: string;
    analyticsEvent?: AnalyticsEvent;
    carouselModalSteps?: CarouselModalProps["steps"];
} & BoxProps;

export function NewFeatureBanner({
    featureFlag,
    featureLabel,
    disabledMessage,
    enabledMessage,
    surveyLink,
    learnMoreLink,
    analyticsEvent,
    carouselModalSteps,
    ...boxProps
}: NewFeatureBannerProps) {
    const dispatch = useDispatch();
    const featureEnabled = useFeatureFlag(featureFlag);
    const [visuallyEnabled, setVisuallyEnabled] = useState(featureEnabled);
    const [isApplyingChange, setIsApplyingChange] = useState(false);
    const [isCarouselModalOpen, openCarouselModal, closeCarouselModal] = useToggle();
    const history = useHistory();

    const connectedCompany = useSelector(getConnectedCompany);

    const sendAnalyticsEventOnToggle = (enabled: boolean) => {
        if (!analyticsEvent) {
            return;
        }

        const segmentProperties = {
            "company id": connectedCompany?.pk,
            "new opt in state": enabled,
        };
        analyticsService.sendEvent(analyticsEvent, segmentProperties);
    };

    const handleUpdateFeatureFlag = async (value: boolean) => {
        setVisuallyEnabled(value);
        setIsApplyingChange(true);
        closeCarouselModal();

        try {
            await dispatch(updateAccountFeatureFlag({flagName: featureFlag, value}));
            history.push("/app/");
            if (analyticsEvent) {
                sendAnalyticsEventOnToggle(value);
            }
        } catch (error) {
            Logger.error(error);
        }
        setIsApplyingChange(false);
    };

    return (
        <Box
            width="100%"
            minHeight="40px"
            display="flex"
            backgroundColor="yellow.ultralight"
            alignItems="center"
            boxShadow="small"
            mb={4}
            {...boxProps}
        >
            <Box flex="4 1 auto" alignItems="center" justifyContent="center" display="flex" mx={4}>
                <Text
                    fontSize={12}
                    justifyContent="center"
                    textAlign="center"
                    mr={3}
                    ellipsis={true}
                >
                    {isApplyingChange
                        ? t("common.loading")
                        : featureEnabled
                          ? enabledMessage
                          : disabledMessage}
                </Text>
                {surveyLink && !isApplyingChange && featureEnabled && (
                    <Button paddingX={1} paddingY={1} variant="secondary">
                        <Link href={surveyLink} target="_blank" rel="noopener noreferrer">
                            {t("common.giveFeedback")}
                        </Link>
                    </Button>
                )}
                {learnMoreLink && featureEnabled && !isApplyingChange && (
                    <Link ml={2} href={learnMoreLink} target="_blank" rel="noopener noreferrer">
                        {t("common.findOutMore")}
                    </Link>
                )}
                {carouselModalSteps && !featureEnabled && !isApplyingChange && (
                    <Link ml={2} onClick={openCarouselModal} target="#" rel="noopener noreferrer">
                        {t("common.findOutMore")}
                    </Link>
                )}
            </Box>

            <Box mr={4}>
                <SwitchInput
                    labelRight={featureLabel}
                    value={visuallyEnabled}
                    onChange={(value: boolean) => {
                        if (carouselModalSteps && !isCarouselModalOpen && value) {
                            return openCarouselModal();
                        }

                        handleUpdateFeatureFlag(value);
                    }}
                    disabled={isApplyingChange}
                    data-testid="new-feature-banner-switch"
                />
            </Box>
            {isCarouselModalOpen && carouselModalSteps && (
                <CarouselModal
                    steps={carouselModalSteps}
                    onClose={closeCarouselModal}
                    onConfirmFinalStep={() => {
                        if (featureEnabled) {
                            closeCarouselModal();
                        } else {
                            handleUpdateFeatureFlag(true);
                        }
                    }}
                    data-testid="new-feature-banner-carousel-modal"
                />
            )}
        </Box>
    );
}
