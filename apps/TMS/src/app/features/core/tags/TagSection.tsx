import {t} from "@dashdoc/web-core";
import {Box, Flex, IconButton, theme} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import styled from "@emotion/styled";
import {Tag as TagData, useToggle} from "dashdoc-utils";
import React, {useState} from "react";

import {TagModal} from "app/features/settings/tags/AddEditTagModal";

import {TagSelector} from "./TagSelector";

type TagSectionProps = {
    tags: TagData[];
    canUpdateTags?: boolean;
    onDelete: (tag: TagData) => void;
    onAdd: (tag: TagData) => void;
};

const AddTagButton = styled(IconButton)`
    border: 1px solid ${theme.colors.blue.default} !important;
    padding-left: 16px;
    padding-right: 16px;
`;

export const TagSection: React.VFC<TagSectionProps> = ({
    tags,
    canUpdateTags = true,
    onDelete,
    onAdd,
}) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isTagModalOpen, openTagModal, closeTagModal] = useToggle();
    const [newTagName, setNewTagName] = React.useState("");

    const handleOnAddTag = (tag: TagData | string) => {
        if (typeof tag === "string") {
            openTagModal();
            if (tag) {
                setNewTagName(tag);
            }
        } else {
            onAdd(tag);
        }
        setIsAdding(false);
    };

    const getAddButton = () => {
        if (isAdding) {
            return (
                <Box minWidth="25rem">
                    <TagSelector
                        onChange={handleOnAddTag}
                        tags={tags}
                        onBlur={() => setIsAdding(false)}
                    />
                </Box>
            );
        } else {
            return (
                <AddTagButton
                    color="blue.default"
                    name="add"
                    data-testid="add-tag-button"
                    label={t("settings.addTag", undefined, {capitalize: true})}
                    onClick={() => setIsAdding(true)}
                />
            );
        }
    };

    const getOptionalProps = (tag: TagData) => {
        let optionalProps: {onDelete?: () => void} = {};
        if (canUpdateTags) {
            optionalProps.onDelete = () => onDelete(tag);
        }
        return optionalProps;
    };
    return (
        <Flex style={{gap: "8px"}} flexWrap="wrap">
            {tags.length > 0 && (
                <Flex data-testid="tag-section-list" style={{gap: "4px"}} flexWrap="wrap">
                    {tags.map((tag, index) => (
                        <Tag {...getOptionalProps(tag)} key={index} tag={tag} />
                    ))}
                </Flex>
            )}
            {canUpdateTags && getAddButton()}
            {isTagModalOpen && (
                <TagModal
                    item={null}
                    initialTagName={newTagName}
                    onSubmitFromTagSection={(tag: TagData) => {
                        onAdd(tag);
                        closeTagModal();
                    }}
                    onClose={closeTagModal}
                />
            )}
        </Flex>
    );
};
