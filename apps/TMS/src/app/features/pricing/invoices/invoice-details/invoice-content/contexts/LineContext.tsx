import {Box} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {createContext, FC, useContext} from "react";

import {ExpandContext} from "./ExpandContext";

interface Context {
    mouseOnLine: boolean;
    lineExpanded: boolean;
}
const initialContext: Context = {
    mouseOnLine: false,
    lineExpanded: false,
};

/**
 * A context to store the line state.
 *
 * Usage in a child component:
 * ```
 * const {...} = useContext(LineContext);
 * ```
 */
export const LineContext = createContext(initialContext);

type LineContextProps = {
    lineId: number;
    children: React.ReactNode;
};
export const LineContextProvider: FC<LineContextProps> = ({lineId, children}) => {
    const [mouseOnLine, setMouseOnLine, setMouseNotOnLine] = useToggle(false);

    const {isExpanded} = useContext(ExpandContext);
    const lineExpanded = isExpanded(lineId);

    const value: Context = {
        mouseOnLine,
        lineExpanded,
    };

    return (
        <LineContext.Provider value={value}>
            <Box onMouseEnter={setMouseOnLine} onMouseLeave={setMouseNotOnLine}>
                {children}
            </Box>
        </LineContext.Provider>
    );
};
