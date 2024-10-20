import {createContext} from "react";

import {FleetScreenQuery} from "app/screens/fleet/FleetScreen";

interface FleetScreenContextProps {
    currentQuery: FleetScreenQuery;
    currentPage: number;
    searchFleetItems: (
        currentQuery: FleetScreenQuery,
        page: number | {fromPage: number; toPage: number}
    ) => void;
}

export const FleetScreenContext = createContext<FleetScreenContextProps>({
    currentQuery: {},
    currentPage: 1,
    searchFleetItems: () => {},
});
