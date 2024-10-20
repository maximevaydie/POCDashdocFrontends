import {TooltipWrapper, Button, Icon} from "@dashdoc/web-ui";
import React from "react";
type Props = {
    isSidePanelDisplayed: boolean;
    hidePanel: () => void;
    showSidePanel: () => void;
    side: "right" | "left";
    hidePanelLabel: string;
    hidePanelTestID?: string;
    showSidePanelLabel: string;
    showSidePanelTestID?: string;
};
export function HideShowPanelButton({
    isSidePanelDisplayed,
    hidePanel,
    showSidePanel,
    side,
    hidePanelLabel,
    hidePanelTestID,
    showSidePanelLabel,
    showSidePanelTestID,
}: Props) {
    return (
        <TooltipWrapper content={isSidePanelDisplayed ? hidePanelLabel : showSidePanelLabel}>
            <Button
                variant="plain"
                size="xsmall"
                data-testid={isSidePanelDisplayed ? hidePanelTestID : showSidePanelTestID}
                onClick={isSidePanelDisplayed ? hidePanel : showSidePanel}
            >
                <Icon
                    color="grey.dark"
                    name={side == "left" ? "arrowDoubleLeft" : "arrowDoubleRight"}
                    scale={0.8}
                />
            </Button>
        </TooltipWrapper>
    );
}
