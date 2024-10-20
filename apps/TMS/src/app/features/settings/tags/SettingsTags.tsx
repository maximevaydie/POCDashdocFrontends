import {Arrayify, FilteringBar} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {
    Box,
    Button,
    Callout,
    ConfirmationModal,
    Flex,
    Icon,
    IconButton,
    LoadingWheel,
    ScrollableTableFixedHeader,
    ColumnDirection,
    TabTitle,
    Table,
    Tag,
    Text,
} from "@dashdoc/web-ui";
import {
    Tag as TagData,
    TagQuery,
    parseQueryString,
    stringifyQueryObject,
    useEffectExceptOnMount,
    useToggle,
} from "dashdoc-utils";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {RouteComponentProps, withRouter} from "react-router";

import {getTabTranslations} from "app/common/tabs";
import {fetchDeleteTag, fetchSearchTags, selectRows, unselectAllRows} from "app/redux/actions";
import {useDispatch} from "app/redux/hooks";
import {
    getTagsCurrentQueryLoadingStatus,
    getTagsForCurrentQuery,
    getTagsSelectionForCurrentQuery,
} from "app/redux/selectors";
import {SidebarTabNames, TAGS_QUERY_NAME} from "app/types/constants";

import {TagModal} from "./AddEditTagModal";

export type SettingsTagsQuery = {
    text?: string[];
    ordering?: TagQuery["ordering"];
};

const parseQuery = (queryString: string): SettingsTagsQuery => {
    const parsedParams = parseQueryString(queryString);

    return {
        ...parsedParams,
        text: Arrayify(parsedParams.text || []).map((t) => t.toString()),
    };
};

type TagColumn = "name" | "edit";

const tagColumns: {width: string; name: TagColumn; getLabel: () => string}[] = [
    {width: "25em", getLabel: () => t("common.tag"), name: "name"},
    {width: "auto", getLabel: () => "", name: "edit"},
];

type SettingsTagsProps = {} & RouteComponentProps;

