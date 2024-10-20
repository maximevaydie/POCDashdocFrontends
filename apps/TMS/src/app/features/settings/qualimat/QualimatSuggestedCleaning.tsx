import {useTimezone} from "@dashdoc/web-common";
import {Box, Button, Flex, Icon, LoadingWheel, Text} from "@dashdoc/web-ui";
import {
    formatDate,
    QualimatLoadingEvent,
    parseAndZoneDate,
    translate as t,
    useToggle,
} from "dashdoc-utils";
import React from "react";

import useSimpleFetch from "app/hooks/useSimpleFetch";

type SuggestCleaningProps = {
    fleetItemId: number;
    fleetType: "vehicles" | "trailers";
};
type SuggestedCleaningResponse =
    | {}
    | {
          latest_event: QualimatLoadingEvent;
          suggested_cleaning: "A" | "B" | "C" | "D" | "complex";
      };

export function QualimatSuggestedCleaning({fleetItemId, fleetType}: SuggestCleaningProps) {
    const [wantsSuggestion, suggestCleaningRegime] = useToggle();
    return (
        <Flex backgroundColor="grey.ultralight" borderRadius={1} p={2} style={{gap: "8px"}}>
            <Icon flexShrink={0} name="robot" />
            {wantsSuggestion ? (
                <Suggestion fleetType={fleetType} fleetItemId={fleetItemId} />
            ) : (
                <>
                    <Box marginRight="auto" data-testid="idtf-suggestCleaning-answer">
                        <Text>{t("idtf.suggestCleaning.instructions.title")}</Text>
                        <Text variant="caption" color="grey.dark">
                            {t("idtf.suggestCleaning.instructions.details")}
                        </Text>
                    </Box>
                    <Button
                        variant="plain"
                        flexShrink={0}
                        onClick={suggestCleaningRegime}
                        data-testid="idtf-suggestCleaning-button"
                    >
                        {t("idtf.suggestCleaning.instructions.suggestButton.label")}
                    </Button>
                </>
            )}
        </Flex>
    );
}

function Suggestion({fleetItemId, fleetType}: SuggestCleaningProps) {
    const timezone = useTimezone();

    let {isLoading, hasError, data} = useSimpleFetch<SuggestedCleaningResponse | null>(
        `/${fleetType}/${fleetItemId}/qualimat-suggested-cleaning-regime/`,
        [],
        undefined,
        null
    );

    if (isLoading) {
        return (
            <>
                <Box marginRight="auto" data-testid="idtf-suggestCleaning-answer">
                    <Text>{t("idtf.suggestCleaning.instructions.title")}</Text>
                    <Text variant="caption" color="grey.dark">
                        {t("idtf.suggestCleaning.fetching.details")}
                    </Text>
                </Box>

                <Box>
                    <LoadingWheel noMargin inline />
                </Box>
            </>
        );
    }

    if (hasError || data === null) {
        return <Text color="red.default">{t("common.error")}</Text>;
    }

    let title = t("idtf.suggestCleaning.all_clean.title");
    let details = t("idtf.suggestCleaning.all_clean.details");
    if ("latest_event" in data) {
        const event = data.latest_event;

        if (data.suggested_cleaning == "complex") {
            title = t("idtf.suggestCleaning.no_suggestion.title");
            details = t("idtf.suggestCleaning.no_suggestion.details");
        } else {
            title = t("idtf.suggestCleaning.suggestion.title", {
                suggestedCleaning: data.suggested_cleaning,
            });
            // nosemgrep
            const productName = t(`idtf.${event.details.loading.idtf_number}`);
            details = t("idtf.suggestCleaning.suggestion.details", {
                productName: productName,
                date: formatDate(
                    parseAndZoneDate(event.created_device || event.created, timezone),
                    "PPP"
                ),
            });
        }
    }

    return (
        <Box marginRight="auto" data-testid="idtf-suggestCleaning-answer">
            <Text>{title}</Text>
            <Text variant="caption" color="grey.dark">
                {details}
            </Text>
        </Box>
    );
}
