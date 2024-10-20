import {
    Box,
    Button,
    Flex,
    FloatingPanelWithValidationButtons,
    Icon,
    Text,
    IconProps,
} from "@dashdoc/web-ui";
import React, {FunctionComponent, ReactElement, useCallback, useEffect} from "react";

export type PickerPanelLabels = {
    createExplanations: {
        icon: IconProps["name"];
        intro: string;
        steps: string[];
        conclusion: string;
    };
    detectedItems: string;
    title: string;
    createButton: string;
};
type PickerPanelProps = {
    itemsCount: number;
    onClose: () => void;
    createItem: () => void;
    itemPicker: ReactElement;
    labels: PickerPanelLabels;
};
export const PickerPanel: FunctionComponent<PickerPanelProps> = ({
    itemsCount,
    onClose,
    createItem,
    itemPicker,
    labels,
}) => {
    const handleKeypress = useCallback(
        (event: KeyboardEvent) => {
            event.stopPropagation();
            // Handle close on Esc press
            if (event.code === "Escape") {
                onClose?.();
            }
        },
        [onClose]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeypress, true);
        return () => {
            document.removeEventListener("keydown", handleKeypress, true);
        };
    }, [handleKeypress]);

    return (
        <FloatingPanelWithValidationButtons
            width={0.33}
            minWidth={528}
            onClose={onClose}
            title={
                <Flex justifyContent="space-between" alignItems="center" flex={1}>
                    <Text variant="title" color="grey.dark">
                        {labels.title}
                    </Text>
                    <Button variant="secondary" mr={3} onClick={createItem}>
                        {labels.createButton}
                    </Button>
                </Flex>
            }
            mainButton={null}
            secondaryButtons={[]}
            data-testid="template-picker-panel"
        >
            {itemsCount > 0 && (
                <>
                    <Flex bg="blue.ultralight" alignItems="center" mx={-5} px={5} py={4} mb={4}>
                        <Icon color="blue.default" name="info" mr={4} />
                        <Text color="blue.default">{labels.detectedItems}</Text>
                    </Flex>
                    {React.cloneElement(itemPicker, {onEnd: onClose})}
                </>
            )}
            {itemsCount === 0 && (
                <Flex bg="grey.light" flexDirection="column" alignItems="center" p={4}>
                    <Icon
                        name={labels.createExplanations.icon}
                        color="grey.dark"
                        fontSize={7}
                        mb={5}
                    />
                    <Box>
                        <Text color="grey.dark" mb={5}>
                            {labels.createExplanations.intro}
                        </Text>
                        {labels.createExplanations.steps.map((step, index) => (
                            <Flex key={index} mb={5}>
                                <Flex
                                    borderRadius="50%"
                                    bg="grey.light"
                                    minWidth="30px"
                                    width="30px"
                                    height="30px"
                                    mr={3}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {index + 1}
                                </Flex>
                                <Text color="grey.dark">{step}</Text>
                            </Flex>
                        ))}
                        <Text color="grey.dark" mb={5}>
                            {labels.createExplanations.conclusion}
                        </Text>
                    </Box>
                    <Button variant="secondary" onClick={createItem}>
                        {labels.createButton}
                    </Button>
                </Flex>
            )}
        </FloatingPanelWithValidationButtons>
    );
};
