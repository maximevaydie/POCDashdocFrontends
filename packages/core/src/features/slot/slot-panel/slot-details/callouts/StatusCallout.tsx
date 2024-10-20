import {t} from "@dashdoc/web-core";
import {Box, Text} from "@dashdoc/web-ui";
import React from "react";
import {SlotState} from "types";

type Props = {
    state: SlotState | "late";
    textColor: string | null;
    backgroundColor: string | null;
    label: string;
    cancelReason: string | null;
    deleted: boolean;
};

export function StatusCallout({
    state,
    textColor = "grey.white",
    backgroundColor,
    label,
    cancelReason,
    deleted,
}: Props) {
    if (state !== "planned") {
        return (
            <>
                {deleted && (
                    <Box my={4}>
                        {
                            <Text
                                backgroundColor={"red.ultralight"}
                                color={textColor ?? undefined}
                                py={3}
                                px={2}
                                borderRadius={1}
                                variant="h1"
                                fontWeight={600}
                                border={`1px solid red`}
                                data-testid="slot-status-callout-deleted"
                            >
                                {t("flow.slot.deleted")}
                            </Text>
                        }
                    </Box>
                )}
                <Box my={4}>
                    <Text
                        backgroundColor={backgroundColor}
                        color={textColor ?? undefined}
                        py={3}
                        px={2}
                        borderRadius={1}
                        variant="h1"
                        fontWeight={600}
                        data-testid="slot-status-callout"
                    >
                        {label}
                        {cancelReason && (
                            <Text fontWeight={400}>
                                {t("common.reason", {reason: cancelReason})}
                            </Text>
                        )}
                    </Text>
                </Box>
            </>
        );
    }
    return null;
}
