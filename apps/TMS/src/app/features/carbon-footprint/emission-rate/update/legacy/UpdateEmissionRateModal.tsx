import {t} from "@dashdoc/web-core";
import {Flex, LoadingWheel, Modal, Text} from "@dashdoc/web-ui";
import {endOfDay, previousFriday, startOfDay, subMonths} from "date-fns";
import React from "react";

import {CarbonFootprintOnboardingIcon} from "app/features/carbon-footprint/CarbonFootprintOnboardingIcon";
import {TransportOperationCategory} from "app/services/carbon-footprint/TransportOperationCategoryApi.service";

import {UpdateEmissionRate} from "./UpdateEmissionRate";
import {UpdateInitialEmissionRate} from "./UpdateInitialEmissionRate";
import {useCollectTonneKilometer} from "./useCollectTonneKilometer";

type Props = {
    transportOperationCategory: TransportOperationCategory;
    onClose: (didUpdate?: boolean) => void;
};

/**
 * @legacy will be replaced by ../UpdateEmissionRateModal
 */
export function UpdateEmissionRateModal({transportOperationCategory, onClose}: Props) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const updateEmissionRateRef = React.useRef<{
        submit: (e?: React.FormEvent<HTMLFormElement>) => void;
    }>(null);
    const updateInitialEmissionRateRef = React.useRef<{
        submit: (e?: React.FormEvent<HTMLFormElement>) => void;
    }>(null);
    const {referencePeriod, collectResult, collectLoading} = useCollectTonneKilometer(
        transportOperationCategory.uid,
        getDefaultReferencePeriod()
    );

    const submit = async () => {
        updateEmissionRateRef.current?.submit();
        updateInitialEmissionRateRef.current?.submit();
    };

    const _renderContent = () => {
        if (collectLoading) {
            return (
                <Text>
                    {t("carbonFootprint.emissionRateModal.loading")} <LoadingWheel small inline />
                </Text>
            );
        }
        if (collectResult.transport_count === 0) {
            return (
                <UpdateInitialEmissionRate
                    transportOperationCategory={transportOperationCategory}
                    onClose={onClose}
                    setIsSubmitting={setIsSubmitting}
                    ref={updateInitialEmissionRateRef}
                />
            );
        }
        return (
            <UpdateEmissionRate
                referencePeriod={referencePeriod}
                transportOperationCategory={transportOperationCategory}
                onClose={onClose}
                ref={updateEmissionRateRef}
                collectResult={collectResult}
                setIsSubmitting={setIsSubmitting}
            />
        );
    };

    return (
        <Modal
            title={
                <Flex>
                    <Text variant="title">{t("carbonFootprint.emissionRateModal.title")}</Text>
                    <CarbonFootprintOnboardingIcon ml={3} />
                </Flex>
            }
            onClose={onClose}
            mainButton={{
                onClick: () => submit(),
                loading: isSubmitting,
                disabled: collectLoading,
            }}
            size="large"
        >
            {_renderContent()}
        </Modal>
    );

    function getDefaultReferencePeriod() {
        // The default period is the last 6 months from last friday
        const end = endOfDay(previousFriday(new Date()));
        const start = startOfDay(subMonths(end, 6));
        return {start, end};
    }
}
