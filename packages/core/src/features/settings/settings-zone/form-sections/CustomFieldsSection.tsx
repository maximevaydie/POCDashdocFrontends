import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    ClickableBox,
    Flex,
    Icon,
    SwitchInput,
    Text,
    TextInput,
} from "@dashdoc/web-ui";
import clone from "lodash.clone";
import React from "react";
import {DragDropContext, Draggable, DropResult, Droppable} from "react-beautiful-dnd";
import {Controller, useFormContext} from "react-hook-form";
import {CustomField} from "types";

import {SettingsFormSection} from "../../SettingsFormSection";

export function CustomFieldsSection() {
    const {watch, setValue} = useFormContext();
    const custom_fields: CustomField[] = watch("custom_fields");
    return (
        <SettingsFormSection title={t("components.complementaryInformation")} mt={8}>
            <DragDropContext onDragEnd={moveCustomField}>
                <Droppable droppableId={"custom_fields"}>
                    {(provided, snapshot) => (
                        <Box
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            position="relative"
                            bg={snapshot.isDraggingOver ? "grey.light" : undefined}
                        >
                            {custom_fields.map((_, index) => (
                                <Draggable
                                    key={`custom_fields.${index}`}
                                    draggableId={`custom_fields.${index}`}
                                    index={index}
                                >
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                        >
                                            <Flex
                                                flexDirection="column"
                                                mb={2}
                                                p={2}
                                                backgroundColor="grey.ultralight"
                                            >
                                                <Box
                                                    style={{
                                                        display: "grid",
                                                        gap: "8px",
                                                        gridTemplateColumns: `min-content 1fr min-content`,
                                                        verticalAlign: "middle",
                                                    }}
                                                    alignItems="center"
                                                    mb={2}
                                                >
                                                    <Box className="dnd-handle" margin="auto">
                                                        <Icon name="drag" color="grey.dark" />
                                                    </Box>
                                                    <Controller
                                                        name={`custom_fields.${index}.label`}
                                                        defaultValue={true}
                                                        render={({field, fieldState}) => (
                                                            <Box>
                                                                <TextInput
                                                                    {...field}
                                                                    error={
                                                                        !!fieldState.error?.message
                                                                    }
                                                                    label={t("common.fieldName")}
                                                                    data-testid={`settings-zones-custom-fields-${index}`}
                                                                    required
                                                                />
                                                            </Box>
                                                        )}
                                                    />

                                                    <Box margin="auto">
                                                        <Button
                                                            name="delete"
                                                            variant="plain"
                                                            type="button"
                                                            onClick={() => handleDelete(index)}
                                                            title={t("common.delete")}
                                                            alignSelf="normal"
                                                        >
                                                            <Icon
                                                                name="delete"
                                                                fontSize={2}
                                                                color="grey.dark"
                                                            />
                                                        </Button>
                                                    </Box>

                                                    <Box />

                                                    <Flex style={{gap: "16px"}}>
                                                        <Controller
                                                            name={`custom_fields.${index}.required`}
                                                            render={({field}) => (
                                                                <SwitchInput
                                                                    {...field}
                                                                    labelRight={t(
                                                                        "common.field_required"
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                        <Controller
                                                            name={`custom_fields.${index}.visible_on_card`}
                                                            render={({field}) => (
                                                                <SwitchInput
                                                                    {...field}
                                                                    labelRight={t(
                                                                        "flow.visible_on_card"
                                                                    )}
                                                                />
                                                            )}
                                                        />
                                                    </Flex>
                                                </Box>
                                            </Flex>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            <ClickableBox
                mt={4}
                p={4}
                backgroundColor="blue.ultralight"
                border="2px dashed"
                borderColor="blue.light"
                hoverStyle={{bg: "grey.ultralight"}}
                onClick={handleNewCustomField}
            >
                <Text color="blue.default">{`+ ${t(
                    "flow.settings.zoneSetupTab.addCustomField"
                )}`}</Text>
            </ClickableBox>
        </SettingsFormSection>
    );

    function handleNewCustomField() {
        // From the Q&A, only the first custom field is visible on the card by default
        const visibleByDefault = custom_fields.length <= 0;
        setValue(
            "custom_fields",
            [...custom_fields, {label: "", required: false, visible_on_card: visibleByDefault}],
            {
                shouldTouch: true,
                shouldValidate: true,
            }
        );
    }
    function handleDelete(index: number) {
        const new_custom_fields = clone(custom_fields);
        new_custom_fields.splice(index, 1);
        setValue("custom_fields", new_custom_fields, {shouldTouch: true, shouldValidate: true});
    }

    async function moveCustomField(dropResult: DropResult) {
        // drop cancel or put back in same place
        if (!dropResult.destination || dropResult.destination.index === dropResult.source.index) {
            return;
        }
        const new_custom_fields = clone(custom_fields);
        const custom_field = new_custom_fields.splice(dropResult.source.index, 1)[0];
        new_custom_fields.splice(dropResult.destination.index, 0, custom_field);
        setValue("custom_fields", new_custom_fields, {shouldTouch: true, shouldValidate: true});
    }
}
