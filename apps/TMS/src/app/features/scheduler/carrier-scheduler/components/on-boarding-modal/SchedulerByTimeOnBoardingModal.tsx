import {cookiesService, t} from "@dashdoc/web-core";
import {CarouselModal, Flex, Text, Box} from "@dashdoc/web-ui";
import React, {useState} from "react";

import {OnBoardingStep1Image} from "app/features/scheduler/carrier-scheduler/components/on-boarding-modal/OnBoardingStep1Image";
import {OnBoardingStep2Image} from "app/features/scheduler/carrier-scheduler/components/on-boarding-modal/OnBoardingStep2Image";
import {OnBoardingStep3Image} from "app/features/scheduler/carrier-scheduler/components/on-boarding-modal/OnBoardingStep3Image";
import {useSchedulerByTimeEnabled} from "app/hooks/useSchedulerByTimeEnabled";

const cookieKey = "onBoardingSchedulerByTimeModalSeen";
export function SchedulerByTimeOnBoardingModal() {
    const hasSchedulerByTimeEnabled = useSchedulerByTimeEnabled();

    const [modalAlreadySeen, setModalAlreadySeen] = useState<boolean>(
        cookiesService.getCookie(cookieKey) === "true"
    );

    const steps = [
        {
            header: t("schedulerByTime.onBoarding.title"),
            content: (
                <Flex>
                    <Box>
                        <Text variant="h1" mb={4}>
                            {t("schedulerByTime.onBoarding.step1.main")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step1.1")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step1.2")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step1.3")}
                        </Text>
                    </Box>
                    <OnBoardingStep1Image />
                </Flex>
            ),
        },
        {
            header: t("schedulerByTime.onBoarding.title"),
            content: (
                <Flex>
                    <Box>
                        <Text variant="h1" mb={4}>
                            {t("schedulerByTime.onBoarding.step2.main")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step2.1")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step2.2")}
                        </Text>
                        <Text as="li" mb={1}>
                            {t("schedulerByTime.onBoarding.step2.3")}
                        </Text>
                    </Box>
                    <OnBoardingStep2Image />
                </Flex>
            ),
        },
        {
            header: t("schedulerByTime.onBoarding.title"),
            content: (
                <Box>
                    <Text variant="h1" mb={4}>
                        {t("schedulerByTime.onBoarding.step3.main")}
                    </Text>
                    <Text as="li" mb={1}>
                        {t("schedulerByTime.onBoarding.step3.1")}
                    </Text>
                    <Text as="li" mb={1}>
                        {t("schedulerByTime.onBoarding.step3.2")}
                    </Text>
                    <OnBoardingStep3Image />
                </Box>
            ),
        },
    ];

    return hasSchedulerByTimeEnabled && !modalAlreadySeen ? (
        <CarouselModal steps={steps} onConfirmFinalStep={hideModal} onClose={hideModal} />
    ) : null;

    function hideModal() {
        cookiesService.setCookie(cookieKey, "true", 365);
        setModalAlreadySeen(true);
    }
}
