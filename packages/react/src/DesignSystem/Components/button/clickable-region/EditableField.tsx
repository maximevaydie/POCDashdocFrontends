import {TestProps} from "@dashdoc/web-core";
import {Box, Text, theme, TextProps} from "@dashdoc/web-ui";
import {ClickableUpdateRegion} from "@dashdoc/web-ui/src/button/clickable-region";
import styled from "@emotion/styled";
import React, {FunctionComponent, useCallback} from "react";

export const AlertSpan = styled("span")`
    background-color: ${theme.colors.red.ultralight};
    padding: 2px;
`;

export interface EditableFieldProps extends TestProps {
    clickable?: boolean;
    label: React.ReactNode;
    value: React.ReactNode;
    placeholder?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    alert?: boolean;
    noWrap?: boolean;
    updateButtonLabel?: string;
}

export const EditableField: FunctionComponent<EditableFieldProps> = (props) => {
    const {
        clickable = true,
        label,
        value,
        placeholder = "",
        icon,
        onClick,
        alert,
        noWrap,
        updateButtonLabel,
    } = props;

    const getDisplayedValue = useCallback(() => {
        if (!value) {
            return (
                <Box as="span" color="grey.dark">
                    {placeholder}
                </Box>
            );
        }
        if (alert) {
            return <AlertSpan>{value}</AlertSpan>;
        }
        return value;
    }, [value, alert, placeholder]);

    const noWrapProps: TextProps = noWrap
        ? {
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
          }
        : {};

    return (
        <ClickableUpdateRegion
            clickable={clickable}
            onClick={onClick}
            data-testid={props["data-testid"]}
            updateButtonLabel={updateButtonLabel}
        >
            <Text {...noWrapProps}>
                {icon && <>{icon} </>}
                <Text as="span" variant="captionBold" text-decoration="none" pt={1}>
                    {label}{" "}
                </Text>
                {getDisplayedValue()}
            </Text>
        </ClickableUpdateRegion>
    );
};
