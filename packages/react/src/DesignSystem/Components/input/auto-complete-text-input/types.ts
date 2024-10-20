import {IconNames} from "../../base/icon";
import {BoxProps} from "../../../Elements/layout/Box";
import {TextInputProps} from "../text-input/TextInput";

export type AutoCompleteInputProps<TValue> = BoxProps &
    TextInputProps & {
        suggestions?: Suggestion<TValue>[];
        suggestionsIcon?: IconNames;
        numberOfSuggestions?: number;
        rootId?: string;
        onSuggestionSelected?: (value: string) => void;
    };

export type Suggestion<TValue> = {
    label: string;
    value: TValue;
    tooltipContent?: string;
};

export type SuggestionProps = {
    suggestion: Suggestion<any>;
    suggestionIcon?: IconNames;
    onClick?: (suggestion: Suggestion<any>) => void;
    active: Boolean;
};
