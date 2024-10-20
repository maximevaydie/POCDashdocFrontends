import {createContext} from "react";

import {TruckersScreenQuery} from "app/screens/fleet/truckers/TruckersScreen";

interface TruckersScreenContextProps {
    currentQuery: TruckersScreenQuery;
    currentPage: number;
    fetchTruckers: (
        currentQuery: TruckersScreenQuery,
        page: number | {fromPage: number; toPage: number}
    ) => void;
}

export const TruckersScreenContext = createContext<TruckersScreenContextProps>({
    currentQuery: {
        text: [],
        carrier__in: [],
        trucker__in: [],
    },
    currentPage: 1,
    fetchTruckers: () => {},
});