function SettingsTags({history, location}: SettingsTagsProps) {
    const dispatch = useDispatch();

    //#region State props
    // nosemgrep
    const [currentQuery, setCurrentQuery] = useState(parseQuery(location.search));
    const [isDeleteModalOpened, openDeleteModal, closeDeleteModal] = useToggle();
    const [isTagModalOpen, openAddEditTagModal, closeAddEditTagModal] = useToggle();
    const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
    const [deletingTag, setDeletingTag] = useState<TagData | null>(null);
    //#endregion

    //#region Selectors
    const {
        tags = [],
        page = 1,
        hasNextPage,
        totalCount: totalTagsCount,
    } = useSelector(getTagsForCurrentQuery);
    const currentSelection = useSelector(getTagsSelectionForCurrentQuery);
    const isLoading = useSelector(getTagsCurrentQueryLoadingStatus);
    //#endregion

    const onSelectTag = useCallback(
        (tag: TagData, selected: boolean) => {
            dispatch(selectRows(selected, "tags", [tag.pk]));
        },
        [dispatch]
    );

    const onSelectAllVisibleTags = useCallback(
        (selected: boolean) => {
            dispatch(selectRows(selected, "tags", tags?.map(({pk}) => pk) ?? []));
        },
        [dispatch, tags]
    );

    const searchTags = useCallback(
        async (currentQuery: SettingsTagsQuery, page = 1) => {
            const query: TagQuery = {
                text: currentQuery.text?.[0] ?? "",
            };
            if (currentQuery.ordering) {
                query.ordering = currentQuery.ordering;
            }
            dispatch(fetchSearchTags(TAGS_QUERY_NAME, query, page));
        },
        [dispatch]
    );

    //#region Effects
    useEffectExceptOnMount(() => {
        const newQuery = parseQuery(location.search);
        setCurrentQuery(newQuery);
    }, [location.search]);
    useEffect(() => {
        searchTags(currentQuery);
    }, [currentQuery, searchTags]);
    //#endregion

    //#region Query related methods
    const updateQuery = useCallback(
        (newQuery: Partial<SettingsTagsQuery>) =>
            history.replace({
                ...location,
                search: stringifyQueryObject(newQuery),
            }),
        [history, location]
    );

    //#endregion

    //#region Column related methods
    const sortableColumns: {[column in NonNullable<TagQuery["ordering"]>]?: boolean} = useMemo(
        () => ({
            name: true,
        }),
        []
    );

    const onOrderingChange = useCallback(
        (newOrdering: Record<string, ColumnDirection> | null) => {
            if (!newOrdering) {
                updateQuery({
                    ordering: undefined,
                });
            } else {
                const orderField = Object.keys(newOrdering)[0];
                const descendingOrder = Object.values(newOrdering)[0] === "desc";
                updateQuery({
                    ordering: `${descendingOrder ? "-" : ""}${orderField}` as TagQuery["ordering"],
                });
            }
        },
        [updateQuery]
    );

    const getRowCellContent = (tag: TagData, columnName: string, index: number) => {
        switch (columnName) {
            case "name":
                return <Tag tag={tag} key={index} data-testid={`settings-tags-tag-${index}`} />;
            case "edit":
                return (
                    <Flex>
                        <Button
                            data-testid={`settings-tags-delete-${index}`}
                            variant="secondary"
                            mr={2}
                            onClick={() => {
                                setDeletingTag(tag);
                                openDeleteModal();
                            }}
                        >
                            <Icon name="delete" />
                        </Button>
                        <Button
                            data-testid={`settings-tags-edit-${index}`}
                            variant="secondary"
                            mr={2}
                            onClick={() => {
                                setSelectedTag(tag);
                                openAddEditTagModal();
                            }}
                        >
                            <Icon name="edit" />
                        </Button>
                    </Flex>
                );
            default:
                return tag[columnName as keyof TagData];
        }
    };
    //#endregion

    const onEndReached = useCallback(
        () => hasNextPage && !isLoading && searchTags(currentQuery, page + 1),
        [hasNextPage, isLoading, searchTags, currentQuery, page]
    );

    const renderDeleteModal = () => {
        const deleteSelection = deletingTag ? [deletingTag.pk] : (currentSelection as number[]);

        const renderDeleteModalBody = (deleteSelection: number[]) => {
            if (isLoading) {
                return <LoadingWheel noMargin />;
            }
            const tag_names = getSelectedItems(deleteSelection, tags)
                .map((tag) => tag.name)
                .join(", ");
            return (
                <Box>
                    <Text>
                        {t("settings.confirmDeleteTagMessage", {
                            smart_count: deleteSelection.length,
                            names: tag_names,
                        })}
                    </Text>
                    <Text>
                        {t("settings.confirmDeleteTag", {
                            smart_count: deleteSelection.length,
                        })}
                    </Text>
                </Box>
            );
        };

        return (
            <ConfirmationModal
                title={t("settings.deleteTagsTitle", {
                    smart_count: deleteSelection.length,
                })}
                confirmationMessage={renderDeleteModalBody(deleteSelection)}
                onClose={() => {
                    setDeletingTag(null);
                    closeDeleteModal();
                }}
                mainButton={{
                    onClick: () => deleteTags(deleteSelection, tags),
                    severity: "danger",
                    children: t("common.delete"),
                }}
                data-testid="settings-tags-delete-modal"
            />
        );
    };

    const getSelectedItems = (selection: number[], items: TagData[]) =>
        items.filter((item) => selection.includes(item.pk));

    const deleteTags = (selection: number[], items: TagData[]) => {
        const toDelete = getSelectedItems(selection, items);
        setDeletingTag(null);
        closeDeleteModal();
        Promise.all(toDelete.map((tag) => dispatch(fetchDeleteTag(tag)))).then(() => {
            dispatch(unselectAllRows("tags"));
            searchTags(currentQuery);
        });
    };

    return (
        <Box
            height="100%"
            style={{
                display: "grid",
                gridTemplateRows: "min-content min-content min-content 1fr",
            }}
        >
            <Flex justifyContent="space-between" mb={3}>
                <TabTitle title={getTabTranslations(SidebarTabNames.TAGS)} />
            </Flex>
            <Box mb={3}>
                <Callout>
                    {t("settings.tagsInformation.intro")}
                    <ul>
                        <li>{t("settings.tagsInformation.bp1")}</li>
                        <li>{t("settings.tagsInformation.bp2")}</li>
                        {/* TODO uncomment next <li> when the features "views" is available */}
                        {/* <li>{t("settings.tagsInformation.bp3")}</li> */}
                    </ul>
                </Callout>
            </Box>
            <ScrollableTableFixedHeader>
                <Flex alignItems="center">
                    <FilteringBar<SettingsTagsQuery>
                        data-testid="tags-filtering-bar"
                        filters={[]}
                        query={currentQuery as SettingsTagsQuery}
                        updateQuery={updateQuery}
                        resetQuery={{text: []}}
                        searchEnabled
                    />
                    <Box flexShrink={0} ml={3}>
                        <Button
                            key="newtag"
                            variant="primary"
                            onClick={() => {
                                setSelectedTag(null);
                                openAddEditTagModal();
                            }}
                            data-testid="tag-add-button"
                        >
                            <Icon mr={2} name="add" /> {t("settings.addTag")}
                        </Button>
                    </Box>
                </Flex>
                <Box pt={3} pb={2}>
                    <Flex justifyContent="space-between">
                        <Text>
                            {t("common.tags_countable", {
                                smart_count: totalTagsCount ?? 0,
                            })}
                        </Text>
                        <>
                            {!!currentSelection.length && (
                                <IconButton
                                    name="bin"
                                    label={t("common.delete")}
                                    key="deleteTag"
                                    onClick={openDeleteModal}
                                    ml={2}
                                />
                            )}
                        </>
                    </Flex>
                </Box>
            </ScrollableTableFixedHeader>
            <Table
                height="auto"
                columns={tagColumns}
                sortableColumns={sortableColumns}
                ordering={
                    currentQuery.ordering
                        ? {
                              [currentQuery.ordering.replace("-", "")]:
                                  currentQuery.ordering.includes("-") ? "desc" : "asc",
                          }
                        : undefined
                }
                withSelectableRows
                selectedRows={currentSelection.reduce(
                    (acc, uid) => {
                        acc[uid] = true;
                        return acc;
                    },
                    {} as Record<string, boolean>
                )}
                onSelectRow={onSelectTag}
                onSelectAllVisibleRows={onSelectAllVisibleTags}
                onOrderingChange={onOrderingChange}
                rows={tags}
                getRowId={(tag) => `${tag.pk}`}
                getRowKey={(tag) => `${tag.pk}`}
                getRowTestId={() => "tag-row"}
                getRowCellContent={getRowCellContent}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                onEndReached={onEndReached}
                data-testid="settings-tags-table"
            />
            {isDeleteModalOpened && renderDeleteModal()}
            {isTagModalOpen && (
                <TagModal
                    item={selectedTag}
                    onSubmit={() => searchTags(currentQuery)}
                    onClose={closeAddEditTagModal}
                />
            )}
        </Box>
    );
}

export default withRouter(SettingsTags);
