import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent, useCallback, useEffect, useMemo, useState} from "react";

import {DropdownContent} from "../../button/Dropdown";
import {Box} from "../../../Elements/layout/Box";
import {ClickOutside} from "../../../Elements/layout/ClickOutside";
import {TextInput} from "../text-input/TextInput";

import {NUMBER_OF_SUGGESTIONS} from "./constants";
import {SuggestionsContainer} from "./SuggestionsContainer";
import {AutoCompleteInputProps, Suggestion} from "./types";

export const AutoCompleteTextInput: FunctionComponent<AutoCompleteInputProps<any>> = ({
    value,
    onChange,
    suggestions = [],
    suggestionsIcon,
    numberOfSuggestions = NUMBER_OF_SUGGESTIONS,
    onSuggestionSelected,
    rootId = "react-app-modal-root",
    ...inputProps
}) => {
    const [isSuggestionsOpen, openSuggestions, closeSuggestions] = useToggle(false);
    const displayedSuggestions = useMemo<Array<Suggestion<any>>>(
        () =>
            suggestions
                .filter(
                    ({label}) =>
                        label.toLowerCase().includes(value?.toLowerCase()) &&
                        label.toLowerCase() !== value?.toLowerCase()
                )
                .slice(0, numberOfSuggestions),
        [value, suggestions, numberOfSuggestions]
    );

    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    useEffect(() => {
        if (activeSuggestionIndex >= displayedSuggestions.length) {
            setActiveSuggestionIndex(0);
        }
    }, [activeSuggestionIndex, displayedSuggestions]);

    const handleKeypressDown = useCallback(
        (event: KeyboardEvent) => {
            if (isSuggestionsOpen) {
                if (event.key === "ArrowDown") {
                    event.stopPropagation();
                    setActiveSuggestionIndex((prevIndex) =>
                        prevIndex + 1 === displayedSuggestions.length ? 0 : prevIndex + 1
                    );
                } else if (event.key === "ArrowUp") {
                    event.stopPropagation();
                    setActiveSuggestionIndex((prevIndex) =>
                        prevIndex - 1 < 0 ? displayedSuggestions.length - 1 : prevIndex - 1
                    );
                } else if (event.key === "Tab") {
                    event.stopPropagation();
                    closeSuggestions();
                } else if (event.key === "Enter") {
                    const activeSuggestion = displayedSuggestions[activeSuggestionIndex];
                    if (activeSuggestion) {
                        event.stopPropagation();
                        // @ts-ignore
                        onChange(activeSuggestion.value, null);
                        onSuggestionSelected?.(activeSuggestion.value);
                        closeSuggestions();
                    }
                }
            }
        },
        [
            isSuggestionsOpen,
            displayedSuggestions,
            activeSuggestionIndex,
            onChange,
            closeSuggestions,
        ]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeypressDown, false);
        return () => {
            document.removeEventListener("keydown", handleKeypressDown, false);
        };
    }, [handleKeypressDown]);

    return (
        <ClickOutside
            // @ts-ignore
            reactRoot={document.getElementById(rootId)}
            onClickOutside={closeSuggestions}
        >
            <Box position="relative">
                <TextInput
                    {...inputProps}
                    value={value}
                    onChange={onChange}
                    display="flex"
                    onClick={openSuggestions}
                    onKeyDown={(e) => {
                        inputProps.onKeyDown?.(e);
                        openSuggestions();
                    }}
                    onFocus={openSuggestions}
                    autoComplete="off"
                />
                {isSuggestionsOpen && displayedSuggestions.length > 0 && (
                    <DropdownContent
                        position="absolute"
                        zIndex="dropdown"
                        maxHeight="300px"
                        overflowY="auto"
                    >
                        {displayedSuggestions.map((suggestion, index) => (
                            <SuggestionsContainer
                                key={index}
                                suggestion={suggestion}
                                suggestionIcon={suggestionsIcon}
                                active={activeSuggestionIndex === index}
                                onClick={() => {
                                    // @ts-ignore
                                    onChange(suggestion.value, null);
                                    onSuggestionSelected?.(suggestion.value);
                                    closeSuggestions();
                                }}
                            />
                        ))}
                    </DropdownContent>
                )}
            </Box>
        </ClickOutside>
    );
};
