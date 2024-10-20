import React, {createContext} from "react";
import createPersistedState from "use-persisted-state";

const PREDEFINED_FILTERS_STORAGE_KEY = "main-sidebar-collapsed";

const useSidebarCollapsed = createPersistedState(PREDEFINED_FILTERS_STORAGE_KEY);

type CollapsedState = {
    collapsed: boolean;
    animation: string | undefined;
    setCollapsed: (collapsed: boolean) => void;
};

/**
 * A context to store the collapsed state.
 *
 * Usage in a child component:
 * ```
 * const {animation, collapsed,   setCollapsed} = useContext(CollapsedContext);
 * ```
 */
export const CollapsedContext = createContext<CollapsedState>({
    animation: undefined,
    collapsed: false,
    setCollapsed: () => {},
});

type Props = {
    children: React.ReactNode;
};
export function CollapsedProvider({children}: Props) {
    const [collapsed, setCollapsed] = useSidebarCollapsed(false);
    const animation = collapsed ? "collapse" : "expand";
    const value: CollapsedState = {
        animation,
        collapsed,
        setCollapsed,
    };
    return <CollapsedContext.Provider value={value}>{children}</CollapsedContext.Provider>;
}
