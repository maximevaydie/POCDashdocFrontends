import {t} from "@dashdoc/web-core";
import {Badge, TooltipWrapper, BadgeProps} from "@dashdoc/web-ui";
import React from "react";

export function NewAddressBadge(props: BadgeProps) {
    return (
        <TooltipWrapper
            content={t("pdfImport.newAddressHelpText")}
            boxProps={{flexShrink: 0, alignSelf: "center"}}
        >
            <Badge
                fontSize={1}
                variant="blue"
                borderColor="blue.light"
                borderStyle="solid"
                borderWidth={1}
                data-testid="new-address-badge"
                {...props}
            >
                {t("pdfImport.newAddress")}
            </Badge>
        </TooltipWrapper>
    );
}
