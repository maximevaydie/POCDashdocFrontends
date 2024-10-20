import {TagSelector} from "@dashdoc/web-common";
import {ClickOutside, ClickableFlex, DropdownContent, Icon, Badge, Box} from "@dashdoc/web-ui";
import {useToggle} from "dashdoc-utils";
import React from "react";

type FleetTagsSelectProps = {
    tagsUids: string[];
    setTagsUids: (tagsUids: string[]) => void;
};

export function FleetTagsSelect({tagsUids, setTagsUids}: FleetTagsSelectProps) {
    const [isSettingsOpen, openSettings, closeSettings] = useToggle();
    return (
        <ClickOutside
            onClickOutside={closeSettings}
            reactRoot={document.getElementById("react-app-modal-root")}
        >
            <ClickableFlex
                flexDirection="column"
                onClick={isSettingsOpen ? closeSettings : openSettings}
                width="26px"
                height="26px"
                alignItems="center"
                justifyContent="center"
                color="grey.dark"
                borderRadius="50%"
                data-testid="scheduler-row-filter-by-tags"
                p={1}
                position="relative"
            >
                <Icon name="filter" />
                {tagsUids.length > 0 && (
                    <Badge
                        variant="blueDark"
                        px={1}
                        py={0}
                        fontSize={0}
                        position="absolute"
                        top={0}
                        right={"-4px"}
                    >
                        {tagsUids.length}
                    </Badge>
                )}
            </ClickableFlex>
            {isSettingsOpen && (
                <Box position="relative">
                    <DropdownContent
                        position="absolute"
                        width="260px !important"
                        top="100%"
                        right="0"
                    >
                        <TagSelector
                            query={{tags__in: tagsUids}}
                            updateQuery={(query: {tags__in: string[]}) => {
                                setTagsUids(query.tags__in ?? []);
                            }}
                        />
                    </DropdownContent>
                </Box>
            )}
        </ClickOutside>
    );
}
