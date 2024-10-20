import {createContext} from "react";

// The ActionableExtendedViewContext is used to indicate if the area supports the extended_view mode.
// It allows to easily propagate to other pages step by step.
// Extended view activation is handled in redux store.

export const ActionableExtendedViewContext = createContext<boolean>(false);
