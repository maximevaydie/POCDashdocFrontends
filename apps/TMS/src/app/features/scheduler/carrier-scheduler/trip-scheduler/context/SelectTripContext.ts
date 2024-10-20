import React from "react";

export const SelectTripContext = React.createContext<(tripUid: string) => void>(() => {
    () => {};
});
