import {Box} from "@dashdoc/web-ui";
import {Meta, Story} from "@storybook/react/types-6-0";
import {EditorState} from "draft-js";
import React, {useState} from "react";

import {RichTextEditor as RichTextEditorComponent} from "./RichTextEditor";

export default {
    title: "Web UI/input/RichTextEditor",
    component: RichTextEditorComponent,
    decorators: [
        (Story) => (
            <Box width={320}>
                <Story />
            </Box>
        ),
    ],
} as Meta;

const Template: Story = () => {
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    return (
        <RichTextEditorComponent
            onChange={setEditorState}
            editorState={editorState}
            placeholder={"Custom placeholder"}
        />
    );
};

export const RichTextEditor = Template.bind({});
RichTextEditor.storyName = "RichTextEditor";
