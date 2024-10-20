import {createContext, useContext} from "react";

const ItemAccountCodeSuggestionsContext = createContext<string[]>([]);

/** Used to provide to the children a list of account code suggestions for invoice items */
export const ItemAccountCodeSuggestionsProvider = ItemAccountCodeSuggestionsContext.Provider;

/** Returns a list of some account code suggestions for upserting invoice item.
 */
export const useItemAccountCodeSuggestions = () => {
    const itemAccountCodeSuggestions = useContext(ItemAccountCodeSuggestionsContext);
    return itemAccountCodeSuggestions;
};
