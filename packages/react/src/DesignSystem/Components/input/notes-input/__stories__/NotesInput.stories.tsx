import {t} from "@dashdoc/web-core";
import {Box, Callout, Card, Device, DeviceContext, Flex, Icon, Text} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import React, {useState} from "react";

import {NotesInput as Component, NotesInputProps} from "../NotesInput";

// eslint-disable-next-line import/no-default-export
export default {
    title: "Web UI/input",
    component: Component,
    args: {
        mode: "desktop",
        disabled: false,
        hoverStyle: {bg: "grey.light"},
        value: `Une super note ultra intéressante sur cette société.
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum et vestibulum mi. Sed quis tincidunt enim. Suspendisse sed enim augue. Etiam sem leo, sodales vel mi dictum, gravida accumsan eros. Pellentesque egestas venenatis mi suscipit semper. Etiam nec ante at mauris ultrices iaculis. Sed viverra leo at ex fermentum dignissim. Fusce sagittis neque sit amet justo condimentum, sit amet egestas eros elementum. Proin vel pellentesque dui.`,
    },
    argTypes: {
        mode: {
            options: ["desktop", "mobile"],
            defaultValue: "desktop",
            control: {
                type: "select",
            },
        },
    },
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
    parameters: {
        backgrounds: {default: "white"},
        layout: "fullscreen",
    },
} as Meta;

const Template: Story<NotesInputProps & {mode: Device}> = (props) => {
    const {mode, ...args} = props;
    return (
        <DeviceContext.Provider value={mode}>
            <Box
                mt={4}
                p={4}
                width={1000}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(3, 1fr)`,
                    gap: "16px",
                }}
            >
                <MinimalNotes {...args} defaultValue={props.value} />
                <MinimalNotes {...args} defaultValue={"Short"} />
                <MinimalNotes {...args} defaultValue={""} />
            </Box>
            <Box
                width={1000}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(3, 1fr)`,
                    gap: "16px",
                }}
            >
                <SlotNotes {...args} defaultValue={args.value} />
                <SlotNotes {...args} defaultValue={"Short"} />
                <SlotNotes {...args} defaultValue={""} />
            </Box>
            <Box
                mt={4}
                p={4}
                width={1000}
                backgroundColor="grey.ultralight"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(3, 1fr)`,
                    gap: "16px",
                }}
            >
                <CompanyNotes {...args} defaultValue={props.value} />
                <CompanyNotes {...args} defaultValue={"Short"} />
                <CompanyNotes {...args} defaultValue={""} />
            </Box>
        </DeviceContext.Provider>
    );
};

export const NotesInput = Template.bind({});

function SlotNotes({defaultValue, ...props}: NotesInputProps & {defaultValue: string}) {
    const [value, setValue] = useState(defaultValue);

    const emptyMessageFlow = (
        <Flex>
            <Icon svgWidth="16px" svgHeight="16px" name="add" mr={1} color="blue.dark" />
            <Text ml={2} color="blue.dark" width="300px">
                {t("common.addNotes")}
            </Text>
        </Flex>
    );
    return (
        <Box m={4}>
            <Text variant="h1" color="grey.dark">
                {t("unavailability.notes")}
            </Text>
            <Callout mt={2} iconDisabled>
                <Component
                    {...props}
                    hoverStyle={{bg: "grey.light"}}
                    value={value}
                    emptyMessage={emptyMessageFlow}
                    onUpdate={handleUpdate}
                />
            </Callout>
        </Box>
    );

    async function handleUpdate(updatedNotes: string): Promise<void> {
        setValue(updatedNotes);
    }
}

function CompanyNotes({defaultValue, ...props}: NotesInputProps & {defaultValue: string}) {
    const [value, setValue] = useState(defaultValue);

    const emptyMessageCompany = (
        <Text ml={2} color="blue.dark" width="300px">
            {`Aucune note sur la société`}
        </Text>
    );
    const notesHelpText = (
        <>
            <Text>
                Cette note vous permet de renseigner des informations et de les partager à tous les
                membres de votre équipe dans Dashdoc.
            </Text>
            <ul>
                <li>Ces notes ne seront visibles que par les membres de votre équipe.</li>
                <li>
                    Les contacts invités n’auront pas accès aux informations notées dans ce champ.
                </li>
            </ul>
        </>
    );
    return (
        <Card mt={4} p={2} data-testid="addresses-link" display="flex" flexDirection="column">
            <Text variant="h1" color="grey.dark" p={2}>
                {t("unavailability.notes")}
            </Text>
            <Component
                p={2}
                {...props}
                value={value}
                emptyMessage={emptyMessageCompany}
                helpText={notesHelpText}
                onUpdate={handleUpdate}
                flexGrow={1}
            />
        </Card>
    );

    async function handleUpdate(updatedNotes: string): Promise<void> {
        setValue(updatedNotes);
    }
}

function MinimalNotes({defaultValue, ...props}: NotesInputProps & {defaultValue: string}) {
    const [value, setValue] = useState(defaultValue);
    return <Component p={2} {...props} value={value} onUpdate={handleUpdate} />;

    async function handleUpdate(updatedNotes: string): Promise<void> {
        setValue(updatedNotes);
    }
}
