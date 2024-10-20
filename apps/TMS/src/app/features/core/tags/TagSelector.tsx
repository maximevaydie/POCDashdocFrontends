import {apiService} from "@dashdoc/web-common";
import {Logger, t} from "@dashdoc/web-core";
import {
    AsyncPaginatedCreatableSelect,
    Flex,
    Icon,
    FiltersSelectAsyncPaginatedProps,
    theme,
} from "@dashdoc/web-ui";
import {Tag} from "@dashdoc/web-ui";
import {Tag as TagData, yup} from "dashdoc-utils";
import React, {useCallback} from "react";

type TagSelectorProps = {
    errorMessage?: string;
    "data-testid"?: string;
    tags: TagData[];
    onChange: (value: TagData | string) => void;
    onBlur: () => void;
};

export type NewTag = {
    label?: string;
    value?: string;
    __isNew__: true;
};

const tagValidationSchema = yup.object().shape({
    name: yup.string().min(2).max(40),
});

export const TagSelector: React.VFC<TagSelectorProps> = ({
    errorMessage,
    onChange,
    tags,
    onBlur,
}) => {
    const loadItemsOptions: FiltersSelectAsyncPaginatedProps["loadOptions"] = async (
        text: string,
        _,
        {page}: {page: number}
    ): Promise<{
        options: (TagData | NewTag)[];
        hasMore: boolean | undefined;
        additional?: {page: number};
    }> => {
        try {
            const {results, next} = await apiService.Tags.getAll({query: {text, page}});
            const items = results ?? [];
            const options: TagData[] = items.filter(
                (item: TagData) => !tags.find((tag) => tag.pk === item.pk)
            );

            return {
                options,
                hasMore: next != null,
                additional: {
                    page: page + 1,
                },
            };
        } catch (error) {
            Logger.error(error);
            return {
                options: [],
                hasMore: undefined,
            };
        }
    };

    const getOptionLabel = useCallback((tag: TagData | NewTag) => {
        if ("__isNew__" in tag) {
            return tag.value ?? "";
        } else {
            return (tag as TagData).name;
        }
    }, []);
    const getOptionValue = useCallback((tag: TagData | NewTag) => {
        if ("__isNew__" in tag) {
            return tag.value ?? "";
        } else {
            return (tag as TagData).pk.toString();
        }
    }, []);
    const formatOptionLabel = (tag: TagData | NewTag) => {
        return (
            <>
                {"__isNew__" in tag ? (
                    <Flex alignItems="center">
                        <Icon name="add" mr={1} />
                        {t("common.add")} {tag.value}
                    </Flex>
                ) : (
                    <Tag tag={tag as TagData} />
                )}
            </>
        );
    };
    const handleOnChange = (tag: TagData) => {
        onChange(tag);
    };

    const handleOnCreate = (value: string) => {
        onChange(value);
    };

    const isValidNewTag = (newTagName: string, _$: unknown, options: Array<TagData>) => {
        for (const option of options) {
            if (option.name === newTagName) {
                return false;
            }
        }
        return tagValidationSchema.isValidSync({name: newTagName});
    };

    return (
        <AsyncPaginatedCreatableSelect
            defaultOptions
            styles={{
                option: (provided: any) => ({
                    ...provided,
                    color: theme.colors.blue.dark,
                    backgroundColor: "white",
                    width: "calc(100% - 16px)",
                    margin: "8px",
                    borderRadius: "4px",
                    "&:hover": {
                        cursor: "pointer",
                        backgroundColor: theme.colors.blue.light,
                    },
                }),
            }}
            data-testid="tag-async-paginated-creatable-select"
            isClearable={false}
            loadOptions={loadItemsOptions}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            formatOptionLabel={formatOptionLabel}
            debounceTimeout={300}
            onChange={handleOnChange}
            onCreateOption={handleOnCreate}
            error={errorMessage}
            isValidNewOption={isValidNewTag}
            autoFocus={true}
            onBlur={onBlur}
        />
    );
};
