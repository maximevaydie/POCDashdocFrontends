import {ClickableUpdateRegionStyle, Flex} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {Badge} from "../badge";

export function BadgeList({
    values,
    isMultiLine = false,
    showMoreButton,
    dataTestId,
    onClick,
    onDelete,
}: {
    values: string[];
    isMultiLine?: boolean;
    showMoreButton?: ReactNode;
    dataTestId?: string;
    onClick?: () => void;
    onDelete?: (index: number) => void;
}) {
    return (
        <Flex
            flexWrap={isMultiLine ? "wrap" : undefined}
            style={{gap: isMultiLine ? 8 : undefined}}
        >
            <Flex
                flexWrap={isMultiLine ? "wrap" : undefined}
                style={{gap: isMultiLine ? 8 : undefined}}
                onClick={onClick}
                as={onClick ? ClickableUpdateRegionStyle : undefined}
            >
                {values.map((value, index) => (
                    <Badge
                        as={Flex}
                        key={`${value}-${index}`}
                        alignItems="center"
                        p={2}
                        mr={isMultiLine ? undefined : 1}
                        mb={isMultiLine ? undefined : 1}
                        variant="neutral"
                        shape="squared"
                        fontSize={1}
                        onDelete={onDelete !== undefined ? () => onDelete(index) : undefined}
                        noWrap
                        data-testid={`${dataTestId}-${value}`}
                    >
                        {value}
                    </Badge>
                ))}
            </Flex>
            {showMoreButton}
        </Flex>
    );
}
