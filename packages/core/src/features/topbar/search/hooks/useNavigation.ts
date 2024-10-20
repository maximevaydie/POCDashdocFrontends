import {useReducer, useEffect} from "react";

type SlotNavigationState = {
    selectedIndex: number;
    selectedSlotId: number | null;
};

type SlotNavigationAction = {
    type: "arrowUp" | "arrowDown" | "enter";
    payload: number;
};

export function useNavigation(
    initialState: SlotNavigationState,
    flattenedSlots: {id: number}[],
    onEnter: () => void
): SlotNavigationState {
    const reducer = (
        state: SlotNavigationState,
        action: SlotNavigationAction
    ): SlotNavigationState => {
        let newIndex;
        switch (action.type) {
            case "arrowUp":
                newIndex =
                    state.selectedIndex !== 0 ? state.selectedIndex - 1 : action.payload - 1;

                if (flattenedSlots[newIndex]) {
                    return {
                        selectedIndex: newIndex,
                        selectedSlotId: flattenedSlots[newIndex].id,
                    };
                } else {
                    // Handle the scenario where the slot at the newIndex is undefined.
                    return state;
                }

            case "arrowDown":
                newIndex =
                    state.selectedIndex !== action.payload - 1 ? state.selectedIndex + 1 : 0;

                if (flattenedSlots[newIndex]) {
                    return {
                        selectedIndex: newIndex,
                        selectedSlotId: flattenedSlots[newIndex].id,
                    };
                } else {
                    // Handle the scenario where the slot at the newIndex is undefined.
                    return state;
                }

            default:
                throw new Error();
        }
    };

    const [navigationState, navigationDispatch] = useReducer(reducer, initialState);

    const useKeyPress = (targetKey: string, actionType: "arrowUp" | "arrowDown" | "enter") => {
        useEffect(() => {
            const downHandler = ({key}: {key: string}) => {
                if (key === targetKey) {
                    if (key === "Enter") {
                        onEnter();
                    } else {
                        navigationDispatch({type: actionType, payload: flattenedSlots.length});
                    }
                }
            };

            window.addEventListener("keydown", downHandler);

            return () => {
                window.removeEventListener("keydown", downHandler);
            };
        }, [targetKey, actionType, onEnter, flattenedSlots.length, navigationDispatch]);
    };

    useKeyPress("ArrowUp", "arrowUp");
    useKeyPress("ArrowDown", "arrowDown");
    useKeyPress("Enter", "enter");

    return navigationState;
}
