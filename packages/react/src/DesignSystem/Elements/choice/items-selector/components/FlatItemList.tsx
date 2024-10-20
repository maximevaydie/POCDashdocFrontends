import {t} from "@dashdoc/web-core";
import {Box, Button, Checkbox, ClickableBox, NoWrap, Text, theme} from "@dashdoc/web-ui";
import React, {ReactNode} from "react";

import {Item} from "../../types";

export type ItemSelectionDisplayMode = "checkbox" | "addButton";
type Props = {
    items: Item[];
    values: string[];
    onClick: (id: string) => void;
    displayMode: ItemSelectionDisplayMode;
};

type ItemProps = {
    isSelected: boolean;
    label: ReactNode;
    onChange: () => void;
};
function CheckboxItem({isSelected, label, onChange}: ItemProps) {
    return (
        <Box
            style={{
                display: "grid",
                gridTemplateColumns: `1fr min-content`,
            }}
            data-testid="item"
        >
            <Checkbox onChange={onChange} checked={isSelected} label={label} />
        </Box>
    );
}
function AddButtonItem({isSelected, label, onChange}: ItemProps) {
    return (
        <ClickableBox
            alignItems="center"
            justifyContent="space-between"
            onClick={onChange}
            style={{
                display: "grid",
                gridTemplateColumns: `1fr min-content`,
                gap: "8px",
            }}
            py={1}
            px={2}
        >
            {typeof label === "string" ? (
                <Text flexGrow={1} style={{cursor: "pointer"}}>
                    <NoWrap>{label}</NoWrap>
                </Text>
            ) : (
                label
            )}
            <Button
                type="button"
                variant={isSelected ? "plain" : "secondary"}
                size="small"
                style={isSelected ? {color: theme.colors.grey.dark} : undefined}
            >
                {isSelected ? t("common.addedSingular") : t("common.add")}
            </Button>
        </ClickableBox>
    );
}
export function FlatItemList({items, values, onClick, displayMode}: Props) {
    return (
        <Box data-testid="item-list">
            {items.map(({id, label}) => {
                const isSelected = values.includes(id);
                const formattedLabel =
                    typeof label === "string" ? (
                        <Text flexGrow={1} style={{cursor: "pointer"}}>
                            <NoWrap>{label}</NoWrap>
                        </Text>
                    ) : (
                        label
                    );

                switch (displayMode) {
                    case "addButton":
                        return (
                            <AddButtonItem
                                key={id}
                                onChange={() => onClick(id)}
                                isSelected={isSelected}
                                label={formattedLabel}
                            />
                        );
                    default:
                        return (
                            <CheckboxItem
                                key={id}
                                onChange={() => onClick(id)}
                                isSelected={isSelected}
                                label={formattedLabel}
                            />
                        );
                }
            })}
        </Box>
    );
}
