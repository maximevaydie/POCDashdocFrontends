import {Button, Icon} from "@dashdoc/web-ui";
import React from "react";

type Props = {
    onClick: () => void;
    disabled?: boolean;
};

export function ArrowButton({onClick, disabled}: Props) {
    return (
        <Button
            height="100%"
            width="100%"
            variant="primary"
            data-testid="arrow-button"
            onClick={onClick}
            disabled={disabled}
            paddingX={1}
            paddingY={1}
            borderRadius={0}
            borderTopRightRadius={1}
            borderBottomRightRadius={1}
        >
            <Icon name="arrowDown" lineHeight={1} m={0} color="grey.white" />
        </Button>
    );
}
