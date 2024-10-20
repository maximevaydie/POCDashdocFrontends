import {t} from "@dashdoc/web-core";
import {TooltipWrapper, Icon} from "@dashdoc/web-ui";
import React from "react";

export const InconsistentDatesIcon = () => {
    return (
        <TooltipWrapper
            content={t("activity.inconsistentDates")}
            boxProps={{
                backgroundColor: "yellow.ultralight",
                borderRadius: "50%",
                p: 1,
                display: "flex",
                height: "fit-content",
            }}
        >
            <Icon name="warning" color="yellow.dark" data-testid="inconsistent-date-warning" />
        </TooltipWrapper>
    );
};
