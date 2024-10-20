import {useFeatureFlag} from "@dashdoc/web-common";
import {DndProvider} from "@dashdoc/web-ui";
import React from "react";

import {ActionableExtendedViewContext} from "app/common/ActionableExtendedViewContext";
import {CharteringScheduler} from "app/features/scheduler/carrier-scheduler/chartering-scheduler/CharteringScheduler";
import {SchedulerByTimeOnBoardingModal} from "app/features/scheduler/carrier-scheduler/components/on-boarding-modal/SchedulerByTimeOnBoardingModal";
import {DedicatedResourcesScheduler} from "app/features/scheduler/carrier-scheduler/dedicated-resources-scheduler/DedicatedResourcesScheduler";
import {CarrierTripScheduler} from "app/features/scheduler/carrier-scheduler/trip-scheduler/CarrierTripScheduler";
import {
    ResourcesQueryContext,
    useResourcesQueryContext,
} from "app/screens/scheduler/hook/useResourcesQueryContext";
import {useSchedulerViewsAndFilters} from "app/screens/scheduler/hook/useSchedulerViewsAndFilters";
import {PoolViewContext} from "app/screens/scheduler/hook/view/usePoolViewContext";
import {SchedulerViewContext} from "app/screens/scheduler/hook/view/useSchedulerViewContext";
import {PoolCurrentQueryContext} from "app/screens/trip/TripEditionScreen";

function CarrierSchedulerScreenWithoutExtendedView() {
    const {poolCurrentQueryContext, poolViewContext, schedulerViewContext} =
        useSchedulerViewsAndFilters();

    const resourcesQueryContext = useResourcesQueryContext(schedulerViewContext.viewPk);
    const hasDedicatedResourcesEnabled = useFeatureFlag("dedicatedResources");

    const getScheduler = () => {
        if (
            hasDedicatedResourcesEnabled &&
            poolCurrentQueryContext?.currentQuery?.view === "dedicated_resources"
        ) {
            return <DedicatedResourcesScheduler />;
        }

        if (poolCurrentQueryContext?.currentQuery?.view === "chartering") {
            return <CharteringScheduler />;
        }

        return (
            <PoolViewContext.Provider value={poolViewContext}>
                <CarrierTripScheduler />
            </PoolViewContext.Provider>
        );
    };

    return (
        <PoolCurrentQueryContext.Provider value={poolCurrentQueryContext}>
            <ResourcesQueryContext.Provider value={resourcesQueryContext}>
                <DndProvider>
                    <SchedulerViewContext.Provider value={schedulerViewContext}>
                        {getScheduler()}
                    </SchedulerViewContext.Provider>
                </DndProvider>
            </ResourcesQueryContext.Provider>
        </PoolCurrentQueryContext.Provider>
    );
}

export function CarrierSchedulerScreen() {
    // ActionableExtendedViewContext need to wrap component where useSchedulerViewsAndFilters is used
    return (
        <ActionableExtendedViewContext.Provider value={true}>
            <CarrierSchedulerScreenWithoutExtendedView />
            <SchedulerByTimeOnBoardingModal />
        </ActionableExtendedViewContext.Provider>
    );
}
