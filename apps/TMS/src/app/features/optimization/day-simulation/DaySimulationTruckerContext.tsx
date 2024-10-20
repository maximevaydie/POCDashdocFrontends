import {createContext} from "react";

import {TruckerForScheduler} from "app/features/scheduler/carrier-scheduler/trip-scheduler/services/tripScheduler.types";

export const DaySimulationTruckerContext = createContext<{
    setDaySimulationParameters: (daySimulationParameters: {
        trucker: TruckerForScheduler | null;
        initialDate: Date | null;
    }) => void;
}>({
    setDaySimulationParameters: () => {},
});
