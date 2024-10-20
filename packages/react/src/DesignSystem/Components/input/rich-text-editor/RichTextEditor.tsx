import {Property} from "csstype";
import {
    ContentBlock,
    DraftBlockType,
    DraftEditorCommand,
    DraftHandleValue,
    Editor,
    EditorState,
    RichUtils,
} from "draft-js";
import React from "react";

interface RichTextEditorProps {
    editorState: EditorState;
    placeholder: string;
    onChange: (a: any) => void;
}

class RichTextEditor extends React.Component<RichTextEditorProps> {
    focus: () => void;
    handleKeyCommand: (command: DraftEditorCommand) => DraftHandleValue;
    onTab: (e: React.KeyboardEvent) => void;
    toggleBlockType: (blockType: DraftBlockType) => void;
    toggleInlineStyle: (inlineStyle: string) => void;
    _editor: Editor;

    constructor(props: RichTextEditorProps) {
        super(props);

        this.focus = () => this._editor.focus();
        this.handleKeyCommand = (command: any) => this._handleKeyCommand(command);
        this.onTab = (e: any) => this._onTab(e);
        this.toggleBlockType = (type: any) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style: any) => this._toggleInlineStyle(style);
    }

    _handleKeyCommand(command: DraftEditorCommand): DraftHandleValue {
        const {editorState} = this.props;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.props.onChange(newState);
            return "handled";
        }
        return "not-handled";
    }

    _onTab(e: React.KeyboardEvent) {
        const maxDepth = 4;
        this.props.onChange(RichUtils.onTab(e, this.props.editorState, maxDepth));
    }

    _toggleBlockType(blockType: DraftBlockType) {
        this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
    }

    _toggleInlineStyle(inlineStyle: string) {
        this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
    }

    render() {
        const {editorState} = this.props;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let"s just hide it now.
        let className = "RichEditor-editor";
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== "unstyled") {
                className += " RichEditor-hidePlaceholder";
            }
        }

        return (
            <div className="RichEditor-root">
                <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType} />
                <InlineStyleControls editorState={editorState} onToggle={this.toggleInlineStyle} />
                <div className={className} onClick={this.focus} data-testid="rich-editor">
                    <Editor
                        // @ts-ignore
                        blockStyleFn={getBlockStyle}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.props.onChange}
                        onTab={this.onTab}
                        placeholder={this.props.placeholder}
                        ref={(editor) => {
                            // @ts-ignore
                            this._editor = editor;
                        }}
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }
}

function getBlockStyle(block: ContentBlock) {
    switch (block.getType()) {
        case "blockquote":
            return "RichEditor-blockquote";
        default:
            return null;
    }
}

interface StyleButtonProps {
    style: string;
    active: boolean;
    label: string;
    onToggle: (style: string) => void;
}

class StyleButton extends React.Component<StyleButtonProps> {
    onToggle: (e: React.MouseEvent) => void;

    constructor(props: StyleButtonProps) {
        super(props);
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    getStyle() {
        switch (this.props.style) {
            case "BOLD":
                return {fontWeight: "bold" as Property.FontWeight};
            case "ITALIC":
                return {fontStyle: "italic"};
            case "UNDERLINE":
                return {textDecoration: "underline"};
            default:
                return {};
        }
    }

    render() {
        let className = "RichEditor-styleButton";
        if (this.props.active) {
            className += " RichEditor-activeButton";
        }

        return (
            <span className={className} style={this.getStyle()} onMouseDown={this.onToggle}>
                {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    {label: "Titre 1", style: "header-one"},
    {label: "Titre 2", style: "header-two"},
    {label: "Titre 3", style: "header-three"},
    {label: "● Liste", style: "unordered-list-item"},
    {label: "1. Liste numérotée", style: "ordered-list-item"},
];

interface BlockStyleControlsProps {
    editorState: EditorState;
    onToggle: (style: string) => void;
}

const BlockStyleControls = (props: BlockStyleControlsProps) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) => (
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            ))}
        </div>
    );
};

var INLINE_STYLES = [
    {label: "Gras", style: "BOLD"},
    {label: "Italique", style: "ITALIC"},
    {label: "Souligné", style: "UNDERLINE"},
];

interface InlineStyleControlsProps {
    editorState: EditorState;
    onToggle: (e: string) => void;
}

const InlineStyleControls = (props: InlineStyleControlsProps) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) => (
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            ))}
        </div>
    );
};

export {RichTextEditor, RichTextEditorProps};
