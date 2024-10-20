import {Badge, BadgeColorVariant, Flex, Icon, IconNames, Text} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactNode} from "react";

type FilteringBadgeProps = {
    label: ReactNode;
    icon?: IconNames;
    onDelete?: () => void;
    onClick?: () => void;
    ["data-testid"]?: string;
    variant?: BadgeColorVariant | null;
    ignore?: boolean;
};

export const FilteringBadge: FunctionComponent<FilteringBadgeProps> = ({
    label,
    icon,
    onDelete,
    onClick,
    ["data-testid"]: testId,
    variant = "blue",
    ignore,
}) => {
    return (
        <Badge
            variant={!ignore && variant ? variant : "neutral"}
            onDelete={
                onDelete
                    ? (e) => {
                          e.stopPropagation();
                          onDelete();
                      }
                    : undefined
            }
            height="fit-content"
            noWrap
            data-testid={testId}
            onClick={onClick}
        >
            <Flex alignItems="center" height="100%">
                {icon && <Icon name={icon} mr={1} scale={0.8} />}
                {typeof label === "string" ? (
                    <Text
                        variant="caption"
                        style={ignore ? {textDecoration: "line-through"} : {}}
                        color={ignore ? "grey.dark" : undefined}
                    >
                        {label}
                    </Text>
                ) : (
                    label
                )}
            </Flex>
        </Badge>
    );
};

interface FilteringListBadgeProps {
    query: Record<string, Array<string>>;
    updateQuery: (query: Record<string, Array<string>>) => void;
    queryKey: string;
    getLabel: (count: number) => ReactNode;
    icon?: IconNames;
    ["data-testid"]?: string;
    ignore?: boolean;
}
export const FilteringListBadge: FunctionComponent<FilteringListBadgeProps> = ({
    query,
    updateQuery,
    queryKey,
    getLabel,
    ["data-testid"]: testId,
    ignore,
}) => {
    const count = query[queryKey]?.length ?? 0;

    return count > 0 ? (
        <FilteringBadge
            label={getLabel(count)}
            onDelete={() =>
                updateQuery({
                    [queryKey]: [],
                })
            }
            data-testid={testId}
            ignore={ignore}
        />
    ) : null;
};
