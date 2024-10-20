import {TestProps} from "@dashdoc/web-core";
import {ClickableUpdateRegion, Text, Flex} from "@dashdoc/web-ui";
import React from "react";

interface EditableFieldProps extends TestProps {
    clickable?: boolean;
    label?: string;
    value: string;
    placeholder?: string;
    onClick?: () => void;
}

export function EditableField({
    clickable,
    label,
    value,
    placeholder,
    onClick,
    ...props
}: EditableFieldProps) {
    return (
        <ClickableUpdateRegion
            clickable={!!clickable}
            onClick={onClick}
            data-testid={props["data-testid"]}
        >
            <Flex alignItems={"center"}>
                {label && (
                    <Text color="grey.dark" mr={2} flexShrink={0}>
                        {label}
                    </Text>
                )}
                {value ? <Text>{value}</Text> : <Text color="grey.dark">{placeholder}</Text>}
            </Flex>
        </ClickableUpdateRegion>
    );
}
