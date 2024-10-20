import {t} from "@dashdoc/web-core";
import {
    Box,
    Callout,
    ClickableFlex,
    Flex,
    Icon,
    Link,
    LoadingWheel,
    ShortcutWrapper,
    Text,
} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React, {ReactElement} from "react";

import {PickerPanel, PickerPanelLabels} from "./PickerPanel";

type Props = {
    itemsCount: number;
    itemPicker: ReactElement;
    createItem: () => void;
    labels: {
        tooltipIndication: {
            create: string;
            use: string;
        };
        panelLabels: PickerPanelLabels;
    };
    isShortcutDisabled: boolean;
};
export function PickerWrapper({
    itemsCount = -1,
    itemPicker,
    createItem,
    labels,
    isShortcutDisabled,
}: Props) {
    const [isPanelOpen, openPanel, closePanel] = useToggle();

    if (itemsCount === -1) {
        return (
            <Callout>
                <LoadingWheel noMargin />
            </Callout>
        );
    }
    const noItemAvailable = (
        <Callout mt={5}>
            <Flex alignItems="center">
                <Box>
                    <Text>{labels.tooltipIndication.create}</Text>
                    <Link onClick={openPanel}>{t("common.findOutMore")}</Link>
                </Box>
            </Flex>
        </Callout>
    );

    const itemsAvailable = (
        <ClickableFlex
            alignItems="center"
            bg="blue.ultralight"
            borderRadius={1}
            border="2px solid"
            borderColor="transparent"
            p={2}
            hoverStyle={{bg: "blue.ultralight", borderColor: "blue.default"}}
            onClick={openPanel}
            mt={5}
            data-testid="open-picker-line-template-panel"
        >
            <Box position="relative" p={2} pr={4} mr={3}>
                <Icon name="instructions" color="blue.default" />
                <Box
                    borderRadius="50%"
                    bg="blue.default"
                    color="grey.white"
                    position="absolute"
                    top={0}
                    right={-1}
                    px={1}
                >
                    {itemsCount}
                </Box>
            </Box>

            <Text>{labels.tooltipIndication.use}</Text>

            <Text color="grey.dark" flexShrink={0}>
                <ShortcutWrapper
                    shortcutKeyCodes={["Alt", "KeyE"]}
                    onShortcutPressed={openPanel}
                    isShortcutDisabled={isShortcutDisabled}
                >
                    alt + e
                </ShortcutWrapper>
            </Text>
        </ClickableFlex>
    );

    return (
        <>
            {itemsCount === 0 ? noItemAvailable : itemsAvailable}
            {isPanelOpen && (
                <PickerPanel
                    itemsCount={itemsCount}
                    onClose={closePanel}
                    createItem={createItem}
                    itemPicker={itemPicker}
                    labels={labels.panelLabels}
                />
            )}
        </>
    );
}
