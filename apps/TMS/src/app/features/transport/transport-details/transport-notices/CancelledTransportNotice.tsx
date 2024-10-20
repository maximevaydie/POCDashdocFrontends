import {t} from "@dashdoc/web-core";
import {Text} from "@dashdoc/web-ui";
import React from "react";

import {getLastStatusUpdateForCategory} from "app/services/transport";

import type {Transport} from "app/types/transport";

export function CancelledTransportNotice({transport}: {transport: Transport}) {
    const cancelledStatusUpdate = getLastStatusUpdateForCategory("cancelled", transport);

    if (!cancelledStatusUpdate?.content) {
        return (
            <Text color="inherit" data-testid="cancelled-transport-warning">
                {t("components.transportCancelNoReason")}
            </Text>
        );
    }

    return (
        <Text color="inherit" data-testid="cancelled-transport-warning">
            {cancelledStatusUpdate.author?.display_name
                ? t("components.transportCancelledReasonWithAuthor", {
                      authorName: cancelledStatusUpdate.author.display_name,
                  })
                : t("components.transportCancelledReason")}
            <span data-testid="cancelled-transport-reason">{cancelledStatusUpdate.content}</span>
        </Text>
    );
}
