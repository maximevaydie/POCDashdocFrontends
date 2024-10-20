import {fetchSearch} from "@dashdoc/web-common";
import {t} from "@dashdoc/web-core";
import {Tag, TagQuery} from "dashdoc-utils";

import {tagSchema} from "../schemas";

import {fetchAdd, fetchDelete, fetchUpdate} from "./base-actions";

export function fetchAddTag(tag: Tag | any) {
    return fetchAdd(
        "tags",
        "tag",
        tag,
        t("settings.tagSuccessfullyAdded"),
        t("common.error"),
        "web"
    );
}

export function fetchUpdateTag(tag: Tag | any) {
    return fetchUpdate(
        "tags",
        "tag",
        tag,
        tag.pk,
        t("settings.tagSuccessfullyEdited"),
        undefined,
        "web"
    );
}

export function fetchSearchTags(queryName: string, query: TagQuery, page: number) {
    return fetchSearch("tags", "tags", tagSchema, queryName, query, page, "web");
}

export function fetchDeleteTag(tag: Tag | any) {
    return fetchDelete("tags", "tag", tag, t("settings.tagSuccessfullyDeleted"), undefined, "web");
}
