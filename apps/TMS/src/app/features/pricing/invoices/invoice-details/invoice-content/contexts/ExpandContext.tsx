import React, {createContext, FC, useContext, useState} from "react";

import {GroupUngroupContext} from "./GroupUngroupContext";

import type {LineGroup} from "app/taxation/invoicing/types/invoiceOrCreditNote.types";

interface Context {
    allExpanded: boolean;
    isExpanded: (lineId: number) => boolean;
    onClickOnLine: (lineId: number) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
}
const initialContext: Context = {
    allExpanded: false,
    isExpanded: () => false,
    onClickOnLine: () => {},
    onExpandAll: () => {},
    onCollapseAll: () => {},
};

/**
 * A context to store the state of the expanded invoice lines and a way to expand/collapse them.
 *
 * Usage in a child component:
 * ```
 * const {...} = useContext(ExpandContext);
 * ```
 */
export const ExpandContext = createContext(initialContext);

type ExpandContextProviderProps = {
    groups: LineGroup[];
    children: React.ReactNode;
};
export const ExpandContextProvider: FC<ExpandContextProviderProps> = ({children, groups}) => {
    const [{expandedLineIds, allExpanded}, setState] = useState<{
        expandedLineIds: number[];
        allExpanded: boolean;
    }>({expandedLineIds: [], allExpanded: false});

    const {isGrouped, ungroup, group} = useContext(GroupUngroupContext);

    const everyLineIsExpanded =
        groups.every((lineGroup) => expandedLineIds.includes(lineGroup.id)) ?? false;

    const isExpanded = (lineId: number) => {
        return expandedLineIds.includes(lineId);
    };

    const onClickOnLine = (lineId: number) => {
        if (groups.map((line) => line.id).includes(lineId)) {
            if (!expandedLineIds.includes(lineId)) {
                setState((prev) => ({
                    ...prev,
                    expandedLineIds: [...expandedLineIds, lineId],
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    expandedLineIds: expandedLineIds.filter((id) => id !== lineId),
                }));
            }
        }
    };

    const onExpandAll = () => {
        ungroup();
        setState((prev) => ({
            ...prev,
            allExpanded: false,
            expandedLineIds: groups.map((lineGroup) => lineGroup.id) ?? [],
        }));
    };

    const onCollapseAll = () => {
        group();
        setState((prev) => ({
            ...prev,
            allExpanded: false,
            expandedLineIds: [],
        }));
    };

    const value: Context = {
        allExpanded: !isGrouped && (allExpanded || everyLineIsExpanded),
        isExpanded,
        onClickOnLine,
        onExpandAll,
        onCollapseAll,
    };

    return <ExpandContext.Provider value={value}>{children}</ExpandContext.Provider>;
};
