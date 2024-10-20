import {Text, TooltipWrapper} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {FunctionComponent} from "react";

import {Icon} from "../../base/icon";

import {SuggestionItem} from "./SuggestionItem";
import {SuggestionProps} from "./types";

// @ts-ignore
export const SuggestionsContainer: FunctionComponent<SuggestionProps> = ({
    suggestion,
    suggestionIcon,
    onClick,
    active,
    ...props
}) => {
    const [isActive, setActive, unsetActive] = useToggle(false);

    if (!suggestion) {
        return undefined;
    }

    return (
        <SuggestionItem
            // @ts-ignore
            onClick={onClick.bind(suggestion)}
            onMouseEnter={setActive}
            onMouseLeave={unsetActive}
            className={(isActive || active) && "active"}
            {...props}
        >
            {suggestion.label}
            {suggestionIcon &&
                (suggestion.tooltipContent ? (
                    <TooltipWrapper
                        boxProps={{
                            display: "inline-block",
                        }}
                        content={
                            <Text
                                dangerouslySetInnerHTML={{
                                    // nosemgrep react-dangerouslysetinnerhtml
                                    __html: suggestion.tooltipContent,
                                }}
                            ></Text>
                        }
                        placement="right"
                    >
                        <Icon name={suggestionIcon} ml={1} color="blue.default"></Icon>
                    </TooltipWrapper>
                ) : (
                    <Icon name={suggestionIcon} ml={1} color="blue.default"></Icon>
                ))}
        </SuggestionItem>
    );
};
